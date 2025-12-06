import { Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { Movie, MovieDocument } from '../movies/schemas/movie.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MailService } from '../mail/mail.service';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    @InjectModel(Movie.name) private movieModel: SoftDeleteModel<MovieDocument>,
    private mailService: MailService,
  ) {
    const ffmpegPath =
      'D:\\ffmpeg\\ffmpeg-2025-12-01-git-7043522fe0-full_build\\bin\\ffmpeg.exe';
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  async processVideoAndLinkToMovie(
    inputPath: string,
    fileId: string,
    movieId: string,
    userEmail: string,
  ) {
    // Kiểm tra file input có tồn tại không
    if (!fs.existsSync(inputPath)) {
      this.logger.error(`File input không tồn tại: ${inputPath}`);
      throw new Error(`Input file not found: ${inputPath}`);
    }

    this.logger.log(`Input file: ${inputPath}`);
    this.logger.log(`File size: ${fs.statSync(inputPath).size} bytes`);

    // 1. Tạo đường dẫn output
    const outputDir = path.join(process.cwd(), 'storage', 'videos', fileId);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const m3u8Path = path.join(outputDir, 'master.m3u8');
    const segmentPath = path.join(outputDir, 'segment-%03d.ts');

    this.logger.log(`Bắt đầu xử lý phim cho MovieID: ${movieId}`);
    this.logger.log(`Output directory: ${outputDir}`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          // '-c:v libx264',
          // '-c:a aac',
          // '-b:v 2000k',
          // '-b:a 128k',
          // '-hls_time 10',
          // '-hls_list_size 0',
          // '-f hls',
          '-c:v libx264',
          '-crf 18', // 0-51, 18 = chất lượng rất cao (gần lossless)
          '-preset slow', // slow/slower = chất lượng tốt nhất (encode lâu hơn)
          '-profile:v high', // High profile cho chất lượng tốt nhất
          '-level 4.1', // Compatibility level
          '-pix_fmt yuv420p', // Pixel format tương thích

          // Audio codec settings - CHẤT LƯỢNG CAO
          '-c:a aac',
          '-b:a 192k', // Audio bitrate cao (thay vì 128k)
          '-ar 48000', // Sample rate 48kHz

          // HLS settings
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_flags independent_segments', // Tối ưu cho seeking
          '-f hls',
        ])
        .addOption('-hls_segment_filename', segmentPath) // Dùng addOption thay vì outputOptions
        .output(m3u8Path)
        .on('start', (commandLine) => {
          this.logger.log('FFmpeg command: ' + commandLine);
        })
        .on('progress', (progress) => {
          this.logger.log(`Processing: ${progress.percent}% done`);
        })
        .on('end', async () => {
          this.logger.log('FFmpeg convert xong. Đang lưu vào DB...');

          const playlistUrl = `/public/videos/${fileId}/master.m3u8`;

          try {
            await this.movieModel.findByIdAndUpdate(movieId, {
              videoUrl: playlistUrl,
            });

            this.logger.log(`Đã cập nhật link phim cho Movie: ${movieId}`);
            this.mailService.sendSuccessUploadMovie(userEmail, {
              name: userEmail,
              movieId,
            });

            // Xóa file gốc
            fs.unlinkSync(inputPath);

            resolve(playlistUrl);
          } catch (dbErr) {
            this.logger.error('Lỗi lưu DB:', dbErr);
            reject(dbErr);
          }
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error('Lỗi FFmpeg:', err.message);
          reject(err);
        })
        .run();
    });
  }
}

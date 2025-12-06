import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path/win32';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('test-ffmpeg')
  triggerTest() {
    // return this.videoService.convertToHls();
  }

  @Post('upload/:movieId')
  @ResponseMessage('Upload video thành công')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './storage/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `video-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          return cb(
            new BadRequestException('Only video files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024 * 1024, // 5GB max
      },
    }),
  )
  async uploadVideo(
    @Param('movieId') movieId: string,
    @UploadedFile() file: Express.Multer.File,
    @User() user: IUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Lấy fileId từ tên file (bỏ extension)
    const fileId = file.filename.replace(extname(file.filename), '');

    // Xử lý video background (không chờ)
    await this.videoService
      .processVideoAndLinkToMovie(file.path, fileId, movieId, user.email)
      .catch((err) => console.error('Video processing error:', err));

    return {
      fileId,
      movieId,
      filename: file.filename,
    };
  }
}

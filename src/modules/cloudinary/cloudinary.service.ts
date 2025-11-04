import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string, folder: string): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
          `${folder}/${publicId}`,
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
      });
    } catch (error) {
      throw error;
    }
  }
}

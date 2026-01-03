import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload failed'));
            }
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
    maxImages = 5,
  ): Promise<{ public_id: string; url: string }[]> {
    if (files.length > maxImages) {
      throw new Error(` max images ${maxImages} `);
    }

    const uploadPromises = files.map(
      (file) =>
        new Promise<{ public_id: string; url: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder,
                resource_type: 'auto',
              },
              (
                error: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined,
              ) => {
                if (error || !result) {
                  return reject(error || new Error('Cloudinary upload failed'));
                }
                resolve({
                  public_id: result.public_id,
                  url: result.secure_url,
                });
              },
            )
            .end(file.buffer);
        }),
    );

    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<{ result: string }> {
    return cloudinary.uploader.destroy(publicId);
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    for (const id of publicIds) {
      try {
        await this.deleteImage(id);
      } catch (err) {
        console.error(`❌ Failed to delete image ${id}`, err);
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    propertyCode?: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        width: 1200,
      };

      // Agregar overlay de texto discreto
     if (propertyCode) {
  uploadOptions.transformation = [
    { width: 1200, crop: 'scale' },
    {
      overlay: `text:Arial_22:${encodeURIComponent('id-' +propertyCode)},co_white`,
      gravity: 'south',
      y: 50,
      x: -390,
      opacity: 90,
    },
  ];
} else {
  uploadOptions.width = 1200;
}


      const upload = v2.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  async deleteImage(publicId) {
    await v2.uploader.destroy(publicId);
  }
}

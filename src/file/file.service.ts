import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

interface CloudinaryResponse {
  url: string;
  publicId: string;
}

@Injectable()
export class FileService {
  constructor(private cloudinary: CloudinaryService) {}

  async uploadImageToCloudinary(
    files: Express.Multer.File[], 
    propertyCode?: string
  ): Promise<CloudinaryResponse[]> {
    console.log('📁 FILE SERVICE DEBUG - Starting image upload process');
    console.log('📸 Files to upload:', files.length);
    
    if (files.length === 0) {
      console.error('❌ No files provided');
      throw new BadRequestException('missing images');
    }
    
    console.log('🔍 Validating file types...');
    files.forEach((file, index) => {
      console.log(`📸 File ${index + 1} validation:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        isImage: file.mimetype.includes('image')
      });
      
      if (!file.mimetype.includes('image')) {
        console.error(`❌ Invalid file type for ${file.originalname}: ${file.mimetype}`);
        throw new BadRequestException(`Invalid file type: ${file.originalname}`);
      }
    });
    console.log('✅ All files validated successfully');

    const images: CloudinaryResponse[] = [];

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`☁️ Uploading file ${i + 1}/${files.length}: ${file.originalname}`);
        
        try {
          const response = await this.cloudinary.uploadImage(file, propertyCode);
          
          if (response) {
            console.log(`✅ File ${i + 1} uploaded successfully:`, {
              filename: file.originalname,
              url: response.secure_url,
              publicId: response.public_id
            });
            
            images.push({
              url: response.secure_url,
              publicId: response.public_id,
            });
          } else {
            console.error(`❌ No response for file ${i + 1}: ${file.originalname}`);
          }
        } catch (e) {
          console.error(`❌ Upload failed for file ${i + 1} (${file.originalname}):`, e);
          throw new BadRequestException(`Failed to upload ${file.originalname}: ${e.message || 'Invalid file type'}`);
        }
      }
    }

    console.log(`✅ All uploads completed successfully. Total: ${images.length} images`);
    return images;
  }
}
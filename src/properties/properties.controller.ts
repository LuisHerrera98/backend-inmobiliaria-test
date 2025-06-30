import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FileService } from '../file/file.service';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body(ValidationPipe) createPropertyDto: CreatePropertyDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    console.log('🏠 PROPERTY CREATE DEBUG - Starting property creation');
    console.log('📋 Property data:', createPropertyDto);
    console.log('📸 Images received:', images?.length || 0);
    
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        console.log(`📸 Image ${index + 1}:`, {
          originalname: image.originalname,
          mimetype: image.mimetype,
          size: image.size,
          sizeInMB: (image.size / (1024 * 1024)).toFixed(2) + ' MB'
        });
      });
    }

    try {
      console.log('💾 Creating property in database...');
      const property = await this.propertiesService.create(createPropertyDto);
      console.log('✅ Property created with ID:', (property as any)._id);

      if (images && images.length > 0) {
        console.log('☁️ Starting image upload to Cloudinary...');
        const propertyCode = property.code.toString();
        
        try {
          const imagesArray = await this.fileService.uploadImageToCloudinary(
            images,
            propertyCode,
          );
          console.log('✅ Images uploaded successfully:', imagesArray.length);
          
          const propertyId = (property as any)._id.toString();
          const updatedProperty = await this.propertiesService.update(propertyId, {
            images: imagesArray.map((img) => img.url),
          });
          console.log('✅ Property updated with image URLs');
          return updatedProperty;
        } catch (uploadError) {
          console.error('❌ IMAGE UPLOAD ERROR:', uploadError);
          throw uploadError;
        }
      }

      console.log('✅ Property created without images');
      return property;
    } catch (error) {
      console.error('❌ PROPERTY CREATION ERROR:', error);
      throw error;
    }
  }

  @Get()
  findAll(@Query() query: any) {
    return this.propertiesService.findAll(query);
  }

  @Get('featured')
  getFeatured() {
    return this.propertiesService.getFeatured();
  }

  @Get('ubicaciones/list')
  getUbicaciones() {
    return this.propertiesService.getUbicaciones();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    if (images && images.length > 0) {
      const property = await this.propertiesService.findOne(id);
      const propertyCode = property.code.toString();
      const imagesArray = await this.fileService.uploadImageToCloudinary(
        images,
        propertyCode,
      );
      updatePropertyDto.images = imagesArray.map((img) => img.url);
    }

    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 10))
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.propertiesService.uploadImages(id, files);
  }

  @Delete(':id/images')
  removeImage(@Param('id') id: string, @Query('imageUrl') imageUrl: string) {
    return this.propertiesService.removeImage(id, imageUrl);
  }
}

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

@Controller('V1/properties')
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
    const property = await this.propertiesService.create(createPropertyDto);

    if (images && images.length > 0) {
      const propertyCode = property.code.toString();
      const imagesArray = await this.fileService.uploadImageToCloudinary(
        images,
        propertyCode,
      );
      const propertyId = (property as any)._id.toString();
      return this.propertiesService.update(propertyId, {
        images: imagesArray.map((img) => img.url),
      });
    }

    return property;
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

import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  providers: [FileService],
  imports: [CloudinaryModule],
  exports: [FileService],
})
export class FileModule {}
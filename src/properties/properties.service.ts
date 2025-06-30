import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const lastProperty = await this.propertyModel.findOne(
      {},
      {},
      { sort: { code: -1 } },
    );

    const nextCode = lastProperty?.code ? lastProperty.code + 1 : 1;

    const createdProperty = new this.propertyModel({
      ...createPropertyDto,
      code: nextCode,
    });

    return createdProperty.save();
  }

  async findAll(query?: any): Promise<{
    data: Property[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: any = { isActive: true };

    // Parámetros de paginación
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    // Filtros simples
    if (query?.minPrecioARS || query?.maxPrecioARS) {
      filter.precioARS = {};
      if (query.minPrecioARS)
        filter.precioARS.$gte = Number(query.minPrecioARS);
      if (query.maxPrecioARS)
        filter.precioARS.$lte = Number(query.maxPrecioARS);
    }

    if (query?.minPrecioUSD || query?.maxPrecioUSD) {
      filter.precioUSD = {};
      if (query.minPrecioUSD)
        filter.precioUSD.$gte = Number(query.minPrecioUSD);
      if (query.maxPrecioUSD)
        filter.precioUSD.$lte = Number(query.maxPrecioUSD);
    }

    if (query?.habitaciones) {
      filter.habitaciones = Number(query.habitaciones);
    }

    if (query?.ambientes) {
      filter.ambientes = Number(query.ambientes);
    }

    if (query?.aceptaMascotas !== undefined) {
      filter.aceptaMascotas = query.aceptaMascotas === 'true';
    }

    if (query?.tipoOperacion) {
      filter.tipoOperacion = query.tipoOperacion;
    }

    if (query?.ubicacion) {
      filter.ubicacion = { $regex: query.ubicacion.toUpperCase(), $options: 'i' };
    }

    const sortOptions: any = {};
    if (query?.sortBy) {
      switch (query.sortBy) {
        case 'precio_ars_asc':
          sortOptions.precioARS = 1;
          break;
        case 'precio_ars_desc':
          sortOptions.precioARS = -1;
          break;
        case 'precio_usd_asc':
          sortOptions.precioUSD = 1;
          break;
        case 'precio_usd_desc':
          sortOptions.precioUSD = -1;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    } else {
      sortOptions.createdAt = -1;
    }

    // Ejecutar consultas en paralelo para mejor rendimiento
    const [data, total] = await Promise.all([
      this.propertyModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.propertyModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyModel.findById(id).exec();
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.propertyModel.findById(id).exec();

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Si hay nuevas imágenes, agregarlas al array existente
    if (updatePropertyDto.images && updatePropertyDto.images.length > 0) {
      const existingImages = property.images || [];
      updatePropertyDto.images = [
        ...existingImages,
        ...updatePropertyDto.images,
      ];
    }

    const updatedProperty = await this.propertyModel
      .findByIdAndUpdate(id, updatePropertyDto, { new: true })
      .exec();

    return updatedProperty;
  }

  async remove(id: string): Promise<void> {
    const property = await this.propertyModel.findById(id).exec();
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Eliminar imágenes de Cloudinary
    if (property.images && property.images.length > 0) {
      for (const imageUrl of property.images) {
        // Extraer public_id de la URL de Cloudinary
        const publicId = this.extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }
    }

    await this.propertyModel.findByIdAndDelete(id).exec();
  }

  async uploadImages(
    id: string,
    files: Express.Multer.File[],
  ): Promise<Property> {
    const property = await this.findOne(id);

    // Necesitarías inyectar FileService aquí también si quieres usar este método
    // Por ahora, mantengamos la lógica en el controller
    const uploadPromises = files.map((file) =>
      this.cloudinaryService.uploadImage(file),
    );

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    const updatedImages = [...(property.images || []), ...imageUrls];

    return this.update(id, { images: updatedImages });
  }

  async removeImage(id: string, imageUrl: string): Promise<Property> {
    const property = await this.findOne(id);

    // Extraer public_id y eliminar de Cloudinary
    const publicId = this.extractPublicIdFromUrl(imageUrl);
    if (publicId) {
      await this.cloudinaryService.deleteImage(publicId);
    }

    // Remover de la base de datos
    const updatedImages = property.images.filter((img) => img !== imageUrl);

    return this.update(id, { images: updatedImages });
  }

  async getFeatured(): Promise<Property[]> {
    return this.propertyModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .exec();
  }

  async getUbicaciones(): Promise<string[]> {
    const ubicaciones = await this.propertyModel
      .distinct('ubicacion', { isActive: true })
      .exec();
    return ubicaciones.sort();
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return filename.split('.')[0];
    } catch (error) {
      return null;
    }
  }
}

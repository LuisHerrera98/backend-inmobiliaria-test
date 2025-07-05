import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId, isActive: true }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    // Validar que el ID sea un ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID format: ${id}`);
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOrCreate(userData: CreateUserDto): Promise<UserDocument> {
    let user = await this.findByGoogleId(userData.googleId);
    
    if (!user) {
      user = await this.create(userData);
    } else {
      // Actualizar información si es necesario
      user.name = userData.name;
      user.email = userData.email;
      if (userData.picture) {
        user.picture = userData.picture;
      }
      await user.save();
    }
    
    return user;
  }

  async addFavoriteProperty(userId: string, propertyId: string): Promise<UserDocument> {
    // Validar que el propertyId sea un ObjectId válido
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestException(`Invalid property ID format: ${propertyId}`);
    }

    const user = await this.findById(userId);
    
    if (!user.favoriteProperties.includes(propertyId)) {
      user.favoriteProperties.push(propertyId);
      await user.save();
    }
    
    return user;
  }

  async removeFavoriteProperty(userId: string, propertyId: string): Promise<UserDocument> {
    // Validar que el propertyId sea un ObjectId válido
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestException(`Invalid property ID format: ${propertyId}`);
    }

    const user = await this.findById(userId);
    
    user.favoriteProperties = user.favoriteProperties.filter(
      id => id !== propertyId
    );
    await user.save();
    
    return user;
  }

  async getFavoriteProperties(userId: string): Promise<string[]> {
    const user = await this.findById(userId);
    return user.favoriteProperties;
  }
}
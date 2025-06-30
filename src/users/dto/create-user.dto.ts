import { IsEmail, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsString()
  googleId: string;

  @IsOptional()
  @IsArray()
  favoriteProperties?: string[];
}
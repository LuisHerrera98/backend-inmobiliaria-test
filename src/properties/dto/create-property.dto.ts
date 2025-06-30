import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePropertyDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  descripcion: string;

  @IsString()
  direccion: string;

  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  ubicacion: string;

  @IsOptional()
  @IsString()
  requisitos?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  aceptaMascotas?: boolean;

  @IsNumber()
  @Type(() => Number)
  precioARS: number;

  @IsNumber()
  @Type(() => Number)
  precioUSD: number;

  @IsNumber()
  @Type(() => Number)
  expensas: number;

  @IsNumber()
  @Type(() => Number)
  habitaciones: number;

  @IsNumber()
  @Type(() => Number)
  banos: number;

  @IsNumber()
  @Type(() => Number)
  ambientes: number;

  @IsOptional()
  @IsString()
  @IsIn(['venta', 'alquiler'])
  tipoOperacion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

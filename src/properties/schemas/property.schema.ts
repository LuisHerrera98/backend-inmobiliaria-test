import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true })
  titulo: string;

  @Prop({ type: Number, unique: true })
  code: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  direccion: string;

  @Prop({ default: false })
  aceptaMascotas: boolean;

  @Prop({ required: true })
  precioARS: number;

  @Prop({ required: true })
  precioUSD: number;

  @Prop({ required: true })
  expensas: number;

  @Prop({ required: true })
  habitaciones: number;

  @Prop({ required: true })
  banos: number;

  @Prop({ required: true })
  ambientes: number;

  @Prop({ required: true, enum: ['venta', 'alquiler'], default: 'alquiler' })
  tipoOperacion: string;

  @Prop({ type: [String], default: [] })
  images: string[]; // URLs de Cloudinary

  @Prop({ default: true })
  isActive: boolean;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

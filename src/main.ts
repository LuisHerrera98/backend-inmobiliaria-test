import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend - MÁS PERMISIVO
  app.enableCors({
    origin: [
      'http://localhost:3005', // Frontend Next.js en puerto 3005
      'http://localhost:3001', // Next.js dev backup
      'http://localhost:3000', // React dev  
      'http://localhost:3002', // Por si acaso
      'https://inmobiliaria.alfastoreargentina.link', // Frontend en producción
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3004;
  await app.listen(port);
  
  console.log(`🚀 Server running on http://localhost:${port}/api`);
}
bootstrap();
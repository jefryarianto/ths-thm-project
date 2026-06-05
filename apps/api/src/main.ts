import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { helmetConfig } from './helmet.config.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Trust Proxy (required when behind reverse proxy like Nginx, Cloudflare) ──
  // Default to 0 (no proxy trust) for local dev; set TRUST_PROXY=1 in production
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || 0);

  app.setGlobalPrefix('api/v1');

  // ── Security Headers ──
  app.use(helmet(helmetConfig));

  // ── CORS ──
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // ── Response Compression ──
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('THS-THM Management System API')
    .setDescription('API documentation for THS-THM Member Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Anggota', 'Member management')
    .addTag('Claim', 'Membership claim workflow')
    .addTag('Organisasi', 'Organization structure')
    .addTag('Kegiatan', 'Activities management')
    .addTag('Latihan', 'Training session reports')
    .addTag('Absensi', 'Attendance tracking')
    .addTag('Iuran', 'Dues management')
    .addTag('Pendadaran', 'Initiation/examination')
    .addTag('Dokumen', 'Document generation (kartu, sertifikat, piagam)')
    .addTag('Konten', 'Content management & approval')
    .addTag('Pustaka', 'Digital library')
    .addTag('Surat', 'Mail management')
    .addTag('Audit', 'Audit logs')
    .addTag('Notifications', 'Push notifications')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  console.log(`🚀 THS-THM API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();

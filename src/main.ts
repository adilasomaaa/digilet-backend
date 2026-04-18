import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';


async function bootstrap() {
  const cors = require('cors');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5173','http://localhost:4173', 'http://172.16.0.221:3000','https://digilet-fai.umgo.ac.id','https://digilet-fai.umgo.ac.id/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, Access-Control-Allow-Private-Network',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use((req:any, res:any, next:any) => {
    res.header('Access-Control-Allow-Private-Network', 'true');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('DIGILET')
    .setDescription('Dokumentasi API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);

  fs.writeFileSync(
    join(__dirname, '..', 'swagger.json'),
    JSON.stringify(documentFactory, null, 2),
  );
  SwaggerModule.setup('api/docs', app, documentFactory);
  app.useStaticAssets(join(process.cwd(), 'public'));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

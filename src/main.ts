import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Twitter Scraper API')
    .setDescription('API documentation for Twitter scraping service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configure Templating Engine
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  hbs.registerHelper('eq', (a: any, b: any) => a === b);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

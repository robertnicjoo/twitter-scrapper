import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Image } from './entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [Post, Image], // Include your entities
      synchronize: true, // Automatically synchronize tables (use with caution in production)
      logging: false, // Enable SQL logging
    }),
    TypeOrmModule.forFeature([Post, Image]), // Make entities available in this module
  ],
  exports: [TypeOrmModule], // Export TypeOrmModule so it's available globally
})
export class DatabaseModule {}

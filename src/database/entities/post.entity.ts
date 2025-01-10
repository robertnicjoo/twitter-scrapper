import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Image } from './image.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tweetId: string; // Unique identifier for the tweet

  @Column()
  text: string;

  @Column({ nullable: true })
  videoUrl: string;

  @OneToMany(() => Image, (image) => image.post, { cascade: true })
  images: Image[];
}

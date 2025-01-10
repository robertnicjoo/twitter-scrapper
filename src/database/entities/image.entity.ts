import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  localPath: string;

  @ManyToOne(() => Post, (post) => post.images)
  post: Post;
}

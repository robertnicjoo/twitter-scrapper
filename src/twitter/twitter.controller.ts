import { Controller, Get, Query } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('posts')
export class TwitterController {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  @Get()
  async getPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    console.log(`Fetching posts for page ${page} with limit ${limit}`);
    const posts = await this.postRepository.find({ relations: ['images'] });
    console.log(`Fetched ${posts.length} posts`);
    return { data: posts, total: posts.length };
    // const [posts, count] = await this.postRepository.findAndCount({
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   relations: ['images'],
    // });
    // return { data: posts, total: count };
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { TwitterService } from '../twitter/twitter.service';
import { EmailService } from '../email/email.service';
import * as fs from 'fs';
import * as path from 'path';
import { Post } from '../database/entities/post.entity';

@Injectable()
export class CronService implements OnModuleInit {
  constructor(
    private readonly twitterService: TwitterService,
    private readonly emailService: EmailService,
    @InjectRepository(Post) private postRepository: Repository<Post>, // Inject the Post repository
  ) {}

  async onModuleInit() {
    await this.handleCron();
  }

  @Cron(process.env.CRON_SCHEDULE || '0 * * * *')
  async handleCron() {
    console.log('Cron job started...');

    const twitterUserName = process.env.TWITTER_USERNAME; // Fetch USERNAME from environment variable
    if (!twitterUserName) {
      console.error('TWITTER_USERNAME environment variable not set');
      return;
    }

    try {
      const tweets =
        await this.twitterService.getUserTweetsFromUserName(twitterUserName);

      for (const tweet of tweets.data) {
        // Check if the tweet already exists in the database
        const exists = await this.postRepository.findOne({
          where: { tweetId: tweet.id },
        });
        if (exists) {
          console.log(`Tweet with ID ${tweet.id} already exists. Skipping.`);
          continue; // Skip if the tweet already exists
        }

        const post = {
          tweetId: tweet.id, // Add the unique identifier
          text: tweet.text,
          videoUrl: tweet.attachments?.media_keys
            ? this.getVideoUrl(tweet)
            : null,
          images: await this.mapImages(tweet), // Now awaiting the download
        };

        try {
          await this.savePostToDatabase(post);
          console.log('Post saved:', post);
        } catch (error) {
          console.error('Error saving post:', error);
        }
      }

      const tweetsWithVideo = tweets.data.filter(
        (tweet) => tweet.attachments?.media_keys,
      );
      if (tweetsWithVideo.length > 0) {
        const videoTweet = tweetsWithVideo[0];
        await this.sendEmailNotification(videoTweet);
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
    }
  }

  private getVideoUrl(tweet) {
    if (tweet.attachments?.media_keys) {
      return `https://twitter.com/i/web/status/${tweet.id}`;
    }
    return null;
  }

  private async mapImages(tweet) {
    const imageUrls =
      tweet.attachments?.media_keys?.map((mediaKey) => {
        return `https://twitter.com/i/media/${mediaKey}`;
      }) || [];

    // Download and save images, return their local paths
    return await this.downloadImages(imageUrls);
  }

  private async sendEmailNotification(videoTweet: any): Promise<void> {
    const subject = 'New Tweet with Video Detected';
    const body = `A new tweet with video was detected:\n\nTweet Text: ${videoTweet.text}\nVideo URL: ${videoTweet.videoUrl}`;
    await this.emailService.sendEmail(subject, body, process.env.EMAIL_USER);
  }

  private async savePostToDatabase(post: any) {
    console.log('Saving post to database', post);

    try {
      // Create a new Post entity instance and map the data
      const newPost = this.postRepository.create({
        tweetId: post.tweetId, // Include the unique identifier
        text: post.text,
        videoUrl: post.videoUrl || null,
        images: post.images || [],
      });

      // Save the post to the database
      await this.postRepository.save(newPost);
      console.log('Post saved successfully');
    } catch (error) {
      console.error('Error saving post to database', error);
      throw new Error('Failed to save post');
    }
  }

  async downloadImages(imageUrls: string[]): Promise<string[]> {
    // Ensure the 'public/images' directory exists
    const publicDir = path.join(__dirname, '..', '..', 'public');
    const imagesDir = path.join(publicDir, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true }); // Create 'public/images' directory if it doesn't exist
    }

    const savedPaths: string[] = [];
    for (const url of imageUrls) {
      const filename = path.basename(url);
      const filePath = path.join(imagesDir, filename);

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      savedPaths.push(`/images/${filename}`); // Store relative path for static serving
    }
    return savedPaths;
  }
}

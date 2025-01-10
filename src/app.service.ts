import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { title: string; message: string; route: string } {
    return {
      title: 'Twitter Scraper',
      message: 'Welcome to the Twitter scraping service!',
      route: 'home',
    };
  }
  getInfo(): { title: string; message: string; route: string } {
    return {
      title: 'About This Service',
      message: `This is a Twitter Scraper service that automatically fetches tweets from a specified Twitter account and stores relevant information in a database. You can use this service to stay up-to-date with specific accounts, process tweets, and download media associated with them.

      Built by: Robert Nicjoo, a passionate software developer.
      If you have any questions, feedback, or want to collaborate, feel free to reach out!
      
      Contact me at: [robert { at } irando.co.id]`,
      route: 'info',
    };
  }
}

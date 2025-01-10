import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { DatabaseModule } from './database/database.module'; // Import DatabaseModule
import { TwitterController } from './twitter/twitter.controller'; // Import TwitterController
import { EmailService } from './email/email.service'; // Import EmailService
import { CronService } from './scraper/cron.service'; // Import CronService
import { ScheduleModule } from '@nestjs/schedule';
import { TwitterService } from './twitter/twitter.service'; // Adjust the path as needed

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load environment variables globally
    ScheduleModule.forRoot(),
    DatabaseModule, // Import the DatabaseModule you created
  ],
  controllers: [
    AppController,
    TwitterController, // Add the TwitterController here
  ],
  providers: [
    AppService,
    EmailService,
    CronService, // Add CronService here
    TwitterService,
  ],
})
export class AppModule {}

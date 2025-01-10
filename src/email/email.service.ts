import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendEmail(subject: string, body: string, to: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
    });
  }
}

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // أو أي SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    return this.transporter.sendMail({
      from: `"Mafqood App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
  }
}

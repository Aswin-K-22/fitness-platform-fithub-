import { IEmailService } from '../../app/providers/email.service';
import * as nodemailer from 'nodemailer';

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(options: { from: string; to: string; subject: string; text: string }): Promise<void> {
    await this.transporter.sendMail(options);
  }
}
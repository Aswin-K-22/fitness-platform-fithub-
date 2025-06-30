export interface IEmailService {
  sendMail(options: { from: string; to: string; subject: string; text: string }): Promise<void>;
}
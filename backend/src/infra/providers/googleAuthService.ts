import { IGoogleAuthService } from '../../app/providers/googleAuth.service';
import { OAuth2Client } from 'google-auth-library';

export class GoogleAuthService implements IGoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CALLBACK_URL,
    });
  }

  async verifyCode(code: string): Promise<{ email: string; name?: string }> {
    const { tokens } = await this.client.getToken({ code });
    if (!tokens.id_token) {
      throw new Error('No ID token received from Google');
    }

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google token: Email is missing');
    }

    return { email: payload.email, name: payload.name };
  }
}
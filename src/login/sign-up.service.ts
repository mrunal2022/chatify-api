import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SignUpService {
    private client = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));

    constructor(private jwtService: JwtService, private configService: ConfigService) {}

    async verifyGoogleToken(credential: string) {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: credential,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID')
            });

            const payload = ticket.getPayload();
            if (!payload) throw new UnauthorizedException('Invalid Google Token');

            return {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            };
        } catch (error) {
            throw new UnauthorizedException('Token verification failed');
        }
    }

    async signUpWithGoogle(credential: string) {
        const user = await this.verifyGoogleToken(credential);
        const token = this.jwtService.sign({ email: user.email, name: user.name });
        return { token, user };
    }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private verifier: any;

  private getVerifier() {
    if (!this.verifier) {
      this.verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.COGNITO_USER_POOL_ID!,
        tokenUse: 'access',
        clientId: process.env.COGNITO_CLIENT_ID!,
      });
    }
    return this.verifier;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.getVerifier().verify(token);
      request.user = {
        sub: payload.sub,
        email: payload['email'] ?? payload['cognito:username'],
        username: payload['cognito:username'],
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

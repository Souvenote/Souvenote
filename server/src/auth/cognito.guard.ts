import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

const STARTER_IMAGE_CREDITS = 25;
const STARTER_SONG_CREDITS = 100;

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private verifier?: ReturnType<typeof CognitoJwtVerifier.create>;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private async ensureUserRecord(sub: string, email: string, username: string) {
    const existingUser = await this.usersRepository.findOne({
      where: { id: sub },
    });

    if (existingUser) {
      let shouldSave = false;

      if (existingUser.email !== email) {
        existingUser.email = email;
        shouldSave = true;
      }

      if (!existingUser.displayName && username) {
        existingUser.displayName = username;
        shouldSave = true;
      }

      if (shouldSave) {
        await this.usersRepository.save(existingUser);
      }

      return existingUser;
    }

    const user = this.usersRepository.create({
      id: sub,
      email,
      passwordHash: 'cognito-managed-user',
      displayName: username,
      imageCreditBalance: STARTER_IMAGE_CREDITS,
      songCreditBalance: STARTER_SONG_CREDITS,
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  private getVerifier() {
    if (this.verifier) {
      return this.verifier;
    }

    const userPoolId = this.configService.get<string>('COGNITO_USER_POOL_ID');
    const clientId = this.configService.get<string>('COGNITO_CLIENT_ID');

    if (!userPoolId || !clientId) {
      throw new InternalServerErrorException(
        'Cognito is not configured. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID in server/.env.',
      );
    }

    this.verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: 'access',
      clientId,
    });

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
      const username = String(payload['cognito:username']);
      const email = String(payload['email'] ?? username);

      await this.ensureUserRecord(payload.sub, email, username);

      request.user = {
        sub: payload.sub,
        email,
        username,
      };

      return true;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

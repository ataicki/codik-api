import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { MinioService } from 'nestjs-minio-s3';

import { UsersService } from '@modules/users/users.service';
import { SignUpDto } from '@modules/authentication/dtos/sign-up.dto';
import { SignInDto } from '@modules/authentication/dtos/sign-in.dto';
import { EnvService } from '@/src/infra/env/env.service';
import { AccessPayload, RefreshPayload } from '@modules/authentication/types';
import { userResponseSchema } from '@modules/authentication/dtos/user-response.dto';
import { User } from '@generated/client';
import { InjectBucket } from 'nestjs-minio-s3/dist/decorators/inject-bucket.decorator';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
    @InjectBucket() private readonly bucketName: string,
    private readonly minioService: MinioService,
  ) {}

  async signUp(signUpDto: SignUpDto, userAgent: string) {
    const user = await this.usersService.create(signUpDto);

    const { accessToken, refreshToken } = await this.issueTokens(
      user,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async signIn(signInDto: SignInDto, userAgent: string) {
    const user = await this.usersService.findByEmail(signInDto.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      signInDto.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } = await this.issueTokens(
      user,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    return userResponseSchema.parse(user);
  }

  async signOut(userId: string, refreshToken: string, userAgent: string) {
    const token = await this.usersService.findToken(userId, userAgent);
    if (!token) {
      throw new ForbiddenException();
    }

    const tokenMatches = await argon2.verify(token.hashedRt, refreshToken);
    if (!tokenMatches) {
      throw new ForbiddenException();
    }

    await this.usersService.deleteToken(userId, userAgent);
  }

  async refresh(userId: string, refreshToken: string, userAgent: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException();
    }

    const token = await this.usersService.findToken(userId, userAgent);
    if (!token) {
      throw new ForbiddenException();
    }

    const tokenMatches = await argon2.verify(token.hashedRt, refreshToken);
    if (!tokenMatches) {
      throw new ForbiddenException();
    }

    await this.usersService.deleteToken(userId, userAgent);

    const { accessToken, refreshToken: tokenRt } = await this.issueTokens(
      user,
      userAgent,
    );

    return {
      accessToken,
      refreshToken: tokenRt,
      user,
    };
  }

  async issueTokens(user: User, userAgent: string) {
    const accessPayload: AccessPayload = { userId: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(accessPayload);

    const refreshPayload: RefreshPayload = { userId: user.id };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.envService.get('REFRESH_SECRET'),
      expiresIn: `${this.envService.get('REFRESH_EXP')}d`,
    } as JwtSignOptions);

    await this.usersService.upsertToken(user.id, refreshToken, userAgent);

    return {
      accessToken,
      refreshToken,
    };
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldAvatarUrl = user?.avatarUrl;

    const ext = file.originalname.split('.').pop();
    const key = `${userId}-${Date.now()}.${ext}`;

    const newAvatarUrl = await this.minioService.upload(
      this.bucketName,
      key,
      file.buffer,
      file.mimetype,
    );

    await this.usersService.updateUser(userId, { avatarUrl: newAvatarUrl });

    if (oldAvatarUrl) {
      try {
        const oldKey = this.minioService.getKeyFromUrl(
          oldAvatarUrl,
          this.bucketName,
        );
        if (oldKey) {
          await this.minioService.delete(this.bucketName, oldKey);
        }
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
      }
    }

    return newAvatarUrl;
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user?.avatarUrl) {
      throw new BadRequestException('User has no avatar');
    }

    await this.usersService.updateUser(userId, { avatarUrl: undefined });

    try {
      const key = this.minioService.getKeyFromUrl(
        user.avatarUrl,
        this.bucketName,
      );
      if (key) {
        await this.minioService.delete(this.bucketName, key);
      }
    } catch (err) {
      console.error('Failed to delete avatar from S3:', err);
    }
  }
}

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES_SEC = 900; // 15 min
const REFRESH_TOKEN_EXPIRES_SEC = 7 * 24 * 60 * 60; // 7 days

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  jti?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string, name?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name },
    });
    return this.issueTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh' || !payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokenHash = this.hashToken(refreshToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (
      !record ||
      record.revokedAt ||
      record.expiresAt < new Date() ||
      record.userId !== payload.sub
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    await this.revokeRefreshToken(record.id);
    return this.issueTokens(record.user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async validateUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  private async issueTokens(user: User) {
    const accessSecret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET ?? 'dev-secret';
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ??
      process.env.JWT_ACCESS_SECRET ??
      process.env.JWT_SECRET ??
      'dev-refresh-secret';

    const accessExpiresSec =
      typeof process.env.JWT_ACCESS_EXPIRES === 'string'
        ? this.parseExpiresToSeconds(process.env.JWT_ACCESS_EXPIRES)
        : (Number(process.env.JWT_ACCESS_EXPIRES) as number) || ACCESS_TOKEN_EXPIRES_SEC;

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      } satisfies JwtPayload,
      {
        secret: accessSecret,
        expiresIn: accessExpiresSec,
      },
    );

    const refreshExpiresSec =
      typeof process.env.JWT_REFRESH_EXPIRES === 'string'
        ? this.parseExpiresToSeconds(process.env.JWT_REFRESH_EXPIRES)
        : (Number(process.env.JWT_REFRESH_EXPIRES) as number) || REFRESH_TOKEN_EXPIRES_SEC;

    const jti = randomUUID();
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
        jti,
      } satisfies JwtPayload,
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresSec,
      },
    );

    const expiresInMs = accessExpiresSec * 1000;
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(expiresInMs / 1000),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiresToSeconds(exp: string): number {
    const match = exp.match(/^(\d+)([smhd])?$/);
    if (!match) return ACCESS_TOKEN_EXPIRES_SEC;
    const n = parseInt(match[1], 10);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };
    return n * (multipliers[unit] ?? 1);
  }

  private async revokeRefreshToken(id: string) {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}

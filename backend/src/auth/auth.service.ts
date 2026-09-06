import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';

const RolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  INSTITUTION_ADMIN: [
    'dashboard.read', 'alerts.read', 'alerts.acknowledge',
    'reports.read', 'reports.generate', 'scenarios.read',
    'scenarios.simulate', 'suppliers.read', 'prices.read',
    'risk.read', 'analytics.read', 'news.read',
    'settings.read', 'chat.read',
  ],
  DEPARTMENT_MANAGER: [
    'dashboard.read', 'alerts.read', 'reports.read',
    'suppliers.read', 'prices.read', 'risk.read',
    'news.read', 'chat.read',
  ],
  ANALYST: [
    'dashboard.read', 'alerts.read', 'reports.read',
    'prices.read', 'risk.read', 'analytics.read',
    'news.read', 'chat.read',
  ],
  VIEWER: ['dashboard.read', 'prices.read', 'risk.read', 'news.read'],
  GUEST: ['dashboard.read'],
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        fullName: dto.fullName,
        role: (dto.role as UserRole) || UserRole.VIEWER,
        permissions: RolePermissions[dto.role] || RolePermissions.VIEWER,
      },
    });

    const tokens = await this.generateTokens(user.id, user.role, user.permissions);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role, user.permissions);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new UnauthorizedException();
      return this.generateTokens(user.id, user.role, user.permissions);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, role: UserRole, permissions: string[]) {
    const payload = { sub: userId, role, permissions };
    const accessToken = this.jwt.sign(payload, { expiresIn: '30m' });
    const refreshToken = this.jwt.sign({ sub: userId }, { expiresIn: '7d' });
    return { accessToken, refreshToken, expiresIn: 1800 };
  }

  private sanitizeUser(user: any) {
    const { password, mfaSecret, ...safe } = user;
    return safe;
  }
}

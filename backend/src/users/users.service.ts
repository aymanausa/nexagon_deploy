import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, institution: true, isActive: true, createdAt: true },
    });
    return { users, count: users.length };
  }
}

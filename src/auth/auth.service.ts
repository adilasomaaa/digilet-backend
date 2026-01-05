import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.raw.user.findUnique({
      where: {
        email,
      },
    });
    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };

    await this.prisma.activeToken.deleteMany({
      where: { userId: user.id },
    });

    const token = this.jwtService.sign(payload);

    await this.prisma.activeToken.create({
      data: {
        userId: user.id,
        token: token,
      },
    });

    return {
      status: true,
      token: token,
    };
  }

  async getProfile(user: User) {
    const fullUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (fullUser) {
      const { password, userRoles, ...result } = fullUser;

      const primaryUserRole =
        fullUser.userRoles.length > 0 ? fullUser.userRoles[0] : null;

      const primaryRoleName = primaryUserRole
        ? primaryUserRole.role.name
        : null;

      const roles = primaryUserRole
        ? {
            name: primaryRoleName,
            rolePermissions: primaryUserRole.role.rolePermissions.map(
              (rp) => rp.permission.name,
            ),
          }
        : [];

      return {
        ...result,
        userRoles: roles,
      };
    }

    return null;
  }

  async logout(token: string): Promise<void> {
    await this.prisma.activeToken.deleteMany({
      where: {
        token: token,
      },
    });
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.prisma.raw.user.findUnique({
      where: { id: id },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: { id: id },
      data: { password: hashedNewPassword },
    });
  }
}

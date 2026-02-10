import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
        personnel: {
          include: {
            institution: true,
          },
        },
        student: {
          include: {
            institution: true,
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
      include: {
        activeTokens: true,
      },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Password lama tidak sesuai');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: { id: id },
      data: { password: hashedNewPassword },
    });

    // return this.logout(user.activeTokens[0].token);
  }

  async updateProfile(id: number, updateProfileDto: UpdateProfileDto): Promise<any> {
    const { name, email, occupation } = updateProfileDto;

    // 1. Update User (Name & Email)
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name,
        email,
      },
      include: {
        personnel: true, // Check if user is personnel
      },
    });

    // 2. Update Personnel (Occupation/Position) if applicable
    if (updatedUser.personnel && occupation) {
      await this.prisma.personnel.update({
        where: { userId: id },
        data: {
          position: occupation,
        },
      });
    }

    return this.getProfile(updatedUser);
  }
}

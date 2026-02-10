import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: number; email: string }) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan.');
    }

    const activeSession = await this.prisma.activeToken.findFirst({
      where: { token: token },
    });

    if (!activeSession) {
      throw new UnauthorizedException('Sesi tidak valid atau sudah berakhir.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
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

    const userRole = await this.prisma.userRoles.findFirst({
      where: {
        userId: payload.sub,
      },
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
    });

    const roles = userRole
      ? {
          name: userRole.role.name,
          rolePermissions: userRole.role.rolePermissions.map(
            (rp) => rp.permission.name,
          ),
        }
      : [];

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan.');
    }

    return {
      ...user,
      roles,
    };
  }
}

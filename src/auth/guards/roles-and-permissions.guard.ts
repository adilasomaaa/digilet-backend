import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesAndPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Tidak ada user pada request.');
    }

    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!userData) {
      throw new ForbiddenException('Pengguna tidak ditemukan.');
    }

    const roleSet = new Set(
      (userData.userRoles ?? [])
        .map((ur) => ur.role?.name)
        .filter(Boolean)
        .map((r) => r.toLowerCase()),
    );

    const permissionSet = new Set(
      (userData.userRoles ?? [])
        .flatMap((ur) => ur.role?.rolePermissions ?? [])
        .map((rp) => rp.permission?.name)
        .filter(Boolean)
        .map((p) => p.toLowerCase()),
    );

    const needRoles = (requiredRoles ?? []).map((r) => r.toLowerCase());
    const needPerms = (requiredPermissions ?? []).map((p) => p.toLowerCase());

    if (needRoles.length > 0) {
      const hasAnyRole = needRoles.some((r) => roleSet.has(r));
      if (!hasAnyRole) {
        throw new ForbiddenException('Role tidak memenuhi syarat.');
      }
    }

    if (needPerms.length > 0) {
      const hasAllPerms = needPerms.every((p) => permissionSet.has(p));
      if (!hasAllPerms) {
        throw new ForbiddenException('Permission tidak memenuhi syarat.');
      }
    }

    return true;
  }
}

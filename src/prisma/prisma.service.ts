import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { excludePasswordExtension } from './prisma.extension';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly extendedClient: any;

  constructor() {
    const pool = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    super({ adapter: pool }); // Sesuai requirement Prisma 7

    this.extendedClient = this.$extends(excludePasswordExtension);

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop === 'raw') return target; // Menyediakan akses ke PrismaClient asli
        if (prop in target.extendedClient) return target.extendedClient[prop];
        return target[prop as keyof PrismaService];
      },
    }) as any; // Cast ke any untuk menghindari error TS2320
  }

  // Getter pembantu agar TS mengenali properti .raw di service lain
  get raw(): PrismaClient {
    return this as any;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

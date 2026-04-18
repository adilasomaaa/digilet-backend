import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HomeController],
})
export class HomeModule {}

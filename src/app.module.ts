import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FileUploadService } from './common/services/file-upload.services';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesAndPermissionsGuard } from './auth/guards/roles-and-permissions.guard';
import { ConfigModule } from '@nestjs/config';
import { StudyProgramModule } from './study-program/study-program.module';
import { PersonnelModule } from './personnel/personnel.module';
import { StudentModule } from './student/student.module';
import { OfficialModule } from './official/official.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    StudyProgramModule,
    PersonnelModule,
    StudentModule,
    OfficialModule,
  ],
  providers: [
    FileUploadService,
    PrismaService,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesAndPermissionsGuard,
    },
  ],
})
export class AppModule {}

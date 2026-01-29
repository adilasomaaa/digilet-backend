import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FileUploadService } from './common/services/file-upload.services';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesAndPermissionsGuard } from './auth/guards/roles-and-permissions.guard';
import { ConfigModule } from '@nestjs/config';
import { PersonnelModule } from './personnel/personnel.module';
import { StudentModule } from './student/student.module';
import { OfficialModule } from './official/official.module';
import { LetterModule } from './letter/letter.module';
import { LetterheadModule } from './letterhead/letterhead.module';
import { LetterTemplateModule } from './letter-template/letter-template.module';
import { LetterDocumentModule } from './letter-document/letter-document.module';
import { LetterSignatureModule } from './letter-signature/letter-signature.module';
import { StudentLetterSubmissionModule } from './student-letter-submission/student-letter-submission.module';
import { GeneralLetterSubmissionModule } from './general-letter-submission/general-letter-submission.module';
import { DocumentSubmissionModule } from './document-submission/document-submission.module';
import { LetterAttributeModule } from './letter-attribute/letter-attribute.module';
import { LetterAttributeSubmissionModule } from './letter-attribute-submission/letter-attribute-submission.module';
import { InstitutionModule } from './institution/institution.module';
import { LetterAttachmentModule } from './letter-attachment/letter-attachment.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    InstitutionModule,
    PersonnelModule,
    StudentModule,
    OfficialModule,
    LetterModule,
    LetterheadModule,
    LetterTemplateModule,
    LetterDocumentModule,
    LetterSignatureModule,
    StudentLetterSubmissionModule,
    GeneralLetterSubmissionModule,
    DocumentSubmissionModule,
    LetterAttributeModule,
    LetterAttributeSubmissionModule,
    LetterAttributeSubmissionModule,
    LetterAttachmentModule,
    DashboardModule
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

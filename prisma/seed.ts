import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const pool = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  console.log('Start a seeder ...');

  const saltRounds = 10;

  const permissionToCreate = [
    {
      name: 'manage_students',
    },
    {
      name: 'manage_personnels',
    },
    {
      name: 'manage_institutions',
    },
    {
      name: 'manage_officials',
    },
    {
      name: 'manage_letters',
    },
    {
      name: 'manage_letters_template',
    },
    {
      name: 'manage_headers',
    },
    {
      name: 'manage_letterheads',
    },
    {
      name: 'manage_letter_signature_templates',
    },
    {
      name: 'manage_letter_documents',
    },
    {
      name: 'manage_student_letter_submissions',
    },
    {
      name: 'manage_general_letter_submissions',
    },
    {
      name: 'view_student_letter_submissions',
    },
    {
      name: 'submit_letters',
    },
    {
      name: 'view_students',
    },
  ];

  const rolesAndPermissions = {
    admin: [
      'manage_students',
      'manage_personnels',
      'manage_institutions',
      'manage_officials',
      'manage_letters',
      'manage_letters_template',
      'manage_headers',
      'manage_letterheads',
      'manage_letter_signature_templates',
      'manage_letter_documents',
      'manage_student_letter_submissions',
      'manage_general_letter_submissions',
    ],
    personnel: [
      'manage_students',
      'manage_letters',
      'manage_letters_template',
      'manage_headers',
      'manage_letterheads',
      'manage_letter_signature_templates',
      'manage_letter_documents',
      'manage_student_letter_submissions',
      'manage_general_letter_submissions',
    ],
    student: ['view_student_letter_submissions', 'submit_letters'],
  };

  for (const data of permissionToCreate) {
    await prisma.permission.upsert({
      where: { name: data.name },
      update: {},
      create: { name: data.name },
    });
  }

  for (const roleName in rolesAndPermissions) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const permissionsForRole = rolesAndPermissions[roleName];
    if (permissionsForRole) {
      const permissionsInDb = await prisma.permission.findMany({
        where: { name: { in: permissionsForRole } },
      });

      for (const perm of permissionsInDb) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: perm.id },
          },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  console.log('Membuat user admin...');
  const adminPassword = await bcrypt.hash('password', saltRounds);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@app.id' },
    update: {},
    create: {
      name: 'superadmin',
      email: 'admin@app.id',
      password: adminPassword,
    },
  });

  // 4. Buat User Client
  console.log('Membuat user client...');
  const clientPassword = await bcrypt.hash('password', saltRounds);
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@app.id' },
    update: {},
    create: {
      name: 'operator',
      email: 'operator@app.id',
      password: clientPassword,
    },
  });

  // 5. Hubungkan Users ke Roles
  console.log('Menghubungkan users ke roles...');
  const adminRoleFromDb = await prisma.role.findUnique({
    where: { name: 'admin' },
  });
  const clientRoleFromDb = await prisma.role.findUnique({
    where: { name: 'personnel' },
  });

  if (adminRoleFromDb) {
    await prisma.userRoles.upsert({
      where: {
        userId_roleId: { userId: adminUser.id, roleId: adminRoleFromDb.id },
      },
      update: {},
      create: { userId: adminUser.id, roleId: adminRoleFromDb.id },
    });
  }

  if (clientRoleFromDb) {
    await prisma.userRoles.upsert({
      where: {
        userId_roleId: { userId: clientUser.id, roleId: clientRoleFromDb.id },
      },
      update: {},
      create: { userId: clientUser.id, roleId: clientRoleFromDb.id },
    });
  }

  console.log('Membuat institusi study program ...');
  const studyPrograms = [{ name: 'PIAUD' }, { name: 'Agama Islam' }];

  for (const studyProgram of studyPrograms) {
    await prisma.institution.upsert({
      where: { name: studyProgram.name },
      update: {},
      create: { ...studyProgram, type: 'study_program' },
    });
  }

  // 6. Buat Personil
  console.log('Membuat Personil...');

  const existingPersonnel = await prisma.personnel.findFirst({
    where: { userId: clientUser.id },
  });

  if (!existingPersonnel) {
    await prisma.personnel.create({
      data: {
        userId: clientUser.id,
        name: 'Operator Fakultas',
        institutionId: 1,
        position: 'Operator',
      },
    });
  }

  console.log(`Seeding selesai.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

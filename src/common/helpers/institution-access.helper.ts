import { InstitutionType, PrismaClient } from '@prisma/client';

/**
 * Get accessible institution IDs based on personnel's institution type and hierarchy
 * @param prisma - Prisma client instance
 * @param institutionId - Personnel's institution ID
 * @param institutionType - Personnel's institution type
 * @returns Array of accessible institution IDs, or null to indicate "all institutions"
 */
export async function getAccessibleInstitutionIds(
  prisma: PrismaClient,
  institutionId: number,
  institutionType: InstitutionType,
): Promise<number[] | null> {
  switch (institutionType) {
    case InstitutionType.study_program:
      // Study program personnel can only access their own institution
      return [institutionId];

    case InstitutionType.faculty:
      // Faculty personnel can access all child study programs
      const childInstitutions = await prisma.institution.findMany({
        where: { parentId: institutionId },
        select: { id: true },
      });
      return childInstitutions.map((inst) => inst.id);

    case InstitutionType.institution:
    case InstitutionType.university:
      // Institution/university personnel can access all institutions (read-only)
      return null; // null indicates "all institutions"

    default:
      return [institutionId];
  }
}

/**
 * Check if personnel has write permissions based on institution type
 * @param institutionType - Personnel's institution type
 * @returns true if personnel can create/update/delete, false otherwise
 */
export function hasWritePermission(institutionType: InstitutionType): boolean {
  return (
    institutionType === InstitutionType.study_program ||
    institutionType === InstitutionType.faculty
  );
}

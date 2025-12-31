import { Prisma } from '@prisma/client';

export const excludePasswordExtension = Prisma.defineExtension({
  result: {
    user: {
      password: {
        needs: {},
        compute() {
          return undefined;
        },
      },
    },
  },
});

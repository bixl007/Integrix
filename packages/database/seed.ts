import { PrismaClient } from '@prisma/client';
import { builtInActions, builtInTriggers } from './src/catalog';

const prisma = new PrismaClient();

// Idempotent: safe to run on every dev start and container boot.
async function main() {
  for (const t of builtInTriggers) {
    await prisma.availableTrigger.upsert({ where: { id: t.id }, update: {}, create: t });
  }
  for (const a of builtInActions) {
    // secretFields is code-owned, so existing rows are brought up to date as well.
    const secretFields = a.secretFields ?? [];
    await prisma.availableAction.upsert({
      where: { id: a.id },
      update: { secretFields },
      create: { ...a, secretFields },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

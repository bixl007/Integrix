import { PrismaClient } from '@prisma/client';
import { builtInActions, builtInTriggers } from './src/catalog';

const prisma = new PrismaClient();

// Idempotent: safe to run on every dev start and container boot.
async function main() {
  // The field lists are code-owned, so existing rows are brought up to date as well.
  for (const t of builtInTriggers) {
    const secretFields = t.secretFields ?? [];
    await prisma.availableTrigger.upsert({
      where: { id: t.id },
      update: { secretFields },
      create: { ...t, secretFields },
    });
  }
  for (const a of builtInActions) {
    const fields = {
      secretFields: a.secretFields ?? [],
      connectionFields: a.connectionFields ?? [],
    };
    await prisma.availableAction.upsert({
      where: { id: a.id },
      update: fields,
      create: { ...a, ...fields },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

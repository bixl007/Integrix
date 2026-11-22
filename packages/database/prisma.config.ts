import { defineConfig } from 'prisma/config';

// Env comes from the caller (bun --env-file in scripts, Compose in Docker).
export default defineConfig({
  schema: 'schema.prisma',
  migrations: { path: 'migrations', seed: 'bun seed.ts' },
});

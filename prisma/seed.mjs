import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

// Seed via the DIRECT (unpooled) connection — the pooled URL breaks prepared
// statements mid-seed. Falls back to DATABASE_URL if DIRECT_URL isn't set.
const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const rows = JSON.parse(
  readFileSync(new URL("./exercises.seed.json", import.meta.url), "utf8")
);

async function main() {
  // Upsert-style: clear and reload so re-running stays idempotent.
  await prisma.exercise.deleteMany();
  // createMany is fine here — all fields are scalars / string arrays.
  const result = await prisma.exercise.createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log(`Seeded ${result.count} exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

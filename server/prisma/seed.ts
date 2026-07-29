import { PrismaClient, Prisma } from '@prisma/client';
import { TROUBLE_BREWING_ROLES, TROUBLE_BREWING_SCRIPT } from '../src/scripts/trouble-brewing';

const prisma = new PrismaClient();

// SetupEffect is a discriminated union (shared/src/types/role.ts); Prisma's Json
// input type can't structurally verify every branch (e.g. overrideBaseTable's
// Record<number, TeamComposition>), so the cast is explicit here at the DB boundary.
function toJsonInput(value: unknown): Prisma.InputJsonValue | undefined {
  return value === null || value === undefined ? undefined : (value as Prisma.InputJsonValue);
}

async function main() {
  await prisma.script.upsert({
    where: { id: TROUBLE_BREWING_SCRIPT.id },
    update: { name: TROUBLE_BREWING_SCRIPT.name },
    create: { id: TROUBLE_BREWING_SCRIPT.id, name: TROUBLE_BREWING_SCRIPT.name },
  });

  for (const role of TROUBLE_BREWING_ROLES) {
    await prisma.role.upsert({
      where: { scriptId_name: { scriptId: TROUBLE_BREWING_SCRIPT.id, name: role.name } },
      update: {
        team: role.team,
        abilityText: role.abilityText,
        faqText: role.faqText,
        firstNightOrder: role.firstNightOrder,
        otherNightOrder: role.otherNightOrder,
        reminderText: role.reminderText,
        setupEffect: toJsonInput(role.setupEffect),
      },
      create: {
        scriptId: TROUBLE_BREWING_SCRIPT.id,
        name: role.name,
        team: role.team,
        abilityText: role.abilityText,
        faqText: role.faqText,
        firstNightOrder: role.firstNightOrder,
        otherNightOrder: role.otherNightOrder,
        reminderText: role.reminderText,
        setupEffect: toJsonInput(role.setupEffect),
      },
    });
  }

  console.log(`Seeded script "${TROUBLE_BREWING_SCRIPT.name}" with ${TROUBLE_BREWING_ROLES.length} roles.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

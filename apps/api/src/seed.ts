import { EQUIPMENT_SLOTS, SKILL_IDS } from "@prooflayer/shared";
import { prisma } from "./db.js";
import { env } from "./env.js";

async function main() {
  const characterId = env.DEV_CHARACTER_ID;
  console.log(`Seeding character ${characterId}...`);

  await prisma.account.upsert({
    where: { email: "dev@prooflayer.local" },
    create: {
      id: "dev-account-01",
      email: "dev@prooflayer.local",
      passwordHash: "legacy-dev-login-disabled",
    },
    update: {},
  });

  const existing = await prisma.character.findUnique({ where: { id: characterId } });
  if (existing) {
    console.log(`Character ${characterId} already exists — leaving in place.`);
    return;
  }

  await prisma.character.create({
    data: {
      id: characterId,
      accountId: "dev-account-01",
      name: "Apprentice",
      gold: 0n,
      worldId: "world-1",
      regionId: "market_cross",
      tileX: 32,
      tileY: 32,
      hp: 10,
      maxHp: 10,
      activeActionId: null,
      activeProgressMs: 0,
      rngSeed: Math.floor(Math.random() * 0x7fffffff),
      skills: {
        create: SKILL_IDS.map((skillId) => ({ skillId, xp: 0n })),
      },
      equipment: {
        create: EQUIPMENT_SLOTS.map((slot) => {
          const starter: Record<string, string | null> = {
            weapon: "apprentice_blade",
            body: "apprentice_robe",
            feet: "apprentice_boots",
          };
          return { slot, itemId: starter[slot] ?? null };
        }),
      },
    },
  });

  console.log(`Seeded character ${characterId} with starter loadout.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { CONFIG_VERSION, ITEMS, SKILLS, SKILL_ORDER } from "@prooflayer/config";
import { SKILL_IDS } from "@prooflayer/shared";
import type { FastifyInstance } from "fastify";
import { viewActionsForSkill } from "../serialize.js";

export async function configRoutes(app: FastifyInstance) {
  app.get("/api/config", async () => {
    const skills = SKILL_ORDER.map((id) => ({
      ...SKILLS[id],
      actions: viewActionsForSkill(id),
    }));

    return {
      version: CONFIG_VERSION,
      skillIds: SKILL_IDS,
      skillOrder: SKILL_ORDER,
      skills,
      items: ITEMS,
    };
  });
}

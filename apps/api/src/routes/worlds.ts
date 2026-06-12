import { REGION_LIST, WORLD_SHARDS } from "@prooflayer/config";
import type { FastifyInstance } from "fastify";

export async function worldRoutes(app: FastifyInstance) {
  app.get("/api/worlds", async () => ({
    worlds: WORLD_SHARDS,
    regions: REGION_LIST.map((region) => ({
      id: region.id,
      name: region.name,
      width: region.width,
      height: region.height,
      spawn: region.spawn,
    })),
  }));
}

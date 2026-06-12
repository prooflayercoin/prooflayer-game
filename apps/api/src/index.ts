import { buildApp } from "./app.js";
import { env } from "./env.js";

const app = await buildApp();

try {
  await app.listen({ port: env.API_PORT, host: env.API_HOST });
  app.log.info(`Prooflayer API listening on ${env.API_HOST}:${env.API_PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

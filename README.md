# Prooflayer

A browser-based idle/incremental skilling game. You are a Prooflayer — one
who maintains the lattice of sealed sigils that hold the world together.
Harvest, refine, and seal proofs across six skills.

## Stage 1: Local core loop

```bash
# 1. Install deps
pnpm install

# 2. Start Postgres
pnpm db:up

# 3. Run migrations + seed test character
pnpm db:migrate
pnpm db:seed

# 4. Run web + api together
pnpm dev
```

Open http://localhost:3000/play

## Skills

| Skill | Role |
|---|---|
| Reaping | Harvest aether-touched flora |
| Quarrying | Cleave crystallized truth from sigil-veins |
| Tempering | Press shards into ingots and gear |
| Tracking | Stalk wild beasts of the outer layers |
| Distilling | Cook flora and shards into elixirs |
| Sealing | Banish corruption back into the lattice |

## Architecture

- `apps/web` — Next.js 14 (App Router) + Tailwind
- `apps/api` — Fastify + Prisma (Postgres)
- `packages/shared` — XP curve, tick logic, zod schemas, shared types
- `packages/config` — All game data (skills, actions, items, drops)

Game state is 100% server-authoritative. The client renders and sends
intents; the server resolves all XP, gold, drops, and timers via a
deterministic `tick(state, now)` function.

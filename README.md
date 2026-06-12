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

### Local ports

| Service | URL |
|---|---|
| Web | http://localhost:3000/play |
| API | http://localhost:4000 |
| Postgres | localhost:5433 |

If one side of the app is already running, start the other side directly:

```bash
pnpm dev:api
pnpm dev:web
```

The web client reads `NEXT_PUBLIC_API_URL` and defaults to
`http://localhost:4000`, so a missing API server will leave the game on the
loading screen.

With the dev servers running, verify the local web/API handshake with:

```bash
pnpm smoke:browser
```

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

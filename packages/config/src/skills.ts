import type { SkillConfig, SkillId } from "@prooflayer/shared";

export const SKILLS: Record<SkillId, SkillConfig> = {
  reaping: {
    id: "reaping",
    name: "Reaping",
    tagline: "Harvest aether-touched flora",
    description:
      "Cut, pluck, and gather living matter at the edges of the lattice. The bones of every elixir begin in a Reaper's hand.",
  },
  quarrying: {
    id: "quarrying",
    name: "Quarrying",
    tagline: "Cleave crystallized truth from sigil-veins",
    description:
      "Truth, when pressured for long enough, becomes stone. Quarriers split open the world to take it.",
  },
  tempering: {
    id: "tempering",
    name: "Tempering",
    tagline: "Press shards into ingots and gear",
    description:
      "Apply heat, pressure, and intent to raw shards. A Temperer's anvil is where the lattice gains a body.",
  },
  tracking: {
    id: "tracking",
    name: "Tracking",
    tagline: "Stalk wild beasts of the outer layers",
    description:
      "Beasts roam the unsealed edges, bound to no sigil. A Tracker reads their paths and takes what they leave behind.",
  },
  distilling: {
    id: "distilling",
    name: "Distilling",
    tagline: "Cook flora and shards into elixirs",
    description:
      "Heat, time, and balance. A Distiller's craft is patience made liquid — and sometimes glyph-ink for the Sealers.",
  },
  sealing: {
    id: "sealing",
    name: "Sealing",
    tagline: "Banish corruption back into the lattice",
    description:
      "Where the lattice cracks, things crawl through. Sealers meet them at the seams and bind them back into pattern.",
  },
};

export const SKILL_ORDER: SkillId[] = [
  "reaping",
  "quarrying",
  "tempering",
  "tracking",
  "distilling",
  "sealing",
];

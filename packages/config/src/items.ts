import type { ItemConfig } from "@prooflayer/shared";

export const ITEMS: Record<string, ItemConfig> = {
  aether_stalk: {
    id: "aether_stalk",
    name: "Aether Stalk",
    description: "A green-blue stem that hums faintly when held.",
    category: "material",
    baseValue: 2,
  },
  dawn_bloom: {
    id: "dawn_bloom",
    name: "Dawn Bloom",
    description: "A pale flower that opens only when no one is looking.",
    category: "material",
    baseValue: 8,
  },
  starflax: {
    id: "starflax",
    name: "Starflax",
    description: "Tough fibrous reed laced with mineralized light.",
    category: "material",
    baseValue: 25,
  },
  silverflax: {
    id: "silverflax",
    name: "Silverflax",
    description: "A rare mutation of starflax. Cold to the touch.",
    category: "material",
    baseValue: 200,
  },

  dim_shard: {
    id: "dim_shard",
    name: "Dim Shard",
    description: "Crystallized truth, faintly opaque.",
    category: "material",
    baseValue: 3,
  },
  radiant_shard: {
    id: "radiant_shard",
    name: "Radiant Shard",
    description: "Bright, edge-honed, eager to be pressed.",
    category: "material",
    baseValue: 20,
  },
  prismatic_shard: {
    id: "prismatic_shard",
    name: "Prismatic Shard",
    description: "Splits any light passed through it into seven sigils.",
    category: "material",
    baseValue: 90,
  },

  dim_ingot: {
    id: "dim_ingot",
    name: "Dim Ingot",
    description: "Pressed dim shards. The base bar of Tempering.",
    category: "material",
    baseValue: 12,
  },
  radiant_ingot: {
    id: "radiant_ingot",
    name: "Radiant Ingot",
    description: "Glows in low light. Used in upper-tier gear.",
    category: "material",
    baseValue: 75,
  },
  prismatic_ingot: {
    id: "prismatic_ingot",
    name: "Prismatic Ingot",
    description: "Each side shows a different color. Highly prized.",
    category: "material",
    baseValue: 300,
  },

  foreshade_hide: {
    id: "foreshade_hide",
    name: "Foreshade Hide",
    description: "The skin of a small, half-real predator.",
    category: "material",
    baseValue: 4,
  },
  shellback_carapace: {
    id: "shellback_carapace",
    name: "Shellback Carapace",
    description: "Thick chitin from a layer-walking beast.",
    category: "material",
    baseValue: 30,
  },
  aetherdrake_scale: {
    id: "aetherdrake_scale",
    name: "Aetherdrake Scale",
    description: "A single scale worth a small fortune.",
    category: "material",
    baseValue: 110,
  },
  drake_heart: {
    id: "drake_heart",
    name: "Drake Heart",
    description: "Still beating, faintly. Centerpiece of master tonics.",
    category: "material",
    baseValue: 600,
  },

  minor_tonic: {
    id: "minor_tonic",
    name: "Minor Tonic",
    description: "Restores a sliver of focus.",
    category: "consumable",
    baseValue: 10,
  },
  sealing_draught: {
    id: "sealing_draught",
    name: "Sealing Draught",
    description: "Steadies the hand during a binding.",
    category: "consumable",
    baseValue: 60,
  },
  prismatic_ink: {
    id: "prismatic_ink",
    name: "Prismatic Ink",
    description: "Inscribes lasting glyphs. Cornerstone of Sealing.",
    category: "consumable",
    baseValue: 240,
  },

  dim_token: {
    id: "dim_token",
    name: "Dim Sealing Token",
    description: "A small pressed glyph. Proof a wisp was bound.",
    category: "token",
    baseValue: 5,
  },
  bright_token: {
    id: "bright_token",
    name: "Bright Sealing Token",
    description: "Heavier. Earned at the seams where the lattice strains.",
    category: "token",
    baseValue: 25,
  },
  radiant_token: {
    id: "radiant_token",
    name: "Radiant Sealing Token",
    description: "Carved with the marks of a revenant. Heavy and warm.",
    category: "token",
    baseValue: 120,
  },

  wisp_essence: {
    id: "wisp_essence",
    name: "Wisp Essence",
    description: "A captured remnant of something that should not have been.",
    category: "material",
    baseValue: 80,
  },
  sigilbreaker_core: {
    id: "sigilbreaker_core",
    name: "Sigilbreaker Core",
    description: "The center of a thing made to undo binding.",
    category: "material",
    baseValue: 350,
  },
  revenant_heart: {
    id: "revenant_heart",
    name: "Revenant Heart",
    description: "Pulses on the half-second. Sealed Prooflayers know not to touch it.",
    category: "material",
    baseValue: 1500,
  },

  apprentice_blade: {
    id: "apprentice_blade",
    name: "Apprentice Blade",
    description: "Standard issue. Holds an edge, asks no questions.",
    category: "equipment",
    slot: "weapon",
    baseValue: 50,
  },
  apprentice_robe: {
    id: "apprentice_robe",
    name: "Apprentice Robe",
    description: "Plain cloth. Embroidered with a single sigil at the hem.",
    category: "equipment",
    slot: "body",
    baseValue: 30,
  },
  apprentice_boots: {
    id: "apprentice_boots",
    name: "Apprentice Boots",
    description: "Quiet, sensible, brown.",
    category: "equipment",
    slot: "feet",
    baseValue: 20,
  },
};

export function getItem(id: string): ItemConfig | undefined {
  return ITEMS[id];
}

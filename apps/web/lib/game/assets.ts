export const GAME_ASSETS = {
  terrain: {
    grass: "/game/terrain/grassWhole.png",
    dirt: "/game/terrain/dirt.png",
    dirtDouble: "/game/terrain/dirtDouble.png",
    water: "/game/terrain/water.png",
    riverNS: "/game/terrain/riverNS.png",
    riverEW: "/game/terrain/riverEW.png",
    bridgeNS: "/game/terrain/bridgeNS.png",
    bridgeEW: "/game/terrain/bridgeEW.png",
  },
  objects: {
    treeTall: "/game/objects/treeTall.png",
    treeAltTall: "/game/objects/treeAltTall.png",
    treeShort: "/game/objects/treeShort.png",
    treeAltShort: "/game/objects/treeAltShort.png",
    coniferTall: "/game/objects/coniferTall.png",
    coniferShort: "/game/objects/coniferShort.png",
    shardRock: "/game/objects/shard-rock.png",
    barrel: "/game/objects/barrel.png",
    crate: "/game/objects/crate.png",
    chest: "/game/objects/chest.png",
  },
  buildings: {
    guild: "/game/buildings/guild.png",
    market: "/game/buildings/market.png",
    forge: "/game/buildings/forge.png",
    chapel: "/game/buildings/chapel.png",
    roofBrown: "/game/buildings/roof-brown.png",
    roofRedA: "/game/buildings/roof-red-a.png",
    roofRedB: "/game/buildings/roof-red-b.png",
  },
} as const;

export const PLAYER_DIRECTIONS = Array.from({ length: 8 }, (_, direction) => ({
  direction,
  idle: `/game/characters/male/Male_${direction}_Idle0.png`,
  run: Array.from(
    { length: 10 },
    (_, frame) => `/game/characters/male/Male_${direction}_Run${frame}.png`
  ),
}));

export const PLAYER_WORK = Array.from(
  { length: 10 },
  (_, frame) => `/game/characters/male/Male_0_Pickup${frame}.png`
);

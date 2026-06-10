import { describe, expect, it } from "vitest";
import { levelForXp, levelProgress, MAX_LEVEL, xpForLevel } from "../xp.js";

describe("xpForLevel — RuneScape-style curve", () => {
  it("level 1 requires 0 xp", () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it("matches known curve anchors", () => {
    expect(xpForLevel(2)).toBe(83);
    expect(xpForLevel(3)).toBe(174);
    expect(xpForLevel(10)).toBe(1154);
    expect(xpForLevel(50)).toBe(101333);
    expect(xpForLevel(99)).toBe(13034431);
  });

  it("is strictly increasing across all levels", () => {
    for (let L = 2; L <= MAX_LEVEL; L++) {
      expect(xpForLevel(L)).toBeGreaterThan(xpForLevel(L - 1));
    }
  });
});

describe("levelForXp — inverse lookup", () => {
  it("returns 1 for 0 xp", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("returns L when xp is exactly the threshold for L", () => {
    for (let L = 1; L <= MAX_LEVEL; L++) {
      expect(levelForXp(xpForLevel(L))).toBe(L);
    }
  });

  it("returns L when xp is 1 below the threshold for L+1", () => {
    for (let L = 1; L < MAX_LEVEL; L++) {
      expect(levelForXp(xpForLevel(L + 1) - 1)).toBe(L);
    }
  });

  it("caps at MAX_LEVEL for huge xp", () => {
    expect(levelForXp(999_999_999)).toBe(MAX_LEVEL);
  });

  it("accepts bigint xp", () => {
    expect(levelForXp(BigInt(xpForLevel(50)))).toBe(50);
  });
});

describe("levelProgress", () => {
  it("at exact level threshold reports 0 progress into level", () => {
    const p = levelProgress(xpForLevel(20));
    expect(p.level).toBe(20);
    expect(p.xpIntoLevel).toBe(0);
    expect(p.progress).toBe(0);
  });

  it("halfway through a level reports ~0.5 progress", () => {
    const base = xpForLevel(20);
    const next = xpForLevel(21);
    const mid = base + Math.floor((next - base) / 2);
    const p = levelProgress(mid);
    expect(p.level).toBe(20);
    expect(p.progress).toBeGreaterThan(0.4);
    expect(p.progress).toBeLessThan(0.6);
  });

  it("reports 100% progress at MAX_LEVEL", () => {
    const p = levelProgress(xpForLevel(MAX_LEVEL));
    expect(p.level).toBe(MAX_LEVEL);
    expect(p.progress).toBe(1);
  });
});

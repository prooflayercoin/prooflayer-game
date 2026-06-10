export const MAX_LEVEL = 99;

const buildTable = (): number[] => {
  const table: number[] = new Array(MAX_LEVEL + 1).fill(0);
  let runningSum = 0;
  for (let L = 1; L < MAX_LEVEL; L++) {
    runningSum += Math.floor(L + 300 * Math.pow(2, L / 7));
    table[L + 1] = Math.floor(runningSum / 4);
  }
  return table;
};

const XP_TABLE = buildTable();

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) return XP_TABLE[MAX_LEVEL]!;
  return XP_TABLE[level]!;
}

export function levelForXp(xp: number | bigint): number {
  const n = typeof xp === "bigint" ? Number(xp) : xp;
  if (n <= 0) return 1;
  for (let L = MAX_LEVEL; L >= 1; L--) {
    if (n >= XP_TABLE[L]!) return L;
  }
  return 1;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  xpToNext: number;
  progress: number;
}

export function levelProgress(xp: number | bigint): LevelProgress {
  const n = typeof xp === "bigint" ? Number(xp) : xp;
  const level = levelForXp(n);
  if (level >= MAX_LEVEL) {
    return {
      level: MAX_LEVEL,
      xpIntoLevel: 0,
      xpForNextLevel: 0,
      xpToNext: 0,
      progress: 1,
    };
  }
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = next - base;
  const into = n - base;
  return {
    level,
    xpIntoLevel: into,
    xpForNextLevel: span,
    xpToNext: span - into,
    progress: span === 0 ? 1 : into / span,
  };
}

import type { RegionConfig } from "@prooflayer/config";
import type { WorldPosition } from "@prooflayer/shared";

function key(x: number, y: number): string {
  return `${x},${y}`;
}

export function isPassable(region: RegionConfig, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= region.width || y >= region.height) return false;
  const blocked = new Set(region.blocked.map((point) => key(point.x, point.y)));
  return !blocked.has(key(x, y));
}

export function findPath(
  region: RegionConfig,
  from: WorldPosition,
  to: WorldPosition,
  maxVisited = 4096
): WorldPosition[] {
  if (from.regionId !== region.id || to.regionId !== region.id) return [];
  if (!isPassable(region, to.x, to.y)) return [];
  if (from.x === to.x && from.y === to.y) return [from];

  const blocked = new Set(region.blocked.map((point) => key(point.x, point.y)));
  const startKey = key(from.x, from.y);
  const targetKey = key(to.x, to.y);
  const queue = [{ x: from.x, y: from.y }];
  const previous = new Map<string, string | null>([[startKey, null]]);

  for (let index = 0; index < queue.length && previous.size < maxVisited; index += 1) {
    const current = queue[index];
    if (!current) break;
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const next of neighbors) {
      const nextKey = key(next.x, next.y);
      if (
        previous.has(nextKey) ||
        next.x < 0 ||
        next.y < 0 ||
        next.x >= region.width ||
        next.y >= region.height ||
        blocked.has(nextKey)
      ) {
        continue;
      }
      previous.set(nextKey, key(current.x, current.y));
      if (nextKey === targetKey) {
        return reconstruct(region.id, targetKey, previous);
      }
      queue.push(next);
    }
  }

  return [];
}

function reconstruct(
  regionId: WorldPosition["regionId"],
  targetKey: string,
  previous: Map<string, string | null>
): WorldPosition[] {
  const reversed: WorldPosition[] = [];
  let cursor: string | null | undefined = targetKey;
  while (cursor) {
    const [x = 0, y = 0] = cursor.split(",").map(Number);
    reversed.push({ regionId, x, y });
    cursor = previous.get(cursor) ?? null;
  }
  return reversed.reverse();
}

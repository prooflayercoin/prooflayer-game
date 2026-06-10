// Isometric coordinate math for a diamond grid
// Babylon uses right-handed: +X right, +Y up, +Z back

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 64;
export const TILE_DEPTH = 32;

// Convert world grid coords to Babylon world position (for tile placement)
export function gridToWorld(gridX: number, gridY: number): { x: number; z: number } {
  // Isometric diamond grid: offset x and z based on grid position
  // Each grid step creates a staggered 3D position
  const x = (gridX - gridY) * (TILE_WIDTH / 2);
  const z = (gridX + gridY) * (TILE_DEPTH / 2);
  return { x, z };
}

// Screen coordinates (2D pixel position) from isometric grid
export function gridToScreen(gridX: number, gridY: number): { screenX: number; screenY: number } {
  const screenX = (gridX - gridY) * (TILE_WIDTH / 2);
  const screenY = (gridX + gridY) * (TILE_HEIGHT / 4);
  return { screenX, screenY };
}

// Inverse: screen to grid (for click detection)
export function screenToGrid(screenX: number, screenY: number): { gridX: number; gridY: number } {
  const gridX = (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 4)) / 2;
  const gridY = (screenY / (TILE_HEIGHT / 4) - screenX / (TILE_WIDTH / 2)) / 2;
  return { gridX, gridY };
}

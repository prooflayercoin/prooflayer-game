from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFilter


REPO = Path(__file__).resolve().parents[2]
MAP_PATH = REPO / "apps/web/public/prooflayer-made/maps/market-cross-showcase.json"
OUT_PATH = REPO / "apps/web/public/prooflayer-made/maps/market-cross-preview.png"
TILE_WIDTH = 100
TILE_HEIGHT = 50
PADDING_X = 900
PADDING_TOP = 520
PADDING_BOTTOM = 760
VIEWPORT_WIDTH = 2200
VIEWPORT_HEIGHT = 1400
VIEWPORT_CENTER = (32, 34)

TERRAIN = {
    1: REPO / "apps/web/public/prooflayer-made/terrain/grass-a.png",
    2: REPO / "apps/web/public/prooflayer-made/terrain/dirt-a.png",
    3: REPO / "apps/web/public/prooflayer-made/terrain/water-a.png",
    4: REPO / "apps/web/public/prooflayer-made/terrain/stone-a.png",
    5: REPO / "apps/web/public/prooflayer-made/terrain/stone-b.png",
}

ASSET_ALIASES = {
    "prop-market-stall": "blender-renders/fantasy-props/market-stall.png",
    "prop-cart-stall": "blender-renders/fantasy-props/cart-stall.png",
    "prop-chest": "blender-renders/fantasy-props/wood-chest.png",
    "prop-coins": "blender-renders/fantasy-props/coin-pile-large.png",
    "sign-market": "shop-signs/market-hall.png",
    "sign-forge": "shop-signs/ember-forge.png",
    "sign-guild": "shop-signs/prooflayer-guild.png",
    "sign-quarry": "shop-signs/quarry-camp.png",
}


def grid_to_world(x: int, y: int) -> tuple[int, int]:
    return ((x - y) * (TILE_WIDTH // 2), (x + y) * (TILE_HEIGHT // 2))


def prop_value(properties: list[dict[str, Any]], name: str, fallback: Any = None) -> Any:
    for prop in properties:
        if prop.get("name") == name:
            return prop.get("value")
    return fallback


def find_asset(asset_key: str) -> Path | None:
    public_root = REPO / "apps/web/public/prooflayer-made"
    alias = ASSET_ALIASES.get(asset_key)
    if alias:
        alias_path = public_root / alias
        if alias_path.exists():
            return alias_path

    direct_candidates = [
        public_root / "blender-renders/quaternius-prefabs" / f"{asset_key}.png",
        public_root / "blender-renders/quaternius-village" / f"{asset_key}.png",
        public_root / "blender-renders/medieval-props" / f"{asset_key}.png",
        public_root / "blender-renders/nature" / f"{asset_key}.png",
        public_root / "blender-renders/nature-trees" / f"{asset_key}.png",
        public_root / "blender-renders/fantasy-props" / f"{asset_key}.png",
        public_root / "shop-signs" / f"{asset_key.removeprefix('sign-')}.png",
    ]
    for candidate in direct_candidates:
        if candidate.exists():
            return candidate

    matches = list(public_root.glob(f"**/{asset_key}.png"))
    return matches[0] if matches else None


def terrain_path(tile_id: int, x: int, y: int) -> Path:
    if tile_id == 1:
        value = (x * 37 + y * 19 + x * y * 7) % 12
        suffix = "a" if value < 7 else "b" if value < 10 else "c"
        return REPO / f"apps/web/public/prooflayer-made/terrain/grass-{suffix}.png"
    if tile_id == 2:
        suffix = "b" if (x * 17 + y * 11 + x * y) % 5 == 0 else "a"
        return REPO / f"apps/web/public/prooflayer-made/terrain/dirt-{suffix}.png"
    if tile_id == 3:
        suffix = "b" if (x + y) % 2 == 0 else "a"
        return REPO / f"apps/web/public/prooflayer-made/terrain/water-{suffix}.png"
    if tile_id == 5:
        return TERRAIN[5]
    return TERRAIN.get(tile_id, TERRAIN[1])


def canvas_metrics(width: int, height: int) -> tuple[int, int, int, int]:
    corners = [
        grid_to_world(0, 0),
        grid_to_world(width - 1, 0),
        grid_to_world(0, height - 1),
        grid_to_world(width - 1, height - 1),
    ]
    xs = [point[0] for point in corners]
    ys = [point[1] for point in corners]
    min_x = min(xs) - PADDING_X
    max_x = max(xs) + PADDING_X
    min_y = min(ys) - PADDING_TOP
    max_y = max(ys) + PADDING_BOTTOM
    return min_x, min_y, max_x - min_x, max_y - min_y


def alpha_composite_origin(
    canvas: Image.Image,
    image: Image.Image,
    center_x: int,
    anchor_y: int,
    origin_y: float,
) -> None:
    x = round(center_x - image.width / 2)
    y = round(anchor_y - image.height * origin_y)
    canvas.alpha_composite(image, (x, y))


def draw_shadow(canvas: Image.Image, center_x: int, center_y: int, width: int, height: int) -> None:
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse(
        (
            center_x - width // 2,
            center_y - height // 2,
            center_x + width // 2,
            center_y + height // 2,
        ),
        fill=(24, 18, 10, 54),
    )
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(7)))


def render() -> None:
    map_data = json.loads(MAP_PATH.read_text())
    width = int(map_data["width"])
    height = int(map_data["height"])
    min_x, min_y, canvas_width, canvas_height = canvas_metrics(width, height)
    offset_x = -min_x
    offset_y = -min_y
    canvas = Image.new("RGBA", (canvas_width, canvas_height), (20, 42, 30, 255))

    terrain_layer = next(layer for layer in map_data["layers"] if layer["name"] == "Terrain")
    terrain_data = terrain_layer["data"]
    terrain_cache: dict[int, Image.Image] = {}
    for y in range(height):
        for x in range(width):
            tile_id = int(terrain_data[y * width + x])
            path = terrain_path(tile_id, x, y)
            cache_key = hash(path)
            terrain_cache.setdefault(cache_key, Image.open(path).convert("RGBA"))
            tile = terrain_cache[cache_key]
            world_x, world_y = grid_to_world(x, y)
            alpha_composite_origin(canvas, tile, world_x + offset_x, world_y + offset_y, 0.72)

    object_layer = next(layer for layer in map_data["layers"] if layer["name"] == "WorldObjects")
    objects = sorted(
        object_layer["objects"],
        key=lambda item: (
            prop_value(item.get("properties", []), "tileX", 0)
            + prop_value(item.get("properties", []), "tileY", 0),
            prop_value(item.get("properties", []), "depthOffset", 0),
        ),
    )
    asset_cache: dict[str, Image.Image] = {}
    for item in objects:
        properties = item.get("properties", [])
        asset_key = str(prop_value(properties, "assetKey", ""))
        asset_path = find_asset(asset_key)
        if not asset_path:
            continue

        if asset_key not in asset_cache:
            asset_cache[asset_key] = Image.open(asset_path).convert("RGBA")
        sprite = asset_cache[asset_key]
        scale = float(prop_value(properties, "scale", 1))
        origin_y = float(prop_value(properties, "originY", 0.88))
        tile_x = int(prop_value(properties, "tileX", 0))
        tile_y = int(prop_value(properties, "tileY", 0))
        y_offset = int(prop_value(properties, "yOffset", 0))
        world_x, world_y = grid_to_world(tile_x, tile_y)
        draw_x = world_x + offset_x
        draw_y = world_y + offset_y + y_offset
        resized = sprite.resize(
            (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))),
            Image.Resampling.LANCZOS,
        )
        draw_shadow(canvas, draw_x, draw_y - 7, max(28, resized.width // 2), max(12, resized.height // 8))
        alpha_composite_origin(canvas, resized, draw_x, draw_y, origin_y)

    center_x, center_y = grid_to_world(*VIEWPORT_CENTER)
    crop_left = max(0, min(canvas.width - VIEWPORT_WIDTH, center_x + offset_x - VIEWPORT_WIDTH // 2))
    crop_top = max(0, min(canvas.height - VIEWPORT_HEIGHT, center_y + offset_y - VIEWPORT_HEIGHT // 2))
    preview = canvas.crop(
        (
            int(crop_left),
            int(crop_top),
            int(crop_left + VIEWPORT_WIDTH),
            int(crop_top + VIEWPORT_HEIGHT),
        )
    )
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    preview.save(OUT_PATH)
    print(OUT_PATH)


if __name__ == "__main__":
    render()

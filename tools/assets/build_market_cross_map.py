from __future__ import annotations

import json
from pathlib import Path
from typing import Any


WIDTH = 64
HEIGHT = 64
OBJECT_SCALE = 50
WEB_MAP = Path("apps/web/public/prooflayer-made/maps/market-cross-showcase.json")
CONFIG_MAP = Path("packages/config/src/maps/market-cross-showcase.ts")

TILE = {
    "grass": 1,
    "dirt": 2,
    "water": 3,
    "stone": 4,
    "stone_alt": 5,
}


def rect(x1: int, y1: int, width: int, height: int) -> set[tuple[int, int]]:
    return {(x, y) for x in range(x1, x1 + width) for y in range(y1, y1 + height)}


def border(width: int, height: int) -> set[tuple[int, int]]:
    points: set[tuple[int, int]] = set()
    for x in range(width):
        points.add((x, 0))
        points.add((x, height - 1))
    for y in range(height):
        points.add((0, y))
        points.add((width - 1, y))
    return points


RIVER = {
    (x, y)
    for x in range(1, 12)
    for y in range(44, 63)
    if not (7 <= x <= 10 and 45 <= y <= 47)
}

BUILDINGS = (
    rect(29, 23, 8, 7)
    | rect(22, 31, 7, 6)
    | rect(38, 36, 7, 6)
)

COLLISION = border(WIDTH, HEIGHT) | RIVER | BUILDINGS


def tile_at(x: int, y: int) -> int:
    if (x, y) in RIVER:
        return TILE["water"]

    plaza = (
        29 <= x <= 39
        and 31 <= y <= 38
        and (x, y)
        not in {
            (29, 31),
            (39, 31),
            (29, 38),
            (39, 38),
            (30, 31),
            (38, 38),
        }
    )
    if plaza:
        return TILE["stone_alt"] if (x + y) % 3 == 0 else TILE["stone"]

    building_yards = (
        rect(28, 23, 10, 8)
        | rect(21, 31, 9, 7)
        | rect(38, 36, 8, 7)
    )
    if (x, y) in building_yards:
        return TILE["dirt"]

    west_road = 5 <= x <= 29 and abs(y - 35) <= 0
    east_road = 39 <= x <= 60 and abs(y - 34) <= 0
    north_road = 18 <= y <= 31 and abs(x - 34) <= 0
    south_road = 38 <= y <= 53 and abs(x - 35) <= 0
    road_shoulder = (
        (6 <= x <= 29 and abs(y - 35) == 1 and (x + y) % 4 != 0)
        or (39 <= x <= 60 and abs(y - 34) == 1 and (x + y) % 5 != 0)
        or (18 <= y <= 31 and abs(x - 34) == 1 and (x + y) % 4 != 0)
        or (38 <= y <= 53 and abs(x - 35) == 1 and (x + y) % 5 != 0)
    )
    if west_road or east_road or north_road or south_road or road_shoulder:
        return TILE["dirt"]

    return TILE["grass"]


def prop(
    object_id: int,
    name: str,
    object_type: str,
    asset_key: str,
    tile_x: int,
    tile_y: int,
    scale: float,
    y_offset: int = 0,
    depth_offset: int = 10,
    origin_y: float | None = None,
    label: str | None = None,
    kind: str | None = None,
) -> dict[str, Any]:
    properties: list[dict[str, Any]] = [
        {"name": "assetKey", "type": "string", "value": asset_key},
        {"name": "tileX", "type": "int", "value": tile_x},
        {"name": "tileY", "type": "int", "value": tile_y},
        {"name": "scale", "type": "float", "value": scale},
        {"name": "yOffset", "type": "int", "value": y_offset},
        {"name": "depthOffset", "type": "int", "value": depth_offset},
    ]
    if origin_y is not None:
        properties.append({"name": "originY", "type": "float", "value": origin_y})
    if label:
        properties.append({"name": "label", "type": "string", "value": label})
    if kind:
        properties.append({"name": "kind", "type": "string", "value": kind})

    return {
        "height": 1,
        "id": object_id,
        "name": name,
        "properties": properties,
        "rotation": 0,
        "type": object_type,
        "visible": True,
        "width": 1,
        "x": tile_x * 100,
        "y": tile_y * 50,
    }


def collision_object(point: tuple[int, int], object_id: int) -> dict[str, Any]:
    x, y = point
    return {
        "height": OBJECT_SCALE,
        "id": object_id,
        "name": f"market-cross-blocked-{x}-{y}",
        "rotation": 0,
        "type": "blocked",
        "visible": True,
        "width": OBJECT_SCALE,
        "x": x * OBJECT_SCALE,
        "y": y * OBJECT_SCALE,
    }


def build_world_objects() -> list[dict[str, Any]]:
    objects: list[dict[str, Any]] = []
    object_id = 1

    def add(
        name: str,
        object_type: str,
        asset_key: str,
        tile_x: int,
        tile_y: int,
        scale: float,
        y_offset: int = 0,
        depth_offset: int = 10,
        origin_y: float | None = None,
        label: str | None = None,
        kind: str | None = None,
    ) -> None:
        nonlocal object_id
        objects.append(
            prop(
                object_id,
                name,
                object_type,
                asset_key,
                tile_x,
                tile_y,
                scale,
                y_offset,
                depth_offset,
                origin_y,
                label,
                kind,
            )
        )
        object_id += 1

    add("Market Hall", "building", "qv-market-house", 33, 27, 0.78, -12, 44, 0.82, "Market Hall", "npc")
    add("Prooflayer Guild", "building", "qv-cottage", 25, 34, 0.74, -8, 38, 0.82, "Prooflayer Guild", "npc")
    add("Ember Forge", "building", "qv-stone-shop", 42, 39, 0.72, -8, 38, 0.82, "Ember Forge", "forge")

    add("Market Well", "prop", "medieval-well", 31, 36, 0.42, 0, 20)
    add("Market Stall", "prop", "prop-market-stall", 36, 36, 0.48, 2, 18)
    add("Supply Cart", "prop", "prop-cart-stall", 38, 35, 0.44, 2, 18)
    add("Coin Crate", "prop", "prop-coins", 37, 35, 0.28, 0, 14)
    add("Market Chest", "prop", "prop-chest", 29, 35, 0.42, 0, 14)
    add("Market Wagon", "prop", "qv-wagon", 34, 38, 0.46, 2, 18)
    add("Supply Crates", "prop", "qv-crate", 36, 34, 0.34, 0, 14)
    add("Market Bench", "prop", "medieval-bench", 32, 37, 0.42, 0, 12)
    add("Square Signpost", "prop", "medieval-signpost", 31, 32, 0.38, -2, 20)

    add("Guild Fence West", "fence", "qv-fence-extension", 22, 36, 0.36, 0, 12)
    add("Guild Fence South", "fence", "qv-fence-single", 27, 38, 0.38, 0, 12)
    add("Guild Firewood", "prop", "medieval-firewood", 27, 36, 0.38, 0, 10)
    add("Guild Trough", "prop", "medieval-trough", 23, 38, 0.32, 0, 10)
    add("Guild Pots", "prop", "medieval-pot-b", 28, 34, 0.26, 0, 10)

    add("Forge Hay", "prop", "medieval-haystack", 44, 42, 0.38, 0, 10)
    add("Forge Basin", "prop", "medieval-basin", 40, 41, 0.28, 0, 10)
    add("Forge Rock A", "nature", "nature-rock", 45, 35, 0.36, 0, 10)
    add("Forge Rock B", "nature", "nature-rock", 46, 36, 0.3, 0, 10)

    add("North Oak", "tree", "tree-common-b", 27, 29, 0.54, -4, 24)
    add("North Pine", "tree", "tree-pine-c", 38, 29, 0.56, -4, 24)
    add("Guild Oak", "tree", "tree-common-a", 22, 31, 0.52, -4, 24)
    add("Guild Back Oak", "tree", "tree-common-c", 21, 38, 0.5, -4, 24)
    add("Forge Pine", "tree", "tree-pine-a", 47, 37, 0.54, -4, 24)
    add("South Oak", "tree", "tree-common-c", 36, 44, 0.52, -4, 24)
    add("South Pine", "tree", "tree-pine-b", 42, 45, 0.5, -4, 24)
    add("West Road Oak", "tree", "tree-common-b", 18, 33, 0.48, -4, 24)
    add("East Road Pine", "tree", "tree-pine-c", 51, 33, 0.5, -4, 24)

    for index, (tile_x, tile_y, asset_key, scale) in enumerate(
        [
            (28, 31, "nature-flower-bush", 0.34),
            (29, 39, "nature-flower-bush", 0.3),
            (40, 33, "nature-flower-bush", 0.3),
            (44, 34, "nature-dawn-bloom", 0.28),
            (24, 30, "nature-starflax", 0.26),
            (26, 39, "nature-silverflax", 0.28),
            (39, 42, "nature-starflax", 0.24),
            (46, 40, "nature-dawn-bloom", 0.26),
            (33, 40, "nature-flower-bush", 0.28),
            (31, 30, "nature-silverflax", 0.24),
        ],
        start=1,
    ):
        add(f"Planted Verge {index}", "nature", asset_key, tile_x, tile_y, scale, 0, 10)

    return objects


def build_map() -> dict[str, Any]:
    terrain = [tile_at(x, y) for y in range(HEIGHT) for x in range(WIDTH)]
    collision = [
        collision_object(point, index + 1)
        for index, point in enumerate(sorted(COLLISION, key=lambda item: (item[1], item[0])))
    ]
    world_objects = build_world_objects()

    return {
        "compressionlevel": -1,
        "height": HEIGHT,
        "infinite": False,
        "layers": [
            {
                "data": terrain,
                "height": HEIGHT,
                "id": 1,
                "name": "Terrain",
                "opacity": 1,
                "type": "tilelayer",
                "visible": True,
                "width": WIDTH,
                "x": 0,
                "y": 0,
            },
            {
                "draworder": "topdown",
                "id": 2,
                "name": "Collision",
                "objects": collision,
                "opacity": 1,
                "type": "objectgroup",
                "visible": True,
                "x": 0,
                "y": 0,
            },
            {
                "draworder": "topdown",
                "id": 3,
                "name": "WorldObjects",
                "objects": world_objects,
                "opacity": 1,
                "type": "objectgroup",
                "visible": True,
                "x": 0,
                "y": 0,
            },
        ],
        "nextlayerid": 4,
        "nextobjectid": len(collision) + len(world_objects) + 1,
        "orientation": "isometric",
        "renderorder": "right-down",
        "tiledversion": "1.12.2",
        "tileheight": 50,
        "tilesets": [],
        "tilewidth": 100,
        "type": "map",
        "version": "1.10",
        "width": WIDTH,
    }


def write_web_map(map_data: dict[str, Any]) -> None:
    WEB_MAP.parent.mkdir(parents=True, exist_ok=True)
    WEB_MAP.write_text(json.dumps(map_data, indent=2) + "\n")


def write_config_map(map_data: dict[str, Any]) -> None:
    CONFIG_MAP.parent.mkdir(parents=True, exist_ok=True)
    json_text = json.dumps(map_data, indent=2)
    CONFIG_MAP.write_text(
        "// Generated by tools/assets/build_market_cross_map.py. Do not edit by hand.\n"
        f"export const MARKET_CROSS_SHOWCASE_MAP = {json_text} as const;\n"
    )


def main() -> None:
    map_data = build_map()
    write_web_map(map_data)
    write_config_map(map_data)


if __name__ == "__main__":
    main()

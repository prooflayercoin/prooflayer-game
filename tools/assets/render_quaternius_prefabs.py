from __future__ import annotations

import argparse
import math
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


@dataclass(frozen=True)
class Part:
    asset: str
    loc: tuple[float, float, float] = (0, 0, 0)
    rot_z: float = 0
    scale: float = 1


@dataclass(frozen=True)
class Prefab:
    name: str
    size: int
    parts: tuple[Part, ...]


PREFABS = (
    Prefab(
        "qv-cottage",
        520,
        (
            Part("Wall_WoodBrick_Window_Wide_Round.gltf", (-2.05, -2.75, 0)),
            Part("Wall_WoodBrick_Door_Round.gltf", (0, -2.75, 0)),
            Part("Wall_WoodBrick_Window_Wide_Round.gltf", (2.05, -2.75, 0)),
            Part("Wall_WoodBrick_Straight.gltf", (3.2, -1.65, 0), 90),
            Part("Wall_WoodBrick_Window_Wide_Round.gltf", (3.2, 0.4, 0), 90),
            Part("Wall_WoodBrick_Straight.gltf", (3.2, 2.45, 0), 90),
            Part("Roof_RoundTiles_6x8.gltf", (0, 0, 2.35)),
            Part("Roof_Front_Wood6.gltf", (0, -4.8, 2.25)),
            Part("Prop_Chimney.gltf", (-2.65, 0.9, 3.55), 0, 0.82),
            Part("Prop_Vine1.gltf", (-1.65, -3.03, 1.8), 0, 0.9),
            Part("Stairs_Exterior_Straight.gltf", (0, -3.9, -0.04), 0, 0.92),
        ),
    ),
    Prefab(
        "qv-market-house",
        620,
        (
            Part("Wall_Plaster_Window_Wide_Round.gltf", (-3.1, -3.2, 0)),
            Part("Wall_Plaster_Door_Round.gltf", (-1.03, -3.2, 0)),
            Part("Wall_Plaster_Window_Wide_Round.gltf", (1.03, -3.2, 0)),
            Part("Wall_Plaster_Window_Wide_Round.gltf", (3.1, -3.2, 0)),
            Part("Wall_Plaster_Straight.gltf", (4.15, -1.95, 0), 90),
            Part("Wall_Plaster_Window_Wide_Round.gltf", (4.15, 0.12, 0), 90),
            Part("Wall_Plaster_Window_Wide_Round.gltf", (4.15, 2.18, 0), 90),
            Part("Wall_Plaster_Straight.gltf", (4.15, 4.25, 0), 90),
            Part("Roof_RoundTiles_8x10.gltf", (0.25, 0.2, 2.55)),
            Part("Roof_Front_Wood8.gltf", (0.25, -5.92, 2.45)),
            Part("Roof_Dormer_RoundTile.gltf", (0.0, -4.0, 4.1), 0, 0.94),
            Part("Prop_Chimney2.gltf", (-3.65, 1.4, 3.82), 0, 0.9),
            Part("Prop_Vine5.gltf", (2.75, -3.55, 2.05), 0, 1),
            Part("Stairs_Exterior_Straight.gltf", (-1.03, -4.38, -0.04), 0, 0.94),
        ),
    ),
    Prefab(
        "qv-stone-shop",
        560,
        (
            Part("Wall_UnevenBrick_Window_Wide_Round.gltf", (-2.05, -2.75, 0)),
            Part("Wall_UnevenBrick_Door_Round.gltf", (0, -2.75, 0)),
            Part("Wall_UnevenBrick_Window_Wide_Round.gltf", (2.05, -2.75, 0)),
            Part("Wall_UnevenBrick_Straight.gltf", (3.2, -1.65, 0), 90),
            Part("Wall_UnevenBrick_Window_Wide_Round.gltf", (3.2, 0.4, 0), 90),
            Part("Wall_UnevenBrick_Straight.gltf", (3.2, 2.45, 0), 90),
            Part("Roof_FlatTiles_6x8.gltf", (0, 0, 2.35)),
            Part("Roof_Front_Brick6.gltf", (0, -4.8, 2.25)),
            Part("Prop_Chimney.gltf", (-2.85, 0.75, 3.58), 0, 0.85),
            Part("Stairs_Exterior_Straight.gltf", (0, -3.95, -0.04), 0, 0.9),
        ),
    ),
)


BLENDER_SCRIPT = r"""
from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def mesh_objects() -> list[bpy.types.Object]:
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def import_part(asset_path: Path, loc: tuple[float, float, float], rot_z: float, scale: float) -> None:
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(asset_path))
    new_objects = [obj for obj in bpy.context.scene.objects if obj not in before]
    radians = math.radians(rot_z)
    for obj in new_objects:
        obj.location.x += loc[0]
        obj.location.y += loc[1]
        obj.location.z += loc[2]
        obj.rotation_euler.z += radians
        obj.scale = (obj.scale.x * scale, obj.scale.y * scale, obj.scale.z * scale)


def bounds(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    bpy.context.view_layer.update()
    mins = Vector((float("inf"), float("inf"), float("inf")))
    maxs = Vector((float("-inf"), float("-inf"), float("-inf")))
    for obj in objects:
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            mins.x = min(mins.x, world.x)
            mins.y = min(mins.y, world.y)
            mins.z = min(mins.z, world.z)
            maxs.x = max(maxs.x, world.x)
            maxs.y = max(maxs.y, world.y)
            maxs.z = max(maxs.z, world.z)
    return mins, maxs


def center_scene() -> float:
    objects = mesh_objects()
    mins, maxs = bounds(objects)
    center = (mins + maxs) / 2
    for obj in objects:
        obj.location -= center
    bpy.context.view_layer.update()
    mins, maxs = bounds(objects)
    return max(maxs.x - mins.x, maxs.y - mins.y, maxs.z - mins.z)


def add_base_shadow(size: float) -> None:
    bpy.ops.mesh.primitive_circle_add(vertices=96, radius=max(size * 0.42, 2), fill_type="TRIFAN", location=(0, 0, -0.02))
    shadow = bpy.context.object
    shadow.name = "SoftContactShadow"
    shadow.scale.y = 0.58
    material = bpy.data.materials.new("SoftContactShadow_Mat")
    material.diffuse_color = (0.05, 0.035, 0.02, 0.28)
    shadow.data.materials.append(material)


def setup_camera(size: float, resolution: int) -> None:
    camera_data = bpy.data.cameras.new("ProoflayerIsoCamera")
    camera = bpy.data.objects.new("ProoflayerIsoCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    distance = max(size * 2.7, 8)
    camera.location = (distance, -distance, distance * 0.82)
    camera.rotation_euler = (math.radians(60), 0, math.radians(45))
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = max(size * 1.45, 6.8)
    bpy.context.scene.render.resolution_x = resolution
    bpy.context.scene.render.resolution_y = resolution
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.view_settings.view_transform = "Standard"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.eevee.taa_render_samples = 96


def setup_lighting(size: float) -> None:
    sun_data = bpy.data.lights.new("KeySun", "SUN")
    sun = bpy.data.objects.new("KeySun", sun_data)
    bpy.context.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(50), 0, math.radians(35))
    sun_data.energy = 2.9

    fill_data = bpy.data.lights.new("SoftFill", "AREA")
    fill = bpy.data.objects.new("SoftFill", fill_data)
    bpy.context.collection.objects.link(fill)
    fill.location = (-size * 0.75, size * 0.75, size * 1.4)
    fill_data.energy = 520
    fill_data.size = max(size * 1.6, 6)


def render(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.image_settings.file_format = "PNG"
    bpy.context.scene.render.image_settings.color_mode = "RGBA"
    bpy.context.scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)


argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
parser = argparse.ArgumentParser()
parser.add_argument("--asset-dir", required=True)
parser.add_argument("--out", required=True)
parser.add_argument("--resolution", type=int, default=1100)
parser.add_argument("parts", nargs="+")
args = parser.parse_args(argv)

clear_scene()
asset_dir = Path(args.asset_dir)
for encoded in args.parts:
    asset, x, y, z, rot_z, scale = encoded.split("|")
    import_part(asset_dir / asset, (float(x), float(y), float(z)), float(rot_z), float(scale))
size = center_scene()
add_base_shadow(size)
setup_lighting(size)
setup_camera(size, args.resolution)
render(Path(args.out))
"""


def run(command: list[str], cwd: Path) -> None:
    print(" ".join(command), flush=True)
    subprocess.run(command, cwd=cwd, check=True)


def postprocess(repo: Path, python_bin: str, raw: Path, out: Path, size: int) -> None:
    run(
        [
            python_bin,
            "tools/assets/postprocess_sprite.py",
            "--input",
            str(raw),
            "--out",
            str(out),
            "--size",
            str(size),
            "--padding",
            "28",
        ],
        repo,
    )
    warm_overbright_plaster(repo / out)


def warm_overbright_plaster(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha < 24:
                continue
            if red > 210 and green > 205 and blue > 190:
                pixels[x, y] = (176, 139, 88, alpha)
            elif red > 190 and green > 185 and blue > 175 and abs(red - green) < 24 and abs(green - blue) < 28:
                pixels[x, y] = (151, 124, 86, alpha)
    image.save(path)


def make_sheet(images: list[tuple[str, Path]], output: Path) -> None:
    tile = 220
    label_h = 34
    cols = 3
    rows = math.ceil(len(images) / cols)
    sheet = Image.new("RGBA", (cols * tile, rows * (tile + label_h)), (27, 24, 18, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("Arial.ttf", 13)
    except OSError:
        font = ImageFont.load_default()

    for index, (name, path) in enumerate(images):
        image = Image.open(path).convert("RGBA")
        image.thumbnail((tile - 20, tile - 20), Image.Resampling.LANCZOS)
        col = index % cols
        row = index // cols
        x0 = col * tile
        y0 = row * (tile + label_h)
        draw.rectangle((x0 + 7, y0 + 7, x0 + tile - 7, y0 + tile - 7), fill=(42, 35, 25, 255), outline=(133, 100, 55, 255), width=2)
        sheet.alpha_composite(image, (x0 + (tile - image.width) // 2, y0 + (tile - image.height) // 2))
        bbox = draw.textbbox((0, 0), name, font=font)
        draw.text((x0 + (tile - (bbox[2] - bbox[0])) // 2, y0 + tile + 8), name, fill=(238, 219, 174, 255), font=font)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--blender", default="blender")
    parser.add_argument("--python", default=".venv-assets/bin/python")
    parser.add_argument("--asset-dir", default=".asset-work/medieval-village-source/glTF")
    parser.add_argument("--raw-dir", default=".asset-work/renders/quaternius-prefabs")
    parser.add_argument("--out-dir", default="apps/web/public/prooflayer-made/blender-renders/quaternius-prefabs")
    parser.add_argument("--sheet", default="apps/web/public/prooflayer-made/blender-renders/quaternius-prefabs-contact-sheet.png")
    parser.add_argument("--resolution", type=int, default=1100)
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    raw_dir = Path(args.raw_dir)
    out_dir = Path(args.out_dir)
    temp_script = repo / ".asset-work" / "render_quaternius_prefab_inner.py"
    temp_script.parent.mkdir(parents=True, exist_ok=True)
    temp_script.write_text(BLENDER_SCRIPT)

    images: list[tuple[str, Path]] = []
    for prefab in PREFABS:
        raw = raw_dir / f"{prefab.name}-raw.png"
        out = out_dir / f"{prefab.name}.png"
        encoded_parts = [
            f"{part.asset}|{part.loc[0]}|{part.loc[1]}|{part.loc[2]}|{part.rot_z}|{part.scale}"
            for part in prefab.parts
        ]
        run(
            [
                args.blender,
                "--background",
                "--python",
                str(temp_script),
                "--",
                "--asset-dir",
                args.asset_dir,
                "--out",
                str(raw),
                "--resolution",
                str(args.resolution),
                *encoded_parts,
            ],
            repo,
        )
        postprocess(repo, args.python, raw, out, prefab.size)
        images.append((prefab.name, repo / out))

    make_sheet(images, repo / args.sheet)


if __name__ == "__main__":
    main()

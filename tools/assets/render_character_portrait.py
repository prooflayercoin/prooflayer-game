import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def import_asset(asset_path: Path) -> None:
    suffix = asset_path.suffix.lower()
    if suffix in {".gltf", ".glb"}:
        bpy.ops.import_scene.gltf(filepath=str(asset_path))
    elif suffix == ".fbx":
        bpy.ops.import_scene.fbx(filepath=str(asset_path))
    else:
        raise SystemExit(f"Unsupported character asset format: {asset_path}")


def mesh_objects() -> list[bpy.types.Object]:
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def normalize_objects(objects: list[bpy.types.Object]) -> tuple[Vector, float]:
    bpy.context.view_layer.update()
    mins = Vector((math.inf, math.inf, math.inf))
    maxs = Vector((-math.inf, -math.inf, -math.inf))
    for obj in objects:
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            mins.x = min(mins.x, world.x)
            mins.y = min(mins.y, world.y)
            mins.z = min(mins.z, world.z)
            maxs.x = max(maxs.x, world.x)
            maxs.y = max(maxs.y, world.y)
            maxs.z = max(maxs.z, world.z)

    center = (mins + maxs) / 2
    height = max(maxs.z - mins.z, 1)
    for obj in objects:
        obj.location -= center
    bpy.context.view_layer.update()
    return Vector((0, 0, 0)), height


def look_at(obj: bpy.types.Object, target: Vector) -> None:
    direction = target - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def setup_camera(height: float, resolution: int, turntable_degrees: float) -> None:
    camera_data = bpy.data.cameras.new("ProoflayerPortraitCamera")
    camera = bpy.data.objects.new("ProoflayerPortraitCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera

    target = Vector((0, 0, height * 0.16))
    distance = max(height * 2.2, 3)
    angle = math.radians(turntable_degrees)
    camera.location = (
        math.sin(angle) * height * 0.55,
        -math.cos(angle) * distance,
        height * 0.18,
    )
    look_at(camera, target)
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = max(height * 0.72, 1.2)

    bpy.context.scene.render.resolution_x = resolution
    bpy.context.scene.render.resolution_y = resolution
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.view_settings.view_transform = "Standard"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.eevee.taa_render_samples = 96


def setup_lighting(height: float) -> None:
    sun_data = bpy.data.lights.new("PortraitKeySun", "SUN")
    sun = bpy.data.objects.new("PortraitKeySun", sun_data)
    bpy.context.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(45), 0, math.radians(30))
    sun_data.energy = 2.2

    area_data = bpy.data.lights.new("PortraitSoftbox", "AREA")
    area = bpy.data.objects.new("PortraitSoftbox", area_data)
    bpy.context.collection.objects.link(area)
    area.location = (-height * 0.8, -height * 1.1, height * 1.1)
    area_data.energy = 480
    area_data.size = max(height * 1.8, 3)


def render(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.image_settings.file_format = "PNG"
    bpy.context.scene.render.image_settings.color_mode = "RGBA"
    bpy.context.scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--asset", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--resolution", type=int, default=1024)
    parser.add_argument("--turntable-degrees", type=float, default=18)
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
    args = parser.parse_args(argv)

    clear_scene()
    import_asset(Path(args.asset))
    objects = mesh_objects()
    if not objects:
        raise SystemExit("No mesh objects found in character asset")
    _, height = normalize_objects(objects)
    setup_camera(height, args.resolution, args.turntable_degrees)
    setup_lighting(height)
    render(Path(args.out))


if __name__ == "__main__":
    main()

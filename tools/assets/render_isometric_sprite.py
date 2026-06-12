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
    elif suffix == ".obj":
        bpy.ops.wm.obj_import(filepath=str(asset_path))
    else:
        raise SystemExit(f"Unsupported asset format: {asset_path}")


def apply_texture_atlas(texture_path: Path) -> None:
    image = bpy.data.images.load(str(texture_path))
    for obj in mesh_objects():
        if not obj.material_slots:
            material = bpy.data.materials.new(f"{obj.name}_Atlas")
            obj.data.materials.append(material)

        for slot in obj.material_slots:
            material = slot.material or bpy.data.materials.new(f"{obj.name}_Atlas")
            slot.material = material
            material.use_nodes = True
            nodes = material.node_tree.nodes
            links = material.node_tree.links
            bsdf = nodes.get("Principled BSDF")
            if not bsdf:
                continue

            texture = nodes.new(type="ShaderNodeTexImage")
            texture.image = image
            texture.interpolation = "Closest"
            links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
            if "Alpha" in texture.outputs and "Alpha" in bsdf.inputs:
                links.new(texture.outputs["Alpha"], bsdf.inputs["Alpha"])
                material.blend_method = "BLEND"


def mesh_objects():
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def matches_name(value: str, target: str, match: str) -> bool:
    value_lower = value.lower()
    target_lower = target.lower()
    if match == "exact":
        return value_lower == target_lower
    return target_lower in value_lower


def select_objects(target: str | None, match: str) -> list[bpy.types.Object]:
    meshes = mesh_objects()
    if not target:
        return meshes
    selected = [
        obj
        for obj in meshes
        if matches_name(obj.name, target, match)
        or (obj.parent and matches_name(obj.parent.name, target, match))
    ]
    if not selected:
        available = ", ".join(obj.name for obj in meshes[:80])
        raise SystemExit(
            f"No mesh object matched '{target}' with match='{match}'. Available: {available}"
        )
    return selected


def isolate(objects: list[bpy.types.Object]) -> None:
    keep = set(objects)
    for obj in list(bpy.context.scene.objects):
        if obj.type == "MESH" and obj not in keep:
            bpy.data.objects.remove(obj, do_unlink=True)


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
    size = max(maxs.x - mins.x, maxs.y - mins.y, maxs.z - mins.z)
    if size <= 0:
        size = 1

    for obj in objects:
        obj.location -= center
    bpy.context.view_layer.update()
    return Vector((0, 0, 0)), size


def setup_camera(size: float, resolution: int) -> None:
    camera_data = bpy.data.cameras.new("ProoflayerIsoCamera")
    camera = bpy.data.objects.new("ProoflayerIsoCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera

    distance = max(size * 3.1, 4)
    camera.location = (distance, -distance, distance * 0.72)
    camera.rotation_euler = (math.radians(60), 0, math.radians(45))
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = max(size * 1.9, 2.2)

    bpy.context.scene.render.resolution_x = resolution
    bpy.context.scene.render.resolution_y = resolution
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.view_settings.view_transform = "Standard"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.eevee.taa_render_samples = 64


def setup_lighting(size: float) -> None:
    sun_data = bpy.data.lights.new("KeySun", "SUN")
    sun = bpy.data.objects.new("KeySun", sun_data)
    bpy.context.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(50), 0, math.radians(32))
    sun_data.energy = 2.4

    area_data = bpy.data.lights.new("SoftFill", "AREA")
    area = bpy.data.objects.new("SoftFill", area_data)
    bpy.context.collection.objects.link(area)
    area.location = (-size, size, size * 2)
    area_data.energy = 350
    area_data.size = max(size * 2.5, 4)


def apply_render_style(objects: list[bpy.types.Object]) -> None:
    for obj in objects:
        obj.rotation_euler.z += math.radians(0)
        obj.select_set(True)


def render(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.image_settings.file_format = "PNG"
    bpy.context.scene.render.image_settings.color_mode = "RGBA"
    bpy.context.scene.render.filepath = str(output)
    bpy.ops.render.render(write_still=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--asset", required=True)
    parser.add_argument("--target", default=None)
    parser.add_argument(
        "--match",
        choices=("contains", "exact"),
        default="contains",
        help="Use exact to render one mesh or a parent group without neighboring variants.",
    )
    parser.add_argument("--out", required=True)
    parser.add_argument("--resolution", type=int, default=512)
    parser.add_argument("--texture", default=None, help="Optional texture atlas to apply to every imported mesh material.")
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
    args = parser.parse_args(argv)

    clear_scene()
    import_asset(Path(args.asset))
    if args.texture:
        apply_texture_atlas(Path(args.texture))
    objects = select_objects(args.target, args.match)
    isolate(objects)
    apply_render_style(objects)
    _, size = normalize_objects(objects)
    setup_camera(size, args.resolution)
    setup_lighting(size)
    render(Path(args.out))


if __name__ == "__main__":
    main()

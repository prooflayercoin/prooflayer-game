import argparse
import sys
from pathlib import Path

import bpy


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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--asset", required=True)
    parser.add_argument("--filter", default="")
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
    args = parser.parse_args(argv)

    clear_scene()
    import_asset(Path(args.asset))
    needle = args.filter.lower()
    for obj in sorted(bpy.context.scene.objects, key=lambda item: item.name.lower()):
        parent = obj.parent.name if obj.parent else ""
        row = f"{obj.type}\t{obj.name}\tparent={parent}"
        if not needle or needle in row.lower():
            print(row)


if __name__ == "__main__":
    main()

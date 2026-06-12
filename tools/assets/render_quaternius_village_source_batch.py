import argparse
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ASSETS = [
    ("qv-wagon", "Prop_Wagon.gltf", 336),
    ("qv-fence-single", "Prop_WoodenFence_Single.gltf", 272),
    ("qv-fence-extension", "Prop_WoodenFence_Extension1.gltf", 272),
    ("qv-metal-fence", "Prop_MetalFence_Simple.gltf", 256),
    ("qv-crate", "Prop_Crate.gltf", 220),
    ("qv-chimney", "Prop_Chimney.gltf", 220),
    ("qv-vine-a", "Prop_Vine1.gltf", 260),
    ("qv-vine-b", "Prop_Vine5.gltf", 260),
    ("qv-door-round", "Door_1_Round.gltf", 260),
    ("qv-door-frame", "DoorFrame_Round_WoodDark.gltf", 260),
    ("qv-shutters-open", "WindowShutters_Wide_Round_Open.gltf", 240),
    ("qv-window-wide", "Window_Wide_Round2.gltf", 240),
    ("qv-wall-door", "Wall_WoodBrick_Door_Round.gltf", 336),
    ("qv-wall-window", "Wall_WoodBrick_Window_Wide_Round.gltf", 336),
    ("qv-wall-plaster", "Wall_Plaster_WoodGrid.gltf", 336),
    ("qv-roof-flat-6x8", "Roof_FlatTiles_6x8.gltf", 420),
    ("qv-roof-round-6x8", "Roof_RoundTiles_6x8.gltf", 420),
    ("qv-roof-tower", "Roof_Tower_RoundTiles.gltf", 360),
    ("qv-stairs", "Stairs_Exterior_Straight.gltf", 300),
]


def run(command: list[str], cwd: Path) -> None:
    print(" ".join(command), flush=True)
    subprocess.run(command, cwd=cwd, check=True)


def make_contact_sheet(image_paths: list[tuple[str, Path]], output: Path) -> None:
    tile = 180
    label_h = 34
    cols = 5
    rows = (len(image_paths) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * tile, rows * (tile + label_h)), (28, 24, 18, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("Arial.ttf", 12)
    except OSError:
        font = ImageFont.load_default()

    for index, (name, path) in enumerate(image_paths):
        image = Image.open(path).convert("RGBA")
        image.thumbnail((tile - 22, tile - 22), Image.Resampling.LANCZOS)
        col = index % cols
        row = index // cols
        x0 = col * tile
        y0 = row * (tile + label_h)
        draw.rectangle(
            (x0 + 7, y0 + 7, x0 + tile - 7, y0 + tile - 7),
            fill=(45, 38, 28, 255),
            outline=(122, 96, 53, 255),
            width=2,
        )
        sheet.alpha_composite(image, (x0 + (tile - image.width) // 2, y0 + (tile - image.height) // 2))
        text_bbox = draw.textbbox((0, 0), name, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        draw.text((x0 + (tile - text_w) // 2, y0 + tile + 8), name, fill=(235, 220, 178, 255), font=font)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--blender", default="blender")
    parser.add_argument("--python", default=".venv-assets/bin/python")
    parser.add_argument("--asset-dir", default=".asset-work/medieval-village-source/glTF")
    parser.add_argument("--raw-dir", default=".asset-work/renders/quaternius-village-source")
    parser.add_argument("--out-dir", default="apps/web/public/prooflayer-made/blender-renders/quaternius-village")
    parser.add_argument("--sheet", default="apps/web/public/prooflayer-made/blender-renders/quaternius-village-source-contact-sheet.png")
    parser.add_argument("--resolution", type=int, default=960)
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    asset_dir = Path(args.asset_dir)
    raw_dir = Path(args.raw_dir)
    out_dir = Path(args.out_dir)
    image_paths: list[tuple[str, Path]] = []

    for file_name, asset_name, size in ASSETS:
        raw = raw_dir / f"{file_name}-raw.png"
        finished = out_dir / f"{file_name}.png"
        run(
            [
                args.blender,
                "--background",
                "--python",
                "tools/assets/render_isometric_sprite.py",
                "--",
                "--asset",
                str(asset_dir / asset_name),
                "--out",
                str(raw),
                "--resolution",
                str(args.resolution),
            ],
            repo,
        )
        run(
            [
                args.python,
                "tools/assets/postprocess_sprite.py",
                "--input",
                str(raw),
                "--out",
                str(finished),
                "--size",
                str(size),
                "--padding",
                "20",
            ],
            repo,
        )
        image_paths.append((file_name, repo / finished))

    make_contact_sheet(image_paths, repo / args.sheet)


if __name__ == "__main__":
    main()

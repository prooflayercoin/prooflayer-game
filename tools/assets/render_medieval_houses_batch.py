import argparse
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ASSETS = [
    ("house-guild", "House_01_full.fbx"),
    ("house-market", "House_03_full.fbx"),
    ("house-forge", "House_12_full.fbx"),
    ("house-chapel", "House_16_full.fbx"),
    ("house-cottage", "House_18_Full.fbx"),
]


def run(command: list[str], cwd: Path) -> None:
    print(" ".join(command), flush=True)
    subprocess.run(command, cwd=cwd, check=True)


def make_contact_sheet(image_paths: list[tuple[str, Path]], output: Path) -> None:
    tile = 232
    label_h = 34
    cols = 5
    rows = (len(image_paths) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * tile, rows * (tile + label_h)), (29, 24, 18, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("Arial.ttf", 14)
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
            (x0 + 8, y0 + 8, x0 + tile - 8, y0 + tile - 8),
            fill=(44, 37, 27, 255),
            outline=(115, 91, 52, 255),
            width=2,
        )
        sheet.alpha_composite(image, (x0 + (tile - image.width) // 2, y0 + (tile - image.height) // 2))
        text_bbox = draw.textbbox((0, 0), name, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        draw.text((x0 + (tile - text_w) // 2, y0 + tile + 7), name, fill=(235, 219, 176, 255), font=font)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--blender", default="blender")
    parser.add_argument("--python", default=".venv-assets/bin/python")
    parser.add_argument("--asset-dir", default=".asset-work/medieval-houses/fbx/House_Full_ordinar")
    parser.add_argument("--texture", default=".asset-work/medieval-houses/Texture/House_texture_atlas1.png")
    parser.add_argument("--raw-dir", default=".asset-work/renders/medieval-houses")
    parser.add_argument("--out-dir", default="apps/web/public/prooflayer-made/blender-renders/medieval-houses")
    parser.add_argument("--sheet", default="apps/web/public/prooflayer-made/blender-renders/medieval-houses-contact-sheet.png")
    parser.add_argument("--resolution", type=int, default=768)
    parser.add_argument("--size", type=int, default=384)
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    asset_dir = Path(args.asset_dir)
    raw_dir = Path(args.raw_dir)
    out_dir = Path(args.out_dir)
    image_paths: list[tuple[str, Path]] = []

    for file_name, asset_name in ASSETS:
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
                "--texture",
                args.texture,
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
                str(args.size),
                "--padding",
                "10",
            ],
            repo,
        )
        image_paths.append((file_name, repo / finished))

    make_contact_sheet(image_paths, repo / args.sheet)


if __name__ == "__main__":
    main()

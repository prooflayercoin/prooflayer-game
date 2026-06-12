import argparse
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


CHARACTER_ROOT = Path(
    ".asset-work/characters/Modular Character Outfits - Fantasy[Standard]/Exports/glTF (Godot-Unreal)/Outfits"
)

PORTRAITS = [
    ("warden-vale", "Male_Ranger.gltf", 18),
    ("trader-mara", "Female_Peasant.gltf", -16),
    ("smith-orren", "Male_Peasant.gltf", 14),
]


def run(command: list[str], cwd: Path) -> None:
    print(" ".join(command), flush=True)
    subprocess.run(command, cwd=cwd, check=True)


def alpha_bbox(image: Image.Image):
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    return image.getchannel("A").getbbox()


def frame_portrait(raw_path: Path, output_path: Path, size: int = 256) -> None:
    portrait = Image.open(raw_path).convert("RGBA")
    bbox = alpha_bbox(portrait)
    if bbox:
        portrait = portrait.crop(bbox)

    target = int(size * 0.82)
    scale = target / max(portrait.width, portrait.height)
    portrait = portrait.resize(
        (max(1, int(portrait.width * scale)), max(1, int(portrait.height * scale))),
        Image.Resampling.LANCZOS,
    )

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((10, 10, size - 10, size - 10), fill=(29, 20, 12, 255), outline=(117, 82, 42, 255), width=4)
    draw.rectangle((18, 18, size - 18, size - 18), outline=(226, 173, 84, 120), width=1)

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((35, 34, size - 35, size - 18), fill=(96, 68, 34, 110))
    glow = glow.filter(ImageFilter.GaussianBlur(16))
    canvas.alpha_composite(glow)

    shadow = Image.new("RGBA", portrait.size, (0, 0, 0, 0))
    shadow_alpha = portrait.getchannel("A").filter(ImageFilter.GaussianBlur(6))
    shadow.putalpha(shadow_alpha.point(lambda value: int(value * 0.42)))

    x = (size - portrait.width) // 2
    y = size - portrait.height - 15
    canvas.alpha_composite(shadow, (x + 2, y + 4))
    canvas.alpha_composite(portrait, (x, y))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path)


def make_contact_sheet(image_paths: list[tuple[str, Path]], output: Path) -> None:
    tile = 192
    label_h = 34
    cols = 3
    sheet = Image.new("RGBA", (cols * tile, tile + label_h), (29, 24, 18, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("Arial.ttf", 15)
    except OSError:
        font = ImageFont.load_default()

    for index, (name, path) in enumerate(image_paths):
        image = Image.open(path).convert("RGBA")
        image.thumbnail((tile - 18, tile - 18), Image.Resampling.LANCZOS)
        x0 = index * tile
        draw.rectangle((x0 + 8, 8, x0 + tile - 8, tile - 8), fill=(44, 37, 27, 255), outline=(115, 91, 52, 255), width=2)
        sheet.alpha_composite(image, (x0 + (tile - image.width) // 2, 11))
        text_bbox = draw.textbbox((0, 0), name, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        draw.text((x0 + (tile - text_w) // 2, tile + 7), name, fill=(235, 219, 176, 255), font=font)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--blender", default="blender")
    parser.add_argument("--raw-dir", default=".asset-work/renders/portraits")
    parser.add_argument("--out-dir", default="apps/web/public/prooflayer-made/quest-portraits")
    parser.add_argument("--sheet", default="apps/web/public/prooflayer-made/quest-portraits-contact-sheet.png")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    raw_dir = Path(args.raw_dir)
    out_dir = Path(args.out_dir)
    finished: list[tuple[str, Path]] = []

    for portrait_id, asset_name, turntable in PORTRAITS:
        raw = raw_dir / f"{portrait_id}-raw.png"
        output = out_dir / f"{portrait_id}.png"
        run(
            [
                args.blender,
                "--background",
                "--python",
                "tools/assets/render_character_portrait.py",
                "--",
                "--asset",
                str(CHARACTER_ROOT / asset_name),
                "--out",
                str(raw),
                "--resolution",
                "1024",
                "--turntable-degrees",
                str(turntable),
            ],
            repo,
        )
        frame_portrait(repo / raw, repo / output)
        finished.append((portrait_id, repo / output))

    make_contact_sheet(finished, repo / args.sheet)


if __name__ == "__main__":
    main()

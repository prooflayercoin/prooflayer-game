from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from make_ui_icon import make_icon


SKILL_SOURCES = {
    "reaping": "apps/web/public/prooflayer-made/blender-renders/nature/aether-stalk.png",
    "quarrying": "apps/web/public/prooflayer-made/blender-renders/mines/ore-rocks.png",
    "tempering": "apps/web/public/prooflayer-made/blender-renders/fantasy-props/anvil.png",
    "tracking": "apps/web/public/prooflayer-made/blender-renders/fantasy-props/wood-shield.png",
    "distilling": "apps/web/public/prooflayer-made/blender-renders/fantasy-props/potion-red.png",
    "sealing": "apps/web/public/prooflayer-made/blender-renders/fantasy-props/scroll-open.png",
}

OUT_DIR = Path("apps/web/public/prooflayer-made/ui-icons/skills")


def make_contact_sheet(paths: list[Path]) -> None:
    tile = 128
    label_h = 28
    cols = 6
    sheet = Image.new("RGBA", (cols * tile, tile + label_h), (29, 24, 18, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("Arial.ttf", 13)
    except OSError:
        font = ImageFont.load_default()

    for index, path in enumerate(paths):
        x = index * tile
        image = Image.open(path).convert("RGBA")
        draw.rectangle((x + 8, 8, x + tile - 8, tile - 8), fill=(44, 37, 27, 255), outline=(115, 91, 52, 255), width=2)
        sheet.alpha_composite(image, (x + (tile - image.width) // 2, 16))
        text_bbox = draw.textbbox((0, 0), path.stem, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        draw.text((x + (tile - text_w) // 2, tile + 5), path.stem, fill=(235, 219, 176, 255), font=font)

    sheet.convert("RGB").save(OUT_DIR.parent / "skills-contact-sheet.png")


def main() -> None:
    paths: list[Path] = []
    for skill, source in SKILL_SOURCES.items():
        output = OUT_DIR / f"{skill}.png"
        make_icon(Path(source), output, size=96, padding=8)
        paths.append(output)
    make_contact_sheet(paths)


if __name__ == "__main__":
    main()

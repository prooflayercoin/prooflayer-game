from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


PORTRAITS = [
    (
        "warden-vale",
        "apps/web/public/game/characters/male/Male_3_Idle0.png",
        "apps/web/public/prooflayer-made/ui-icons/skills/tracking.png",
        (82, 112, 145),
    ),
    (
        "trader-mara",
        "apps/web/public/game/characters/male/Male_2_Idle0.png",
        "apps/web/public/prooflayer-made/blender-renders/fantasy-props/coin-pile-large.png",
        (92, 128, 72),
    ),
    (
        "smith-orren",
        "apps/web/public/game/characters/male/Male_4_Idle0.png",
        "apps/web/public/prooflayer-made/ui-icons/skills/tempering.png",
        (145, 92, 64),
    ),
]

OUT_DIR = Path("apps/web/public/prooflayer-made/quest-portraits")


def keyed_character(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    key = image.getpixel((0, 0))[:3]
    tolerance = 18
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if abs(r - key[0]) <= tolerance and abs(g - key[1]) <= tolerance and abs(b - key[2]) <= tolerance:
                pixels[x, y] = (r, g, b, 0)
    bbox = image.getchannel("A").getbbox()
    return image.crop(bbox) if bbox else image


def tint_backlight(image: Image.Image, color: tuple[int, int, int]) -> Image.Image:
    alpha = image.getchannel("A").filter(ImageFilter.GaussianBlur(8))
    glow = Image.new("RGBA", image.size, (*color, 0))
    glow.putalpha(alpha.point(lambda value: int(value * 0.5)))
    return glow


def make_portrait(portrait_id: str, sprite_path: str, accent_path: str, color: tuple[int, int, int]) -> Path:
    size = 256
    sprite = keyed_character(Path(sprite_path))
    target_h = 184
    scale = target_h / sprite.height
    sprite = sprite.resize(
        (max(1, int(sprite.width * scale)), max(1, int(sprite.height * scale))),
        Image.Resampling.NEAREST,
    )

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((10, 10, size - 10, size - 10), fill=(29, 20, 12, 255), outline=(117, 82, 42, 255), width=4)
    draw.rectangle((18, 18, size - 18, size - 18), outline=(226, 173, 84, 120), width=1)
    draw.ellipse((36, 34, size - 36, size - 20), fill=(*color, 58))

    x = (size - sprite.width) // 2
    y = size - sprite.height - 18
    canvas.alpha_composite(tint_backlight(sprite, color), (x, y))
    canvas.alpha_composite(sprite, (x, y))

    accent = Image.open(accent_path).convert("RGBA")
    accent.thumbnail((58, 58), Image.Resampling.LANCZOS)
    badge = Image.new("RGBA", (72, 72), (0, 0, 0, 0))
    badge_draw = ImageDraw.Draw(badge)
    badge_draw.ellipse((4, 4, 68, 68), fill=(41, 27, 14, 230), outline=(194, 139, 62, 210), width=3)
    badge.alpha_composite(accent, ((72 - accent.width) // 2, (72 - accent.height) // 2))
    canvas.alpha_composite(badge, (size - 84, size - 88))

    output = OUT_DIR / f"{portrait_id}.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output)
    return output


def make_contact_sheet(paths: list[tuple[str, Path]]) -> None:
    tile = 192
    label_h = 34
    sheet = Image.new("RGBA", (len(paths) * tile, tile + label_h), (29, 24, 18, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("Arial.ttf", 15)
    except OSError:
        font = ImageFont.load_default()

    for index, (name, path) in enumerate(paths):
        image = Image.open(path).convert("RGBA")
        image.thumbnail((tile - 18, tile - 18), Image.Resampling.LANCZOS)
        x0 = index * tile
        draw.rectangle((x0 + 8, 8, x0 + tile - 8, tile - 8), fill=(44, 37, 27, 255), outline=(115, 91, 52, 255), width=2)
        sheet.alpha_composite(image, (x0 + (tile - image.width) // 2, 11))
        text_bbox = draw.textbbox((0, 0), name, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        draw.text((x0 + (tile - text_w) // 2, tile + 7), name, fill=(235, 219, 176, 255), font=font)

    sheet.convert("RGB").save("apps/web/public/prooflayer-made/quest-portraits-contact-sheet.png")


def main() -> None:
    outputs = [
        (portrait_id, make_portrait(portrait_id, sprite_path, accent_path, color))
        for portrait_id, sprite_path, accent_path, color in PORTRAITS
    ]
    make_contact_sheet(outputs)


if __name__ == "__main__":
    main()

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


OUT_DIR = Path("apps/web/public/prooflayer-made/ui")


def draw_panel() -> None:
    size = 512
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle((12, 12, 500, 500), radius=16, fill=(31, 20, 12, 250), outline=(130, 86, 42, 255), width=12)
    draw.rounded_rectangle((27, 27, 485, 485), radius=10, fill=(13, 10, 7, 245), outline=(47, 32, 19, 255), width=5)
    draw.rounded_rectangle((42, 42, 470, 470), radius=6, fill=(25, 16, 10, 242), outline=(104, 78, 41, 220), width=2)

    for offset in (58, 454):
        draw.line((64, offset, 448, offset), fill=(171, 129, 61, 210), width=3)
        draw.line((64, offset + 6, 448, offset + 6), fill=(44, 30, 15, 220), width=1)

    corner_fill = (118, 81, 37, 255)
    for x, y in ((58, 58), (454, 58), (58, 454), (454, 454)):
        draw.ellipse((x - 14, y - 14, x + 14, y + 14), fill=corner_fill)
        draw.line((x - 8, y, x + 8, y), fill=(226, 183, 91, 150), width=2)

    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(highlight)
    hdraw.polygon(((42, 42), (470, 42), (42, 470)), fill=(255, 242, 199, 18))
    image = Image.alpha_composite(image, highlight)
    image.save(OUT_DIR / "panel-frame.png")


def draw_slot() -> None:
    size = 128
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((6, 6, 122, 122), radius=8, fill=(53, 35, 18, 255), outline=(146, 95, 43, 255), width=5)
    draw.rounded_rectangle((17, 17, 111, 111), radius=4, fill=(7, 6, 5, 252), outline=(31, 22, 13, 255), width=5)
    draw.rectangle((23, 23, 105, 105), fill=(17, 12, 8, 244))
    draw.line((26, 26, 102, 26), fill=(102, 72, 35, 150), width=2)
    draw.line((26, 102, 102, 102), fill=(0, 0, 0, 120), width=2)
    image.save(OUT_DIR / "inventory-slot.png")


def draw_button(path: Path, active: bool) -> None:
    width, height = 256, 86
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    outer = (160, 106, 50, 255) if not active else (214, 158, 70, 255)
    fill = (40, 25, 13, 250) if not active else (55, 41, 20, 252)
    draw.rounded_rectangle((5, 7, width - 5, height - 7), radius=8, fill=outer)
    draw.rounded_rectangle((12, 14, width - 12, height - 14), radius=5, fill=fill, outline=(48, 30, 14, 255), width=3)
    draw.line((28, 24, width - 28, 24), fill=(197, 146, 64, 190), width=2)
    draw.line((28, height - 25, width - 28, height - 25), fill=(9, 6, 4, 160), width=2)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120))
    image.save(path)


def draw_orb_button() -> None:
    size = 152
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.ellipse((8, 8, 144, 144), fill=(80, 52, 25, 255), outline=(20, 13, 8, 255), width=4)
    draw.ellipse((18, 18, 134, 134), fill=(29, 20, 12, 255), outline=(165, 112, 55, 255), width=6)
    draw.ellipse((31, 31, 121, 121), fill=(38, 25, 13, 252), outline=(69, 45, 23, 255), width=2)
    draw.arc((28, 26, 123, 120), 205, 325, fill=(230, 192, 101, 130), width=4)
    draw.ellipse((42, 36, 76, 64), fill=(255, 237, 171, 35))
    image.save(OUT_DIR / "orb-button.png")


def draw_contact_sheet() -> None:
    paths = [OUT_DIR / name for name in ("panel-frame.png", "inventory-slot.png", "button-normal.png", "button-active.png", "orb-button.png")]
    tile = 190
    label_h = 30
    sheet = Image.new("RGBA", (len(paths) * tile, tile + label_h), (29, 24, 18, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("Arial.ttf", 13)
    except OSError:
        font = ImageFont.load_default()

    for index, path in enumerate(paths):
        image = Image.open(path).convert("RGBA")
        image.thumbnail((tile - 22, tile - 22), Image.Resampling.LANCZOS)
        x0 = index * tile
        draw.rectangle((x0 + 8, 8, x0 + tile - 8, tile - 8), fill=(44, 37, 27, 255), outline=(115, 91, 52, 255), width=2)
        sheet.alpha_composite(image, (x0 + (tile - image.width) // 2, 12 + (tile - image.height) // 2))
        label = path.stem
        bbox = draw.textbbox((0, 0), label, font=font)
        draw.text((x0 + (tile - (bbox[2] - bbox[0])) // 2, tile + 5), label, fill=(235, 219, 176, 255), font=font)

    sheet.convert("RGB").save(OUT_DIR / "ui-contact-sheet.png")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    draw_panel()
    draw_slot()
    draw_button(OUT_DIR / "button-normal.png", active=False)
    draw_button(OUT_DIR / "button-active.png", active=True)
    draw_orb_button()
    draw_contact_sheet()


if __name__ == "__main__":
    main()

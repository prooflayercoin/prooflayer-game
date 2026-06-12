from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFilter


OUT_DIR = Path("apps/web/public/prooflayer-made/terrain")
WIDTH = 100
HEIGHT = 64
TOP = [(50, -1), (102, 25), (50, 52), (-2, 25)]
LEFT_SIDE = [(-2, 25), (50, 52), (50, 62), (-2, 37)]
RIGHT_SIDE = [(102, 25), (50, 52), (50, 62), (102, 37)]


def jitter(color: tuple[int, int, int], amount: int, rng: random.Random) -> tuple[int, int, int]:
    return tuple(max(0, min(255, channel + rng.randint(-amount, amount))) for channel in color)


def make_tile(name: str, base: tuple[int, int, int], side: tuple[int, int, int], seed: int, motif: str) -> None:
    rng = random.Random(seed)
    image = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    if motif == "water":
        draw.polygon(LEFT_SIDE, fill=(*jitter(side, 5, rng), 180))
        draw.polygon(RIGHT_SIDE, fill=(*jitter(tuple(max(0, value - 10) for value in side), 5, rng), 180))
    draw.polygon(TOP, fill=(*base, 255))

    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    ImageDraw.Draw(mask).polygon(TOP, fill=255)
    texture = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(texture)

    for _ in range(72):
        x = rng.randint(6, WIDTH - 7)
        y = rng.randint(5, 45)
        if mask.getpixel((x, y)) == 0:
            continue
        radius = rng.randint(2, 8)
        color = jitter(base, 13, rng)
        alpha = rng.randint(14, 40)
        if motif == "water":
            tdraw.arc((x - radius * 2, y - radius, x + radius * 2, y + radius), 190, 350, fill=(*color, alpha), width=1)
        elif motif == "stone":
            x2 = x + rng.randint(-10, 10)
            y2 = y + rng.randint(-4, 4)
            tdraw.line((x, y, x2, y2), fill=(*jitter((90, 74, 52), 8, rng), rng.randint(24, 58)), width=1)
            if rng.random() < 0.35:
                tdraw.ellipse((x - 2, y - 1, x + 2, y + 1), fill=(*jitter((174, 151, 112), 12, rng), rng.randint(32, 66)))
        elif motif == "dirt":
            tdraw.ellipse((x - radius, y - radius // 2, x + radius, y + radius // 2), fill=(*color, alpha))
        else:
            if rng.random() < 0.45:
                tdraw.line((x, y, x + rng.randint(-5, 5), y + rng.randint(-2, 2)), fill=(*jitter((79, 127, 54), 10, rng), rng.randint(34, 72)), width=1)
            else:
                tdraw.ellipse((x - radius, y - radius // 2, x + radius, y + radius // 2), fill=(*color, alpha))

    texture.putalpha(Image.composite(texture.getchannel("A"), Image.new("L", (WIDTH, HEIGHT), 0), mask))
    image = Image.alpha_composite(image, texture.filter(ImageFilter.GaussianBlur(0.25)))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    image.save(OUT_DIR / f"{name}.png")


def main() -> None:
    make_tile("grass-a", (84, 136, 62), (70, 116, 52), 17, "grass")
    make_tile("grass-b", (88, 139, 64), (73, 118, 53), 31, "grass")
    make_tile("grass-c", (80, 132, 60), (67, 112, 50), 47, "grass")
    make_tile("dirt-a", (132, 94, 58), (110, 78, 49), 61, "dirt")
    make_tile("dirt-b", (126, 90, 56), (104, 74, 47), 79, "dirt")
    make_tile("stone-a", (135, 121, 96), (111, 94, 72), 131, "stone")
    make_tile("stone-b", (130, 116, 91), (106, 90, 69), 149, "stone")
    make_tile("water-a", (45, 101, 124), (37, 84, 108), 97, "water")
    make_tile("water-b", (42, 96, 119), (34, 80, 103), 113, "water")


if __name__ == "__main__":
    main()

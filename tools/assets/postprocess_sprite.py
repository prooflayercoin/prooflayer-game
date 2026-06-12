import argparse
from pathlib import Path

from PIL import Image, ImageFilter


def alpha_bbox(image: Image.Image):
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    return image.getchannel("A").getbbox()


def add_shadow(sprite: Image.Image, canvas_size: int) -> Image.Image:
    alpha = sprite.getchannel("A")
    shadow = Image.new("RGBA", sprite.size, (0, 0, 0, 0))
    shadow_alpha = alpha.filter(ImageFilter.GaussianBlur(9))
    shadow.putalpha(shadow_alpha.point(lambda value: int(value * 0.34)))

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_y = max(5, canvas_size // 42)
    canvas.alpha_composite(shadow, (0, offset_y))
    canvas.alpha_composite(sprite, (0, 0))
    return canvas


def process(input_path: Path, output_path: Path, size: int, padding: int) -> None:
    image = Image.open(input_path).convert("RGBA")
    bbox = alpha_bbox(image)
    if bbox:
        image = image.crop(bbox)

    max_side = max(image.width, image.height)
    target = max(1, size - padding * 2)
    scale = min(target / max_side, 1.0)
    resized = image.resize(
        (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
        Image.Resampling.LANCZOS,
    )

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - resized.width) // 2
    y = (size - resized.height) // 2
    canvas.alpha_composite(resized, (x, y))
    canvas = add_shadow(canvas, size)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--size", type=int, default=256)
    parser.add_argument("--padding", type=int, default=20)
    args = parser.parse_args()
    process(Path(args.input), Path(args.out), args.size, args.padding)


if __name__ == "__main__":
    main()

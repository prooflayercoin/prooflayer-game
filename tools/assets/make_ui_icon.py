import argparse
from pathlib import Path

from PIL import Image, ImageFilter


def alpha_bbox(image: Image.Image):
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    return image.getchannel("A").getbbox()


def make_icon(input_path: Path, output_path: Path, size: int, padding: int) -> None:
    image = Image.open(input_path).convert("RGBA")
    bbox = alpha_bbox(image)
    if bbox:
        image = image.crop(bbox)

    target = max(1, size - padding * 2)
    max_side = max(image.width, image.height)
    scale = target / max_side if max_side else 1
    resized = image.resize(
        (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
        Image.Resampling.LANCZOS,
    )

    shadow_alpha = resized.getchannel("A").filter(ImageFilter.GaussianBlur(3))
    shadow = Image.new("RGBA", resized.size, (0, 0, 0, 0))
    shadow.putalpha(shadow_alpha.point(lambda value: int(value * 0.45)))

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - resized.width) // 2
    y = (size - resized.height) // 2
    canvas.alpha_composite(shadow, (x, y + max(1, size // 48)))
    canvas.alpha_composite(resized, (x, y))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--size", type=int, default=96)
    parser.add_argument("--padding", type=int, default=8)
    args = parser.parse_args()
    make_icon(Path(args.input), Path(args.out), args.size, args.padding)


if __name__ == "__main__":
    main()

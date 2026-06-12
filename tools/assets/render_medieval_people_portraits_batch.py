import argparse
from pathlib import Path

from render_character_portraits_batch import frame_portrait, make_contact_sheet, run


PEOPLE_ROOT = Path(".asset-work/medieval-people/fbx/people_unity")

PORTRAITS = [
    ("warden-vale", "king.fbx", 10),
    ("trader-mara", "city_dwellers_1.fbx", -12),
    ("smith-orren", "peasant_1.fbx", 14),
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--blender", default="blender")
    parser.add_argument("--raw-dir", default=".asset-work/renders/medieval-people-portraits")
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
                str(PEOPLE_ROOT / asset_name),
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

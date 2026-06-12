# Prooflayer Asset Pipeline

This pipeline renders source 3D assets into transparent isometric PNGs for the current Phaser-based Prooflayer client.

## Installed Tools

- Blender 5.1.2
- Project virtualenv: `.venv-assets`
- Pillow 11.3.0
- ImageMagick, already available locally

## Render A 3D Asset

```bash
blender --background --python tools/assets/render_isometric_sprite.py -- \
  --asset .asset-work/mines/GLTF/MinesPack.gltf \
  --target Cart \
  --match contains \
  --out .asset-work/renders/mine-cart-raw.png \
  --resolution 768
```

Use `--match exact` when the pack contains neighboring names such as `Rail`, `Rail_C`, and `Rail_T`.

## Postprocess A Sprite

```bash
.venv-assets/bin/python tools/assets/postprocess_sprite.py \
  --input .asset-work/renders/mine-cart-raw.png \
  --out apps/web/public/prooflayer-made/blender-renders/mine-cart.png \
  --size 256 \
  --padding 18
```

## Render The Mine Starter Batch

```bash
.venv-assets/bin/python tools/assets/render_mine_batch.py
```

This renders a curated set of mine props/tools from the CC0 mine pack, postprocesses each PNG, and writes a review sheet to `apps/web/public/prooflayer-made/blender-renders/mine-contact-sheet.png`.

## Render The Fantasy Props Batch

```bash
.venv-assets/bin/python tools/assets/render_fantasy_props_batch.py
```

This renders standalone fantasy prop glTF files into inventory/shop/world sprites and writes `apps/web/public/prooflayer-made/blender-renders/fantasy-props-contact-sheet.png`.

If a glTF batch reports missing texture files, extract the shared texture images from the same ZIP into the same `.asset-work/.../Exports/glTF/` directory before rerendering.

## Render The Nature Batch

```bash
.venv-assets/bin/python tools/assets/render_nature_batch.py
```

This renders plant, flower, mushroom, bush, and small rock resources from the stylized nature pack and writes `apps/web/public/prooflayer-made/blender-renders/nature-contact-sheet.png`.

## Render The Nature Tree Batch

```bash
.venv-assets/bin/python tools/assets/render_nature_trees_batch.py --blender /opt/homebrew/bin/blender
```

This renders common, pine, twisted, and dead trees from the stylized nature pack and writes `apps/web/public/prooflayer-made/blender-renders/nature-trees-contact-sheet.png`.

## Render The Wildlife Batch

```bash
.venv-assets/bin/python tools/assets/render_wildlife_batch.py --blender /opt/homebrew/bin/blender
```

This renders selected wild animals from the Craftpix wildlife FBX pack. The renderer applies `texture/wild_animals_map.png` manually because FBX imports often miss the atlas.

## Render The Medieval Props Batch

```bash
.venv-assets/bin/python tools/assets/render_medieval_props_batch.py --blender /opt/homebrew/bin/blender
```

This renders village set dressing from the Craftpix medieval props FBX pack. The renderer applies `Textures/T_Medieval_ Props.png` manually because FBX imports often miss the atlas.

## Render The Medieval Building Batch

```bash
.venv-assets/bin/python tools/assets/render_medieval_houses_batch.py --blender /opt/homebrew/bin/blender
```

This renders complete medieval houses from the Craftpix free medieval houses pack. The renderer applies `Texture/House_texture_atlas1.png` manually because the FBX imports do not always resolve the atlas on their own.

## Render The Medieval Village Accent Batch

```bash
.venv-assets/bin/python tools/assets/render_medieval_village_props_batch.py --blender /opt/homebrew/bin/blender
```

This renders selected modular accents from `Medieval Village MegaKit[Standard].zip`, currently wagon, fence, vine, shutters, and round door.

## Build UI Icons From Rendered Assets

```bash
.venv-assets/bin/python tools/assets/make_skill_icons.py
```

This tightly crops selected Blender renders into HUD-friendly 96px skill icons and writes `apps/web/public/prooflayer-made/ui-icons/skills-contact-sheet.png`.

## Build UI Frames

```bash
.venv-assets/bin/python tools/assets/make_ui_frames.py
```

This generates the panel frame, inventory slot, rectangular buttons, round dock button, and `ui-contact-sheet.png` using Pillow.

## Build Terrain Variants

```bash
.venv-assets/bin/python tools/assets/make_terrain_tiles.py
```

This generates grass, dirt, stone, and water isometric terrain variants under `apps/web/public/prooflayer-made/terrain/`.

## Build The Market Cross Tiled Map

```bash
.venv-assets/bin/python tools/assets/build_market_cross_map.py
```

This exports the same authored Market Cross terrain, collision, and object layers to the browser Tiled JSON at `apps/web/public/prooflayer-made/maps/market-cross-showcase.json` and the server config source at `packages/config/src/maps/market-cross-showcase.ts`.

## Render The Market Cross Preview

```bash
.venv-assets/bin/python tools/assets/render_market_cross_preview.py
```

This renders the generated Tiled map plus the current PNG sprite library into `apps/web/public/prooflayer-made/maps/market-cross-preview.png` for quick visual review before opening the game.

## Render Quest Portraits

```bash
.venv-assets/bin/python tools/assets/render_character_portraits_batch.py
```

This renders three current NPC portraits from the modular character outfit pack, frames them with Pillow, and writes `apps/web/public/prooflayer-made/quest-portraits-contact-sheet.png`.

```bash
.venv-assets/bin/python tools/assets/render_medieval_people_portraits_batch.py
```

This renders the same portrait slots from the complete medieval-people FBX pack. Prefer this batch when the modular outfit pack is missing heads or pose data.

```bash
.venv-assets/bin/python tools/assets/make_sprite_quest_portraits.py
```

This builds framed quest portraits from the current in-game character sprites and rendered prop accents. Use this as the current reliable portrait source until a rigged character pack is approved.

## Notes

- Use `.asset-work/` for extracted source packs and intermediate renders. It is gitignored.
- Put finished game-ready sprites under `apps/web/public/prooflayer-made/blender-renders/`.
- The first smoke test rendered a mine cart frame from the CC0 mine pack. Before batch rendering, catalog mesh names so each target maps to the intended complete object, not just a component.

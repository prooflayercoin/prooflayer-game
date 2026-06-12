# Prooflayer Asset Audit

## Shipping In The Current Client

- Inventory icons: procedural PNGs under `apps/web/public/prooflayer-made/inventory-icons/`.
- Skill icons: Blender/Pillow PNGs under `apps/web/public/prooflayer-made/ui-icons/skills/`.
- UI frames/buttons: Pillow PNGs under `apps/web/public/prooflayer-made/ui/`.
- Quest portraits: sprite-derived framed portraits under `apps/web/public/prooflayer-made/quest-portraits/`.
- Shop signs: procedural PNGs under `apps/web/public/prooflayer-made/shop-signs/`.
- Item cards: procedural PNGs under `apps/web/public/prooflayer-made/item-cards/`.
- Terrain variants: Pillow-generated isometric grass, dirt, and water under `apps/web/public/prooflayer-made/terrain/`.
- Isometric resource/world sprites: Blender renders under `apps/web/public/prooflayer-made/blender-renders/`.

## Source Packs Used

- `Mines Asset_FBX_GLTF_Blend.zip`: good for rails, ore piles, mine cart frame, buckets, and mine decor. Current rendered mine assets are usable.
- `Fantasy Props MegaKit[Standard].zip`: good for standalone UI/world props such as anvil, pickaxe, potions, coins, banners, stalls, shields, swords, and chests.
- `Stylized Nature MegaKit[Standard].zip`: good for flowers, bushes, mushrooms, small rocks, and resource plants.
- `Stylized Nature MegaKit[Standard].zip`: good for common trees, pines, twisted trees, and dead trees when rendered from the glTF folder.
- `craftpix-net-649323-free-medieval-houses-3d-low-poly-pack.zip`: good complete house silhouettes after applying `Texture/House_texture_atlas1.png` manually through the renderer.
- `Medieval Village MegaKit[Standard].zip`: good modular accent kit for wagons, doors, shutters, vines, fences, and later custom house assembly.
- `craftpix-net-636502-free-wild-animal-3d-low-poly-models.zip`: usable for ambient wildlife after applying `texture/wild_animals_map.png` manually through the renderer.
- `craftpix-781167-free-medieval-props-3d-low-poly-pack.zip`: good town set dressing after applying `Textures/T_Medieval_ Props.png` manually through the renderer.

## Rejected Or Deferred

- `Modular Character Outfits - Fantasy[Standard].zip`: deferred for portraits because the first renders were T-pose/body-outfit only and did not include reliable heads.
- `craftpix-net-700077-free-medieval-3d-people-low-poly-models.zip`: deferred for portraits because initial FBX renders had missing texture or framing issues.
- Mine tool meshes from the mine pack: usable as parts, but weaker than the Fantasy Props tools for readable inventory/skill icons.

## Next Asset Requests For The User

- Complete rigged humanoid GLB/FBX characters with idle, walk/run, gather/mine, attack, and talk animations.
- Matching head/face meshes or portrait renders for quest-giver closeups.
- Full building packs in glTF/GLB when possible; FBX works, but often needs manual atlas binding.
- Water/shoreline and bridge props that match the top-down isometric angle.

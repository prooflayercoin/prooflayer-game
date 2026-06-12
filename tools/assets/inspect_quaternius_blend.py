from __future__ import annotations

from mathutils import Vector

import bpy


NAMES = [
    "Wall_WoodBrick_Door_Round",
    "Wall_WoodBrick_Window_Wide_Round",
    "Wall_WoodBrick_Straight",
    "Wall_Plaster_Straight",
    "Corner_Exterior_Wood",
    "Corner_ExteriorWide_Wood",
    "Roof_RoundTiles_6x8",
    "Roof_RoundTiles_8x10",
    "Roof_Front_Wood6",
    "Roof_Tower_RoundTiles",
    "Prop_Chimney",
    "Stairs_Exterior_Straight",
]


def world_bounds(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    mins = Vector((float("inf"), float("inf"), float("inf")))
    maxs = Vector((float("-inf"), float("-inf"), float("-inf")))
    for corner in obj.bound_box:
        world = obj.matrix_world @ Vector(corner)
        for index in range(3):
            mins[index] = min(mins[index], world[index])
            maxs[index] = max(maxs[index], world[index])
    return mins, maxs


for name in NAMES:
    obj = bpy.data.objects.get(name)
    if obj is None:
        print(f"{name}: missing")
        continue
    mins, maxs = world_bounds(obj)
    dims = maxs - mins
    print(
        f"{name}: loc={tuple(round(v, 3) for v in obj.location)} "
        f"rot={tuple(round(v, 3) for v in obj.rotation_euler)} "
        f"dims={tuple(round(v, 3) for v in dims)} "
        f"min={tuple(round(v, 3) for v in mins)} "
        f"max={tuple(round(v, 3) for v in maxs)}"
    )

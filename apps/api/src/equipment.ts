import { ITEMS } from "@prooflayer/config";
import { type EquipmentSlot } from "@prooflayer/shared";
import { prisma } from "./db.js";

export class ItemNotInInventoryError extends Error {
  constructor(public itemId: string) {
    super(`Item ${itemId} not in inventory`);
  }
}

export class ItemSlotMismatchError extends Error {
  constructor(public itemId: string, public slot: string) {
    super(`Item ${itemId} cannot be equipped in slot ${slot}`);
  }
}

export class SlotEmptyError extends Error {
  constructor(public slot: string) {
    super(`Slot ${slot} is empty`);
  }
}

export async function equipItem(
  characterId: string,
  slot: EquipmentSlot,
  itemId: string
): Promise<void> {
  const item = ITEMS[itemId];
  if (!item || item.category !== "equipment" || item.slot !== slot) {
    throw new ItemSlotMismatchError(itemId, slot);
  }

  await prisma.$transaction(async (tx: any) => {
    const stack = await tx.inventoryStack.findUnique({
      where: { characterId_itemId: { characterId, itemId } },
    });
    if (!stack || stack.quantity < 1n) {
      throw new ItemNotInInventoryError(itemId);
    }

    const slotRow = await tx.equipmentSlot.findUnique({
      where: { characterId_slot: { characterId, slot } },
    });
    const previousItemId = slotRow?.itemId ?? null;

    if (stack.quantity === 1n) {
      await tx.inventoryStack.delete({
        where: { characterId_itemId: { characterId, itemId } },
      });
    } else {
      await tx.inventoryStack.update({
        where: { characterId_itemId: { characterId, itemId } },
        data: { quantity: { decrement: 1n } },
      });
    }

    if (previousItemId) {
      await tx.inventoryStack.upsert({
        where: {
          characterId_itemId: { characterId, itemId: previousItemId },
        },
        create: { characterId, itemId: previousItemId, quantity: 1n },
        update: { quantity: { increment: 1n } },
      });
    }

    await tx.equipmentSlot.upsert({
      where: { characterId_slot: { characterId, slot } },
      create: { characterId, slot, itemId },
      update: { itemId },
    });

    await tx.auditEvent.create({
      data: {
        characterId,
        kind: "equipment_changed",
        payload: { slot, equipped: itemId, replaced: previousItemId },
      },
    });
  });
}

export async function unequipSlot(
  characterId: string,
  slot: EquipmentSlot
): Promise<void> {
  await prisma.$transaction(async (tx: any) => {
    const slotRow = await tx.equipmentSlot.findUnique({
      where: { characterId_slot: { characterId, slot } },
    });
    if (!slotRow?.itemId) throw new SlotEmptyError(slot);
    const itemId = slotRow.itemId;

    await tx.inventoryStack.upsert({
      where: { characterId_itemId: { characterId, itemId } },
      create: { characterId, itemId, quantity: 1n },
      update: { quantity: { increment: 1n } },
    });

    await tx.equipmentSlot.update({
      where: { characterId_slot: { characterId, slot } },
      data: { itemId: null },
    });

    await tx.auditEvent.create({
      data: {
        characterId,
        kind: "equipment_changed",
        payload: { slot, equipped: null, replaced: itemId },
      },
    });
  });
}

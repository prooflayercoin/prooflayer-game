import type { PlayerSnapshot, RegionSnapshot, WorldPosition } from "@prooflayer/shared";

export type InteractionKind =
  | "gather"
  | "mine"
  | "forge"
  | "track"
  | "distill"
  | "seal"
  | "npc";

export interface WorldInteraction {
  id: string;
  label: string;
  detail: string;
  actionId?: string;
  skillId?: string;
  kind: InteractionKind;
}

export interface GameBridge {
  onReady?: () => void;
  onHover?: (interaction: WorldInteraction | null) => void;
  onInteract?: (interaction: WorldInteraction) => void;
  onMove?: () => void;
  onMoveIntent?: (position: WorldPosition) => void;
}

export interface GameController {
  destroy: () => void;
  setActiveAction: (actionId: string | null) => void;
  setLocalCharacterId: (characterId: string | null) => void;
  applyRegionSnapshot: (snapshot: RegionSnapshot) => void;
  applyPlayerDelta: (players: PlayerSnapshot[], removedPlayerIds: string[]) => void;
}

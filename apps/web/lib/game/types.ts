export type InteractionKind = "gather" | "mine" | "forge" | "npc";

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
}

export interface GameController {
  destroy: () => void;
  setActiveAction: (actionId: string | null) => void;
}

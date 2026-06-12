"use client";

import {
  Backpack,
  Check,
  Coins,
  FlaskConical,
  Gem,
  Hammer,
  Heart,
  Map,
  MessageCircle,
  Monitor,
  Package,
  Pickaxe,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Square,
  Swords,
  TreePine,
  UserRound,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import type { GameController, WorldInteraction } from "@/lib/game/types";
import type {
  CharacterView,
  GameConfig,
  InventoryEntryView,
  SkillView,
} from "@/lib/types";
import type { WorldPosition, WorldServerMessage } from "@prooflayer/shared";

type Panel = "inventory" | "skills" | "quests" | "combat" | "map" | "settings";

type ItemDefinition = GameConfig["items"][string] & { slot?: string };

const DESKTOP_EXPERIENCE_QUERY = "(min-width: 900px)";

interface QuestState {
  status: "available" | "active" | "complete";
  step: string;
  detail: string;
}

const PANEL_TITLES: Record<Panel, string> = {
  inventory: "Backpack",
  skills: "Skills",
  quests: "Field Journal",
  combat: "Combat",
  map: "World Map",
  settings: "Settings",
};

const ITEM_ART: Record<string, string> = {
  aether_stalk: "/prooflayer-made/blender-renders/nature/aether-stalk.png",
  dawn_bloom: "/prooflayer-made/blender-renders/nature/dawn-bloom.png",
  starflax: "/prooflayer-made/blender-renders/nature/starflax.png",
  silverflax: "/prooflayer-made/blender-renders/nature/silverflax.png",
  apprentice_blade: "/prooflayer-made/blender-renders/fantasy-props/sword-bronze.png",
  dim_shard: "/prooflayer-made/blender-renders/mines/ore-rocks.png",
  radiant_shard: "/prooflayer-made/blender-renders/mines/ore-rocks.png",
  prismatic_shard: "/prooflayer-made/blender-renders/mines/ore-rocks.png",
  minor_tonic: "/prooflayer-made/blender-renders/fantasy-props/potion-red.png",
  sealing_draught: "/prooflayer-made/blender-renders/fantasy-props/potion-blue.png",
  dim_token: "/prooflayer-made/blender-renders/fantasy-props/coin-pile.png",
  bright_token: "/prooflayer-made/blender-renders/fantasy-props/coin-pile-large.png",
  radiant_token: "/prooflayer-made/blender-renders/fantasy-props/coin-pile-large.png",
};

const SKILL_ART: Record<string, string> = {
  reaping: "/prooflayer-made/ui-icons/skills/reaping.png",
  quarrying: "/prooflayer-made/ui-icons/skills/quarrying.png",
  tempering: "/prooflayer-made/ui-icons/skills/tempering.png",
  tracking: "/prooflayer-made/ui-icons/skills/tracking.png",
  distilling: "/prooflayer-made/ui-icons/skills/distilling.png",
  sealing: "/prooflayer-made/ui-icons/skills/sealing.png",
};

const QUEST_PORTRAITS = {
  firstTools: "/prooflayer-made/quest-portraits/warden-vale.png",
  seam: "/prooflayer-made/quest-portraits/smith-orren.png",
} as const;

function useDesktopExperience(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_EXPERIENCE_QUERY);
    const updateDesktopState = () => setIsDesktop(query.matches);
    updateDesktopState();
    query.addEventListener("change", updateDesktopState);
    return () => query.removeEventListener("change", updateDesktopState);
  }, []);

  return isDesktop;
}

function DesktopRequired({ checking = false }: { checking?: boolean }) {
  return (
    <main className="desktop-gate" aria-label="Prooflayer desktop requirement">
      <div className="desktop-gate-scene" aria-hidden="true">
        <img
          className="desktop-gate-house house-a"
          src="/prooflayer-made/blender-renders/medieval-houses/house-guild.png"
          alt=""
        />
        <img
          className="desktop-gate-house house-b"
          src="/prooflayer-made/blender-renders/medieval-houses/house-market.png"
          alt=""
        />
        <img
          className="desktop-gate-prop prop-a"
          src="/prooflayer-made/blender-renders/medieval-props/medieval-well.png"
          alt=""
        />
        <img
          className="desktop-gate-prop prop-b"
          src="/prooflayer-made/blender-renders/fantasy-props/market-stall.png"
          alt=""
        />
        <span className="desktop-gate-road road-main" />
        <span className="desktop-gate-road road-cross" />
      </div>

      <section className="desktop-gate-panel">
        <span className="desktop-gate-rune">P</span>
        <div>
          <span className="desktop-gate-kicker">Prooflayer</span>
          <h1>{checking ? "Checking Display" : "Desktop Browser Required"}</h1>
          <p>
            {checking
              ? "Preparing the right view for Market Cross."
              : "Market Cross needs a wider canvas built for laptop and desktop play."}
          </p>
          {!checking && <p>Open Prooflayer on a laptop or desktop browser to play.</p>}
        </div>
        <div className="desktop-gate-spec">
          <Monitor aria-hidden="true" />
          <span>{checking ? "One moment" : "Recommended width: 900px+"}</span>
        </div>
      </section>
    </main>
  );
}

function AuthGate({
  mode,
  email,
  password,
  characterName,
  error,
  pending,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onCharacterNameChange,
  onSubmit,
}: {
  mode: "login" | "register";
  email: string;
  password: string;
  characterName: string;
  error: string | null;
  pending: boolean;
  onModeChange: (mode: "login" | "register") => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onCharacterNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="auth-gate" aria-label="Prooflayer account">
      <section className="auth-panel">
        <div className="auth-mark">
          <span className="brand-rune">P</span>
          <div>
            <span>Prooflayer</span>
            <h1>{mode === "login" ? "Enter World 1" : "Create Your Prooflayer"}</h1>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => onEmailChange(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "register" ? 8 : undefined}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
            />
          </label>
          {mode === "register" && (
            <label>
              <span>Character</span>
              <input
                type="text"
                value={characterName}
                autoComplete="nickname"
                minLength={3}
                maxLength={24}
                onChange={(event) => onCharacterNameChange(event.target.value)}
                required
              />
            </label>
          )}
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={pending}>
            {pending ? "Working..." : mode === "login" ? "Enter World" : "Create Account"}
          </button>
        </form>
        <button
          type="button"
          className="auth-switch"
          onClick={() => onModeChange(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create account" : "Use existing account"}
        </button>
      </section>
    </main>
  );
}

function formatNumber(value: string | number): string {
  const number = typeof value === "string" ? Number(value) : value;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}m`;
  if (number >= 10_000) return `${(number / 1_000).toFixed(1)}k`;
  return number.toLocaleString();
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  if (totalSeconds <= 1) return "<1s";
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function inventoryQuantity(character: CharacterView | null, itemId: string): number {
  const item = character?.inventory.find((entry) => entry.itemId === itemId);
  return item ? Number(item.quantity) : 0;
}

function buildRewardToast(
  previous: CharacterView,
  next: CharacterView
): string | null {
  const gains: string[] = [];
  const previousGold = Number(previous.gold);
  const nextGold = Number(next.gold);
  if (nextGold > previousGold) gains.push(`+${formatNumber(nextGold - previousGold)} gold`);

  for (const nextSkill of next.skills) {
    const previousSkill = previous.skills.find((skill) => skill.id === nextSkill.id);
    const xpGain = Number(nextSkill.xp) - Number(previousSkill?.xp ?? 0);
    if (xpGain > 0) gains.push(`+${formatNumber(xpGain)} ${nextSkill.name} XP`);
  }

  for (const nextItem of next.inventory) {
    const previousItem = previous.inventory.find(
      (item) => item.itemId === nextItem.itemId
    );
    const quantityGain = Number(nextItem.quantity) - Number(previousItem?.quantity ?? 0);
    if (quantityGain > 0) gains.push(`+${formatNumber(quantityGain)} ${nextItem.name}`);
  }

  if (gains.length === 0) return null;
  return gains.slice(0, 4).join(" · ");
}

function questState(character: CharacterView | null, questStarted: boolean): QuestState {
  const hasStalk = inventoryQuantity(character, "aether_stalk") > 0;
  const hasShard = inventoryQuantity(character, "dim_shard") > 0;

  if (hasStalk && hasShard) {
    return {
      status: "complete",
      step: "Return to Warden Vale",
      detail: "You have gathered the first proof supplies.",
    };
  }

  if (!questStarted) {
    return {
      status: "available",
      step: "Speak to Warden Vale",
      detail: "Warden Vale is waiting near the Market Hall.",
    };
  }

  if (!hasStalk) {
    return {
      status: "active",
      step: "Cut aether stalks",
      detail: "Gather one aether stalk from the west grove.",
    };
  }

  return {
    status: "active",
    step: "Chip dim shards",
    detail: "Mine one dim shard from the eastern vein.",
  };
}

function SkillIcon({ skill }: { skill: string }) {
  const art = SKILL_ART[skill];
  if (art) {
    return <img src={art} alt="" aria-hidden="true" />;
  }
  if (skill === "reaping") return <TreePine aria-hidden="true" />;
  if (skill === "quarrying") return <Pickaxe aria-hidden="true" />;
  if (skill === "tempering") return <Hammer aria-hidden="true" />;
  if (skill === "tracking") return <Swords aria-hidden="true" />;
  if (skill === "distilling") return <FlaskConical aria-hidden="true" />;
  return <Sparkles aria-hidden="true" />;
}

function ItemIcon({ item }: { item: InventoryEntryView }) {
  const art = ITEM_ART[item.itemId];
  if (art) {
    return <img src={art} alt="" aria-hidden="true" />;
  }
  if (item.itemId.includes("shard") || item.itemId.includes("token")) {
    return <Gem aria-hidden="true" />;
  }
  if (item.category === "consumable") return <FlaskConical aria-hidden="true" />;
  if (item.category === "equipment") return <Shield aria-hidden="true" />;
  if (item.itemId.includes("stalk") || item.itemId.includes("flax")) {
    return <TreePine aria-hidden="true" />;
  }
  return <Package aria-hidden="true" />;
}

function InteractionIcon({ interaction }: { interaction: WorldInteraction }) {
  if (interaction.kind === "gather") return <TreePine aria-hidden="true" />;
  if (interaction.kind === "mine") return <Pickaxe aria-hidden="true" />;
  if (interaction.kind === "forge") return <Hammer aria-hidden="true" />;
  if (interaction.kind === "track") return <Swords aria-hidden="true" />;
  if (interaction.kind === "distill") return <FlaskConical aria-hidden="true" />;
  if (interaction.kind === "seal") return <Sparkles aria-hidden="true" />;
  return <MessageCircle aria-hidden="true" />;
}

function ProoflayerPlayClient() {
  const gameHostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameController | null>(null);
  const characterRef = useRef<CharacterView | null>(null);
  const rewardBaselineRef = useRef<CharacterView | null>(null);
  const worldSocketRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef(false);
  const stoppingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [config, setConfig] = useState<GameConfig | null>(null);
  const [character, setCharacter] = useState<CharacterView | null>(null);
  const [account, setAccount] = useState<{ id: string; email: string } | null>(null);
  const [characters, setCharacters] = useState<Array<{ id: string; name: string; worldId: string }>>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCharacterName, setAuthCharacterName] = useState("Apprentice");
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [hovered, setHovered] = useState<WorldInteraction | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [questStarted, setQuestStarted] = useState(false);

  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await api.getState();
      const rewardToast = rewardBaselineRef.current
        ? buildRewardToast(rewardBaselineRef.current, response.character)
        : null;
      setCharacter(response.character);
      characterRef.current = response.character;
      rewardBaselineRef.current = response.character;
      gameRef.current?.setActiveAction(
        response.character.activeAction?.actionId ?? null
      );
      if (rewardToast) showToast(rewardToast);
      setError(null);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : String(refreshError)
      );
    }
  }, [showToast]);

  useEffect(() => {
    let disposed = false;
    void api
      .getSession()
      .then((session) => {
        if (disposed || !session.account) return;
        setAccount(session.account);
        setCharacters(session.characters);
        setSelectedCharacterId(session.characters[0]?.id ?? null);
      })
      .catch(() => {
        if (!disposed) {
          setAccount(null);
          setCharacters([]);
          setSelectedCharacterId(null);
        }
      })
      .finally(() => {
        if (!disposed) setSessionChecked(true);
      });
    return () => {
      disposed = true;
    };
  }, []);

  const handleAuthSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthPending(true);
      setAuthError(null);
      try {
        const response =
          authMode === "login"
            ? await api.login({ email: authEmail, password: authPassword })
            : await api.register({
                email: authEmail,
                password: authPassword,
                characterName: authCharacterName,
              });
        setAccount(response.account);
        setCharacters(response.characters);
        setSelectedCharacterId(response.characters[0]?.id ?? null);
        await refresh();
      } catch (authSubmitError) {
        setAuthError(
          authSubmitError instanceof Error ? authSubmitError.message : String(authSubmitError)
        );
      } finally {
        setAuthPending(false);
      }
    },
    [authCharacterName, authEmail, authMode, authPassword, refresh]
  );

  const stopAction = useCallback(async () => {
    if (!characterRef.current?.activeAction || stoppingRef.current) return;
    stoppingRef.current = true;
    try {
      await api.stopAction();
      gameRef.current?.setActiveAction(null);
      await refresh();
      showToast("Action stopped");
    } catch (stopError) {
      setError(stopError instanceof Error ? stopError.message : String(stopError));
    } finally {
      stoppingRef.current = false;
    }
  }, [refresh, showToast]);

  const equipSelectedItem = useCallback(async () => {
    if (!selectedItemId || !config) return;
    const item = config.items[selectedItemId] as ItemDefinition | undefined;
    if (!item?.slot) return;
    try {
      const response = await api.equip(item.slot, selectedItemId);
      setCharacter(response.character);
      characterRef.current = response.character;
      rewardBaselineRef.current = response.character;
      setSelectedItemId(null);
      showToast(`${item.name} equipped`);
    } catch (equipError) {
      setError(equipError instanceof Error ? equipError.message : String(equipError));
    }
  }, [config, selectedItemId, showToast]);

  const unequipItem = useCallback(
    async (slot: string) => {
      try {
        const response = await api.unequip(slot);
        setCharacter(response.character);
        characterRef.current = response.character;
        rewardBaselineRef.current = response.character;
        showToast(`${slot} slot cleared`);
      } catch (unequipError) {
        setError(
          unequipError instanceof Error ? unequipError.message : String(unequipError)
        );
      }
    },
    [showToast]
  );

  const handleWorldInteraction = useCallback(
    async (interaction: WorldInteraction) => {
      if (interaction.kind === "npc") {
        if (interaction.id === "warden-vale") {
          setQuestStarted(true);
          setPanel("quests");
          showToast("First Tools updated");
        } else {
          showToast(`${interaction.label}: ${interaction.detail}`);
        }
        return;
      }

      if (!interaction.actionId || pendingRef.current) return;
      pendingRef.current = true;
      try {
        await api.startAction(interaction.actionId);
        await refresh();
        showToast(`${interaction.label} started`);
      } catch (interactionError) {
        setError(
          interactionError instanceof Error
            ? interactionError.message
            : String(interactionError)
        );
      } finally {
        pendingRef.current = false;
      }
    },
    [refresh, showToast]
  );

  const sendWorldMoveIntent = useCallback((position: WorldPosition) => {
    const socket = worldSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      showToast("World connection is still opening");
      return;
    }
    socket.send(
      JSON.stringify({
        type: "move_to",
        requestId: `move-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        to: position,
      })
    );
  }, [showToast]);

  useEffect(() => {
    let disposed = false;
    if (!gameHostRef.current || !account || !selectedCharacterId) return;

    void import("@/lib/game/createGame")
      .then(({ createProoflayerGame }) => {
        if (disposed || !gameHostRef.current) return;
        gameRef.current = createProoflayerGame(gameHostRef.current, {
          onReady: () => setGameReady(true),
          onHover: setHovered,
          onInteract: (interaction) => {
            void handleWorldInteraction(interaction);
          },
          onMove: () => {
            setPanel(null);
            setSelectedItemId(null);
            void stopAction();
          },
          onMoveIntent: sendWorldMoveIntent,
        });
      })
      .catch((gameError) => {
        setError(gameError instanceof Error ? gameError.message : String(gameError));
      });

    return () => {
      disposed = true;
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [account, handleWorldInteraction, selectedCharacterId, sendWorldMoveIntent, stopAction]);

  useEffect(() => {
    if (!character || !selectedCharacterId || !gameReady) return;

    const worldId = character.worldId || "world-1";
    const socket = new WebSocket(api.wsWorldUrl(worldId));
    worldSocketRef.current = socket;

    socket.addEventListener("open", () => {
      gameRef.current?.setLocalCharacterId(selectedCharacterId);
      window.setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) return;
        socket.send(
          JSON.stringify({
            type: "join_world",
            worldId,
            characterId: selectedCharacterId,
          })
        );
      }, 200);
      showToast(`Joining ${worldId}`);
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as WorldServerMessage;
      if (message.type === "joined") {
        gameRef.current?.setLocalCharacterId(message.characterId);
        return;
      }
      if (message.type === "region_snapshot") {
        gameRef.current?.applyRegionSnapshot(message.snapshot);
        return;
      }
      if (message.type === "player_delta") {
        gameRef.current?.applyPlayerDelta(message.players, message.removedPlayerIds);
        return;
      }
      if (message.type === "chat_message") {
        showToast(`${message.fromName}: ${message.text}`);
        return;
      }
      if (message.type === "error") {
        setError(message.message);
      }
    });

    socket.addEventListener("close", () => {
      if (worldSocketRef.current === socket) worldSocketRef.current = null;
    });

    socket.addEventListener("error", () => {
      setError("World connection interrupted");
    });

    return () => {
      socket.close();
      if (worldSocketRef.current === socket) worldSocketRef.current = null;
    };
  }, [character?.id, character?.worldId, gameReady, selectedCharacterId, showToast]);

  useEffect(() => {
    void api
      .getConfig()
      .then(setConfig)
      .catch((configError) => {
        setError(configError instanceof Error ? configError.message : String(configError));
      });
    if (!account || !selectedCharacterId) return;
    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 1000);
    return () => clearInterval(interval);
  }, [account, refresh, selectedCharacterId]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const activeSkill = useMemo(() => {
    if (!character?.activeAction) return null;
    return character.skills.find(
      (skill) => skill.id === character.activeAction?.skillId
    );
  }, [character]);
  const activeActionProgress = character?.activeAction
    ? Math.min(100, Math.max(0, Math.round(character.activeAction.progress * 100)))
    : 0;

  const inventorySlots = useMemo(() => {
    const slots: Array<InventoryEntryView | null> = [
      ...(character?.inventory ?? []),
    ];
    while (slots.length < 28) slots.push(null);
    return slots.slice(0, 28);
  }, [character]);

  const selectedItem = useMemo(() => {
    if (!selectedItemId || !config) return null;
    const entry = character?.inventory.find((item) => item.itemId === selectedItemId);
    const item = config.items[selectedItemId] as ItemDefinition | undefined;
    if (!entry || !item) return null;
    return { ...entry, ...item };
  }, [character, config, selectedItemId]);

  const currentQuest = useMemo(
    () => questState(character, questStarted),
    [character, questStarted]
  );

  const togglePanel = useCallback((nextPanel: Panel) => {
    setPanel((current) => (current === nextPanel ? null : nextPanel));
  }, []);

  useEffect(() => {
    const handlePanelShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, [contenteditable='true']") ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "escape") {
        event.preventDefault();
        setPanel(null);
        return;
      }
      if (key === "i") {
        event.preventDefault();
        togglePanel("inventory");
        return;
      }
      if (key === "k") {
        event.preventDefault();
        togglePanel("skills");
        return;
      }
      if (key === "j") {
        event.preventDefault();
        togglePanel("quests");
        return;
      }
      if (key === "c") {
        event.preventDefault();
        togglePanel("combat");
        return;
      }
      if (key === "m") {
        event.preventDefault();
        togglePanel("map");
      }
    };

    window.addEventListener("keydown", handlePanelShortcut);
    return () => window.removeEventListener("keydown", handlePanelShortcut);
  }, [togglePanel]);

  if (!sessionChecked) {
    return <DesktopRequired checking />;
  }

  if (!account) {
    return (
      <AuthGate
        mode={authMode}
        email={authEmail}
        password={authPassword}
        characterName={authCharacterName}
        error={authError}
        pending={authPending}
        onModeChange={setAuthMode}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onCharacterNameChange={setAuthCharacterName}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <main
      className={`game-shell ${reducedMotion ? "reduced-motion" : ""}`}
      aria-label="Prooflayer game"
    >
      <div ref={gameHostRef} className="game-world" />
      <div className="world-vignette" aria-hidden="true" />

      <section className="hud-status" aria-label="Character status">
        <div className="brand-mark">
          <span className="brand-rune">P</span>
          <div>
            <strong>Prooflayer</strong>
            <span>{character?.regionId?.replaceAll("_", " ") ?? "World 1"}</span>
          </div>
        </div>
        <div className="status-bars">
          <div className="status-line health-line">
            <Heart aria-hidden="true" />
            <span>
              {character?.hp ?? 10} / {character?.maxHp ?? 10}
            </span>
            <div className="status-track">
              <span
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, ((character?.hp ?? 10) / (character?.maxHp ?? 10)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="status-line energy-line">
            <Zap aria-hidden="true" />
            <span>100%</span>
            <div className="status-track">
              <span style={{ width: "100%" }} />
            </div>
          </div>
        </div>
        <div className="status-meta">
          <span>
            <UserRound aria-hidden="true" />
            {character?.name ?? "Apprentice"}
          </span>
          <span>
            <Shield aria-hidden="true" />
            Total {character?.totalLevel ?? 6}
          </span>
          <span className="coin-count">
            <Coins aria-hidden="true" />
            {formatNumber(character?.gold ?? 0)}
          </span>
        </div>
      </section>

      <section className="hud-map" aria-label="Area map">
        <div className="minimap-frame">
          <div className="minimap-surface">
            <span className="map-road road-a" />
            <span className="map-road road-b" />
            <span className="map-marker player-marker" />
            <span className="map-marker quest-marker" />
            <span className="map-marker resource-marker" />
          </div>
          <Map aria-hidden="true" className="map-icon" />
        </div>
        <button
          type="button"
          className={`quest-tracker ${panel === "quests" ? "active" : ""}`}
          onClick={() => togglePanel("quests")}
          aria-label={`Open quest journal: ${currentQuest.step}`}
          title="Open quest journal"
        >
          <ScrollText className="quest-tracker-icon" aria-hidden="true" />
          <span className="quest-tracker-copy">
            <span>First Tools · {currentQuest.status}</span>
            <strong>{currentQuest.step}</strong>
          </span>
        </button>
      </section>

      {character?.activeAction && (
        <section className="active-action" aria-label="Active action" aria-live="polite">
          <div className="active-action-heading">
            <span>
              {activeSkill && <SkillIcon skill={activeSkill.id} />}
              {character.activeAction.name}
            </span>
            <button
              type="button"
              onClick={() => void stopAction()}
              aria-label="Stop current action"
              title="Stop action"
            >
              <Square aria-hidden="true" />
            </button>
          </div>
          <div className="active-action-meta">
            <span>{activeSkill?.name ?? "Action"}</span>
            <strong>{activeActionProgress}%</strong>
          </div>
          <div
            className="action-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={activeActionProgress}
          >
            <span
              style={{
                width: `${Math.max(2, character.activeAction.progress * 100)}%`,
              }}
            />
          </div>
          <small>{formatDuration(character.activeAction.msRemaining)} left</small>
        </section>
      )}

      <section className="chat-strip" aria-label="Chat">
        <div className="chat-tabs" aria-hidden="true">
          <span className="active">All</span>
          <span>Game</span>
          <span>Public</span>
          <span>Clan</span>
        </div>
        <div className="chat-log">
          <p>You arrive at Market Cross.</p>
          <p>Warden Vale is looking for proof supplies.</p>
          {character?.activeAction ? (
            <p>You continue: {character.activeAction.name}.</p>
          ) : (
            <p>Click a node or character to begin.</p>
          )}
        </div>
        <div className="chat-input">
          <MessageCircle aria-hidden="true" />
          <span>Press Enter to chat...</span>
        </div>
      </section>

      {hovered && (
        <section className="interaction-prompt" aria-live="polite">
          <InteractionIcon interaction={hovered} />
          <div>
            <strong>{hovered.label}</strong>
            <span>{hovered.detail}</span>
          </div>
          <kbd>Click</kbd>
        </section>
      )}

      <nav className="hud-dock" aria-label="Game panels">
        <button
          type="button"
          className={panel === "inventory" ? "active" : ""}
          onClick={() => togglePanel("inventory")}
          aria-label="Inventory"
          title="Inventory"
        >
          <Backpack aria-hidden="true" />
          <span>Inventory</span>
        </button>
        <button
          type="button"
          className={panel === "skills" ? "active" : ""}
          onClick={() => togglePanel("skills")}
          aria-label="Skills"
          title="Skills"
        >
          <Pickaxe aria-hidden="true" />
          <span>Skills</span>
        </button>
        <button
          type="button"
          className={panel === "quests" ? "active" : ""}
          onClick={() => togglePanel("quests")}
          aria-label="Quests"
          title="Quests"
        >
          <ScrollText aria-hidden="true" />
          <span>Quests</span>
        </button>
        <button
          type="button"
          className={panel === "combat" ? "active" : ""}
          aria-label="Combat"
          title="Combat"
          onClick={() => togglePanel("combat")}
        >
          <Swords aria-hidden="true" />
          <span>Combat</span>
        </button>
        <button
          type="button"
          className={panel === "map" ? "active" : ""}
          aria-label="World map"
          title="World map"
          onClick={() => togglePanel("map")}
        >
          <Map aria-hidden="true" />
          <span>Map</span>
        </button>
        <button
          type="button"
          className={panel === "settings" ? "active" : ""}
          onClick={() => togglePanel("settings")}
          aria-label="Settings"
          title="Settings"
        >
          <Settings aria-hidden="true" />
          <span>Settings</span>
        </button>
      </nav>

      {panel && (
        <aside className="game-drawer" aria-label={PANEL_TITLES[panel]}>
          <header>
            <div>
              <span>Prooflayer</span>
              <h2>{PANEL_TITLES[panel]}</h2>
            </div>
            <button
              type="button"
              onClick={() => setPanel(null)}
              aria-label={`Close ${PANEL_TITLES[panel]}`}
              title="Close"
            >
              <X aria-hidden="true" />
            </button>
          </header>

          {panel === "inventory" && (
            <div className="drawer-content">
              <div className="inventory-summary">
                <span>
                  <Backpack aria-hidden="true" />
                  {character?.inventory.length ?? 0} / 28 slots
                </span>
                <strong>
                  <Coins aria-hidden="true" />
                  {formatNumber(character?.gold ?? 0)}
                </strong>
              </div>
              <div className="inventory-grid">
                {inventorySlots.map((item, index) => (
                  <button
                    type="button"
                    className={`inventory-slot ${item ? "filled" : ""} ${
                      item?.itemId === selectedItemId ? "selected" : ""
                    }`}
                    key={item?.itemId ?? `empty-${index}`}
                    title={item ? `${item.name} ×${item.quantity}` : "Empty slot"}
                    aria-label={item ? `${item.name}, quantity ${item.quantity}` : "Empty slot"}
                    onClick={() => setSelectedItemId(item?.itemId ?? null)}
                  >
                    {item && (
                      <>
                        <ItemIcon item={item} />
                        <span>{formatNumber(item.quantity)}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
              {selectedItem && (
                <div className="item-detail">
                  <div className="item-detail-heading">
                    <ItemIcon item={selectedItem} />
                    <div>
                      <span>{selectedItem.category}</span>
                      <h3>{selectedItem.name}</h3>
                    </div>
                  </div>
                  <p>{selectedItem.description}</p>
                  <dl>
                    <div>
                      <dt>Quantity</dt>
                      <dd>{formatNumber(selectedItem.quantity)}</dd>
                    </div>
                    <div>
                      <dt>Value</dt>
                      <dd>{formatNumber(selectedItem.baseValue)}</dd>
                    </div>
                    {selectedItem.slot && (
                      <div>
                        <dt>Slot</dt>
                        <dd>{selectedItem.slot}</dd>
                      </div>
                    )}
                  </dl>
                  {selectedItem.slot && (
                    <button
                      type="button"
                      className="item-action"
                      onClick={() => void equipSelectedItem()}
                    >
                      <Shield aria-hidden="true" />
                      Equip
                    </button>
                  )}
                </div>
              )}
              <div className="equipment-strip">
                <h3>Equipped</h3>
                {(character?.equipment ?? []).map((slot) => (
                  <button
                    type="button"
                    key={slot.slot}
                    disabled={!slot.itemId}
                    onClick={() => void unequipItem(slot.slot)}
                    title={slot.itemId ? `Unequip ${slot.name}` : "Empty slot"}
                  >
                    {slot.itemId && ITEM_ART[slot.itemId] ? (
                      <img src={ITEM_ART[slot.itemId]} alt="" aria-hidden="true" />
                    ) : (
                      <Shield aria-hidden="true" />
                    )}
                    <span>{slot.slot}</span>
                    <strong>{slot.name ?? "Empty"}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {panel === "skills" && (
            <div className="drawer-content skill-list">
              {(character?.skills ?? []).map((skill: SkillView) => (
                <div className="skill-row" key={skill.id}>
                  <div className="skill-icon">
                    <SkillIcon skill={skill.id} />
                  </div>
                  <div>
                    <span>{skill.name}</span>
                    <small>{formatNumber(skill.xp)} XP</small>
                    <div className="skill-progress">
                      <span style={{ width: `${skill.progress * 100}%` }} />
                    </div>
                  </div>
                  <strong>{skill.level}</strong>
                </div>
              ))}
            </div>
          )}

          {panel === "quests" && (
            <div className="drawer-content quest-list">
              <article className={`quest-card ${currentQuest.status}`}>
                <div className="quest-portrait">
                  <img src={QUEST_PORTRAITS.firstTools} alt="" aria-hidden="true" />
                </div>
                <div className="quest-seal">
                  {currentQuest.status === "complete" ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <ScrollText aria-hidden="true" />
                  )}
                </div>
                <div>
                  <span>{currentQuest.status}</span>
                  <h3>First Tools</h3>
                  <p>{currentQuest.detail}</p>
                  <strong>{currentQuest.step}</strong>
                </div>
              </article>
              <article className="quest-card locked">
                <div className="quest-portrait">
                  <img src={QUEST_PORTRAITS.seam} alt="" aria-hidden="true" />
                </div>
                <div className="quest-seal">
                  <Swords aria-hidden="true" />
                </div>
                <div>
                  <span>Locked</span>
                  <h3>Things at the Seam</h3>
                  <p>Requires Sealing level 5 and completion of First Tools.</p>
                </div>
              </article>
            </div>
          )}

          {panel === "combat" && (
            <div className="drawer-content combat-panel">
              <article className="combat-card ready">
                <div className="combat-emblem">
                  <Swords aria-hidden="true" />
                </div>
                <div>
                  <span>Training Ring</span>
                  <h3>Yard Practice</h3>
                  <p>
                    Practice strikes, guard timing, and movement before leaving Market Cross.
                  </p>
                </div>
                <dl>
                  <div>
                    <dt>Readiness</dt>
                    <dd>Safe</dd>
                  </div>
                  <div>
                    <dt>Reward</dt>
                    <dd>Combat XP</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="item-action"
                  onClick={() => showToast("The training yard will open from the town ring")}
                >
                  <Swords aria-hidden="true" />
                  Mark Ring
                </button>
              </article>
              <article className="combat-card locked">
                <div className="combat-emblem">
                  <Shield aria-hidden="true" />
                </div>
                <div>
                  <span>Frontier Contract</span>
                  <h3>Seam Patrol</h3>
                  <p>Requires completion of First Tools and total level 8.</p>
                </div>
              </article>
            </div>
          )}

          {panel === "map" && (
            <div className="drawer-content map-panel">
              <div className="region-map">
                <span className="region-road road-north" />
                <span className="region-road road-east" />
                <span className="region-water" />
                <span className="region-pin pin-market">
                  <Map aria-hidden="true" />
                </span>
                <span className="region-pin pin-grove" />
                <span className="region-pin pin-quarry" />
              </div>
              <div className="map-sites">
                <button
                  type="button"
                  className="site-row active"
                  onClick={() => showToast("Market Cross is your current location")}
                >
                  <Map aria-hidden="true" />
                  <span>
                    <strong>Market Cross</strong>
                    <small>Guild, forge, traders, training ring</small>
                  </span>
                </button>
                <button
                  type="button"
                  className="site-row"
                  onClick={() => showToast("The west grove holds aether stalks")}
                >
                  <TreePine aria-hidden="true" />
                  <span>
                    <strong>West Aether Grove</strong>
                    <small>Reaping nodes and dawn blooms</small>
                  </span>
                </button>
                <button
                  type="button"
                  className="site-row"
                  onClick={() => showToast("The eastern quarry holds dim shards")}
                >
                  <Pickaxe aria-hidden="true" />
                  <span>
                    <strong>Eastern Quarry</strong>
                    <small>Dim veins and rail carts</small>
                  </span>
                </button>
              </div>
            </div>
          )}

          {panel === "settings" && (
            <div className="drawer-content settings-list">
              <button
                type="button"
                className="setting-row"
                onClick={() => setSoundEnabled((enabled) => !enabled)}
              >
                {soundEnabled ? (
                  <Volume2 aria-hidden="true" />
                ) : (
                  <VolumeX aria-hidden="true" />
                )}
                <span>
                  <strong>World sound</strong>
                  <small>Ambient sound and action feedback</small>
                </span>
                <i className={soundEnabled ? "on" : ""} />
              </button>
              <button
                type="button"
                className="setting-row"
                onClick={() => setReducedMotion((enabled) => !enabled)}
              >
                <Zap aria-hidden="true" />
                <span>
                  <strong>Reduced motion</strong>
                  <small>Shorten interface transitions</small>
                </span>
                <i className={reducedMotion ? "on" : ""} />
              </button>
              <div className="control-note">
                <strong>Movement</strong>
                <span>Click the ground or use WASD / arrow keys.</span>
                <strong>Camera</strong>
                <span>Use the mouse wheel to zoom.</span>
              </div>
            </div>
          )}
        </aside>
      )}

      {toast && <div className="game-toast">{toast}</div>}

      {(!gameReady || !config || !character) && !error && (
        <div className="game-loading">
          <div className="loading-rune">P</div>
          <strong>Entering Market Cross</strong>
          <span>Loading world and character state...</span>
        </div>
      )}

      {error && (
        <div className="game-error">
          <strong>Connection interrupted</strong>
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}
    </main>
  );
}

export default function PlayClient() {
  const isDesktop = useDesktopExperience();

  if (isDesktop === null) return <DesktopRequired checking />;
  if (!isDesktop) return <DesktopRequired />;

  return <ProoflayerPlayClient />;
}

"use client";

import {
  Backpack,
  Coins,
  FlaskConical,
  Gem,
  Hammer,
  Heart,
  Map,
  MessageCircle,
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
import { api } from "@/lib/api";
import type { GameController, WorldInteraction } from "@/lib/game/types";
import type {
  CharacterView,
  GameConfig,
  InventoryEntryView,
  SkillView,
} from "@/lib/types";

type Panel = "inventory" | "skills" | "quests" | "settings";

const PANEL_TITLES: Record<Panel, string> = {
  inventory: "Backpack",
  skills: "Skills",
  quests: "Field Journal",
  settings: "Settings",
};

function formatNumber(value: string | number): string {
  const number = typeof value === "string" ? Number(value) : value;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}m`;
  if (number >= 10_000) return `${(number / 1_000).toFixed(1)}k`;
  return number.toLocaleString();
}

function SkillIcon({ skill }: { skill: string }) {
  if (skill === "reaping") return <TreePine aria-hidden="true" />;
  if (skill === "quarrying") return <Pickaxe aria-hidden="true" />;
  if (skill === "tempering") return <Hammer aria-hidden="true" />;
  if (skill === "tracking") return <Swords aria-hidden="true" />;
  if (skill === "distilling") return <FlaskConical aria-hidden="true" />;
  return <Sparkles aria-hidden="true" />;
}

function ItemIcon({ item }: { item: InventoryEntryView }) {
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
  return <MessageCircle aria-hidden="true" />;
}

export default function PlayClient() {
  const gameHostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameController | null>(null);
  const characterRef = useRef<CharacterView | null>(null);
  const pendingRef = useRef(false);
  const stoppingRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [config, setConfig] = useState<GameConfig | null>(null);
  const [character, setCharacter] = useState<CharacterView | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [hovered, setHovered] = useState<WorldInteraction | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

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
      setCharacter(response.character);
      characterRef.current = response.character;
      gameRef.current?.setActiveAction(
        response.character.activeAction?.actionId ?? null
      );
      setError(null);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : String(refreshError)
      );
    }
  }, []);

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

  const handleWorldInteraction = useCallback(
    async (interaction: WorldInteraction) => {
      if (interaction.kind === "npc") {
        if (interaction.id === "warden-vale") {
          setPanel("quests");
          showToast("Warden Vale added First Tools to your journal");
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

  useEffect(() => {
    let disposed = false;
    if (!gameHostRef.current) return;

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
            void stopAction();
          },
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
  }, [handleWorldInteraction, stopAction]);

  useEffect(() => {
    void api
      .getConfig()
      .then(setConfig)
      .catch((configError) => {
        setError(configError instanceof Error ? configError.message : String(configError));
      });
    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 1000);
    return () => clearInterval(interval);
  }, [refresh]);

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

  const inventorySlots = useMemo(() => {
    const slots: Array<InventoryEntryView | null> = [
      ...(character?.inventory ?? []),
    ];
    while (slots.length < 28) slots.push(null);
    return slots.slice(0, 28);
  }, [character]);

  const togglePanel = (nextPanel: Panel) => {
    setPanel((current) => (current === nextPanel ? null : nextPanel));
  };

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
            <span>Market Cross</span>
          </div>
        </div>
        <div className="status-bars">
          <div className="status-line health-line">
            <Heart aria-hidden="true" />
            <span>10 / 10</span>
            <div className="status-track">
              <span style={{ width: "100%" }} />
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
        <div className="quest-tracker">
          <span>First Tools</span>
          <strong>Speak to Warden Vale</strong>
        </div>
      </section>

      {character?.activeAction && (
        <section className="active-action" aria-label="Active action">
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
          <div className="action-progress">
            <span
              style={{
                width: `${Math.max(2, character.activeAction.progress * 100)}%`,
              }}
            />
          </div>
          <small>
            {activeSkill?.name ?? "Skill"} · {character.activeAction.msRemaining}ms
          </small>
        </section>
      )}

      <section className="chat-strip" aria-label="Chat">
        <MessageCircle aria-hidden="true" />
        <span>
          <strong>Market:</strong> Welcome to Market Cross. Resources respawn
          continuously.
        </span>
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
        </button>
        <button
          type="button"
          className={panel === "skills" ? "active" : ""}
          onClick={() => togglePanel("skills")}
          aria-label="Skills"
          title="Skills"
        >
          <Pickaxe aria-hidden="true" />
        </button>
        <button
          type="button"
          className={panel === "quests" ? "active" : ""}
          onClick={() => togglePanel("quests")}
          aria-label="Quests"
          title="Quests"
        >
          <ScrollText aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Combat"
          title="Combat"
          onClick={() => showToast("Combat training grounds open in the next slice")}
        >
          <Swords aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="World map"
          title="World map"
          onClick={() => showToast("Market Cross is the first region of the frontier")}
        >
          <Map aria-hidden="true" />
        </button>
        <button
          type="button"
          className={panel === "settings" ? "active" : ""}
          onClick={() => togglePanel("settings")}
          aria-label="Settings"
          title="Settings"
        >
          <Settings aria-hidden="true" />
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
                    className={`inventory-slot ${item ? "filled" : ""}`}
                    key={item?.itemId ?? `empty-${index}`}
                    title={item ? `${item.name} ×${item.quantity}` : "Empty slot"}
                    aria-label={item ? `${item.name}, quantity ${item.quantity}` : "Empty slot"}
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
              <div className="equipment-strip">
                <h3>Equipped</h3>
                {(character?.equipment ?? []).map((slot) => (
                  <div key={slot.slot}>
                    <Shield aria-hidden="true" />
                    <span>{slot.slot}</span>
                    <strong>{slot.name ?? "Empty"}</strong>
                  </div>
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
              <article className="quest-card active">
                <div className="quest-seal">
                  <ScrollText aria-hidden="true" />
                </div>
                <div>
                  <span>Active</span>
                  <h3>First Tools</h3>
                  <p>
                    Warden Vale is waiting near the Market Hall. Learn how to
                    gather aether stalks and chip your first dim shard.
                  </p>
                  <strong>Speak to Warden Vale</strong>
                </div>
              </article>
              <article className="quest-card locked">
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

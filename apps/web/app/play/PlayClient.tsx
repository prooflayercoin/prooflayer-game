"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameScene } from "@/lib/game/scene";
import { api } from "@/lib/api";
import type { ActionView, CharacterView, GameConfig, SkillBlock } from "@/lib/types";

function fmt(n: string | number): string {
  const num = typeof n === "string" ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 10_000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export default function PlayClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameScene | null>(null);
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [character, setCharacter] = useState<CharacterView | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("reaping");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Initialize Babylon.js scene
  useEffect(() => {
    const initGame = () => {
      if (!canvasRef.current) {
        console.warn("Canvas ref not available, retrying...");
        requestAnimationFrame(initGame);
        return;
      }

      try {
        console.log("Creating game scene...");
        const game = new GameScene(canvasRef.current);
        console.log("Starting render...");
        game.render();
        gameRef.current = game;
        console.log("Game ready!");
      } catch (err) {
        console.error("Game initialization failed:", err);
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    initGame();

    return () => {
      try {
        gameRef.current?.dispose();
      } catch (e) {
        console.error("Error disposing game:", e);
      }
    };
  }, []);

  // Load config
  useEffect(() => {
    api
      .getConfig()
      .then((cfg) => setConfig(cfg))
      .catch((e) => setError(String(e)));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { character } = await api.getState();
      setCharacter(character);
      setError(null);

      // Update player animation based on active action
      if (gameRef.current) {
        const player = gameRef.current.getPlayer();
        if (character.activeAction) {
          // Mining animation for now (TODO: map actions to animations)
          player.setAnimation("mining");
        } else {
          player.setAnimation("idle");
        }
      }
    } catch (e) {
      setError(String(e));
    }
  }, []);

  // Poll state every 500ms
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 500);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleStart = useCallback(
    async (actionId: string) => {
      setPending(true);
      try {
        await api.startAction(actionId);
        await refresh();
      } catch (e) {
        setError(String(e));
      } finally {
        setPending(false);
      }
    },
    [refresh]
  );

  const handleStop = useCallback(async () => {
    setPending(true);
    try {
      await api.stopAction();
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setPending(false);
    }
  }, [refresh]);

  if (!config || !character) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-lattice-bg text-lattice-dim flex-col gap-4">
        {error ? (
          <div className="text-red-400 max-w-md">
            <div className="font-bold">Error:</div>
            <div className="text-sm font-mono">{error}</div>
          </div>
        ) : (
          <div>
            <div>Initializing...</div>
            <div className="text-xs text-lattice-dim mt-2">Check browser console for details</div>
          </div>
        )}
      </main>
    );
  }

  const selectedSkill =
    config.skills.find((s) => s.id === selectedSkillId) ?? config.skills[0]!;

  return (
    <main className="w-full h-screen flex bg-lattice-bg">
      {/* Babylon.js Canvas */}
      <div className="flex-1 bg-red-900" style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        {error && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#ff6b6b",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <div>{error}</div>
          </div>
        )}
      </div>

      {/* React UI Panels */}
      <div className="w-80 bg-lattice-panel border-l border-lattice-edge overflow-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          {character && (
            <div className="space-y-2">
              <div className="text-sm text-lattice-dim uppercase">Character</div>
              <div className="text-lg font-semibold">{character.name}</div>
              <div className="flex justify-between text-sm">
                <span className="text-lattice-dim">Level {character.totalLevel}</span>
                <span className="text-lattice-warn">{fmt(character.gold)}g</span>
              </div>
            </div>
          )}

          {/* Active Action */}
          {character && (
            <div className="panel-inset p-3">
              {character.activeAction ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{character.activeAction.name}</div>
                  <div className="h-2 rounded-full bg-lattice-bg overflow-hidden">
                    <div
                      className="h-full bg-lattice-accent transition-[width] duration-200"
                      style={{
                        width: `${(character.activeAction.progress * 100).toFixed(0)}%`,
                      }}
                    />
                  </div>
                  <button
                    onClick={handleStop}
                    disabled={pending}
                    className="w-full px-2 py-1 text-xs rounded bg-lattice-edge hover:bg-lattice-panel2 disabled:opacity-50"
                  >
                    Stop
                  </button>
                </div>
              ) : (
                <div className="text-xs text-lattice-dim">No active action</div>
              )}
            </div>
          )}

          {/* Skill Actions */}
          <div className="space-y-2">
            <div className="text-xs text-lattice-dim uppercase">Actions</div>
            {selectedSkill.actions.map((a: ActionView) => (
              <button
                key={a.id}
                onClick={() => handleStart(a.id)}
                disabled={pending || !character}
                className="w-full p-2 rounded text-left text-xs bg-lattice-panel2 hover:bg-lattice-edge disabled:opacity-50 transition"
              >
                <div className="font-medium">{a.name}</div>
                <div className="text-lattice-dim">{a.xpReward}xp</div>
              </button>
            ))}
          </div>

          {/* Inventory */}
          {character && character.inventory.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-lattice-dim uppercase">Inventory</div>
              <div className="space-y-1 max-h-40 overflow-auto">
                {character.inventory.map((item) => (
                  <div
                    key={item.itemId}
                    className="text-xs flex justify-between p-1 bg-lattice-panel2 rounded"
                  >
                    <span>{item.name}</span>
                    <span className="text-lattice-dim">×{fmt(item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-2 rounded bg-red-900/20 text-red-300 text-xs">{error}</div>
          )}
        </div>
      </div>
    </main>
  );
}

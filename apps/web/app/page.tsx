"use client";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-lattice-bg text-lattice-text">
      {/* Nav */}
      <nav className="border-b border-lattice-edge">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="text-2xl font-bold text-lattice-accent">⬡ Prooflayer</div>
          <a
            href="https://discord.gg"
            className="px-6 py-2 rounded bg-lattice-accent text-lattice-bg font-bold hover:opacity-90 transition"
          >
            Discord
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="space-y-6">
          <div className="inline-block px-4 py-2 rounded-full bg-lattice-accent/20 border border-lattice-accent/50 text-lattice-accent text-sm font-bold">
            🎮 Coming Soon
          </div>

          <h1 className="text-6xl font-bold leading-tight">
            An Isometric<br />RPG Built for<br />the Grind
          </h1>

          <p className="text-xl text-lattice-dim max-w-2xl">
            Level up across 6 skills. Fight bosses. Craft gear. Build your legend in a hand-crafted isometric world inspired by OSRS and Dark Souls.
          </p>

          <div className="flex gap-4 pt-6">
            <button className="px-8 py-3 rounded bg-lattice-accent text-lattice-bg font-bold hover:opacity-90 transition">
              Notify Me
            </button>
            <a
              href="#features"
              className="px-8 py-3 rounded border-2 border-lattice-accent text-lattice-accent font-bold hover:bg-lattice-accent/10 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-12">What's Inside</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: "⚔️", title: "Combat & Skills", desc: "Master Attack, Defense, and Strength. Fight increasingly difficult bosses." },
            { icon: "⛏️", title: "Gathering & Crafting", desc: "Mine ore, harvest crops, and craft legendary gear to equip." },
            { icon: "🏰", title: "Isometric World", desc: "Explore a beautiful procedurally-generated world with secrets to discover." },
            { icon: "📈", title: "Deep Progression", desc: "Level 1-99 on each skill. Exponential growth that keeps you engaged." },
            { icon: "💰", title: "Economy", desc: "Buy, sell, and trade. Gold flows from combat, gathering, and quests." },
            { icon: "🎯", title: "Quests & Dungeons", desc: "Multi-step quests, boss encounters, and hidden dungeons to conquer." },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-lg bg-lattice-panel border border-lattice-edge hover:border-lattice-accent/50 transition">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-lattice-dim text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Built Different</h2>
            <div className="space-y-4 text-lattice-dim">
              <p>
                Prooflayer is designed for players who love the grind. Whether you're training AFK or actively hunting bosses, there's always something to progress.
              </p>
              <p>
                We took inspiration from Old School RuneScape, Dark Souls, and classic roguelikes—and rebuilt it for modern gaming with server-authoritative security and offline play.
              </p>
              <ul className="space-y-2 pt-4">
                <li className="flex gap-2">
                  <span className="text-lattice-accent font-bold">✓</span>
                  <span>Play offline, sync when you return</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-lattice-accent font-bold">✓</span>
                  <span>Server-authoritative (no hacking)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-lattice-accent font-bold">✓</span>
                  <span>Fair economy with player markets</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-lattice-accent font-bold">✓</span>
                  <span>Regular content updates</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Roadmap</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-lattice-accent/10 border border-lattice-accent/30">
                <div className="font-bold text-lattice-accent mb-1">Phase 1 (Now)</div>
                <div className="text-sm text-lattice-dim">Core gameplay, boss encounters, initial skill progression</div>
              </div>
              <div className="p-4 rounded-lg bg-lattice-panel border border-lattice-edge">
                <div className="font-bold mb-1">Phase 2 (2026)</div>
                <div className="text-sm text-lattice-dim">All 6 skills, player housing, guilds & clans</div>
              </div>
              <div className="p-4 rounded-lg bg-lattice-panel border border-lattice-edge">
                <div className="font-bold mb-1">Phase 3 (2026)</div>
                <div className="text-sm text-lattice-dim">PvP arenas, seasonal leagues, cosmetics & pets</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solana */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="p-8 rounded-lg bg-lattice-panel border border-lattice-edge text-center">
          <h3 className="text-2xl font-bold mb-3">Built on Solana</h3>
          <p className="text-lattice-dim mb-6">
            Verifiable on-chain progress. Own your achievements and earn real rewards.
          </p>
          <div className="inline-block px-4 py-2 rounded bg-lattice-bg border border-lattice-edge text-sm text-lattice-dim font-mono">
            Token address: Coming soon
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Begin?</h2>
          <p className="text-lattice-dim max-w-xl mx-auto">
            Get notified the moment Prooflayer launches. Join our Discord for updates and exclusive early access.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 rounded bg-lattice-accent text-lattice-bg font-bold hover:opacity-90 transition">
              Notify Me
            </button>
            <a
              href="https://twitter.com"
              className="px-8 py-3 rounded border-2 border-lattice-accent text-lattice-accent font-bold hover:bg-lattice-accent/10 transition"
            >
              Follow
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-lattice-edge mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center text-sm text-lattice-dim">
          <p>© 2026 Prooflayer. A game where the grind never ends.</p>
        </div>
      </footer>
    </div>
  );
}

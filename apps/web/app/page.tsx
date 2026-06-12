"use client";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-lattice-bg via-lattice-panel to-lattice-bg text-lattice-text overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-lattice-accent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-lattice-accent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-lattice-edge backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-lattice-accent to-lattice-accent/60 bg-clip-text text-transparent">
              ⬡ Prooflayer
            </div>
            <a
              href="https://discord.gg"
              className="px-6 py-2 rounded-lg bg-lattice-accent/20 border border-lattice-accent text-lattice-accent hover:bg-lattice-accent/30 transition-all font-medium"
            >
              Join Discord
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="inline-block px-4 py-2 rounded-full bg-lattice-accent/10 border border-lattice-accent/30 text-lattice-accent text-sm font-medium">
                🎮 Coming Soon
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              <span className="block">Master Skills in an</span>
              <span className="bg-gradient-to-r from-lattice-accent via-lattice-accent to-lattice-accent/60 bg-clip-text text-transparent">
                Isometric RPG World
              </span>
            </h1>

            <p className="text-xl text-lattice-dim max-w-2xl mx-auto leading-relaxed">
              A deep, progression-driven RPG where every action matters. Train combat skills, harvest resources,
              craft gear, and build your legend in a hand-crafted isometric world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-lattice-accent to-lattice-accent/80 text-lattice-bg font-bold hover:shadow-lg hover:shadow-lattice-accent/50 transition-all transform hover:scale-105">
                Notify Me
              </button>
              <a
                href="#features"
                className="px-8 py-3 rounded-lg border-2 border-lattice-accent/50 text-lattice-accent hover:border-lattice-accent hover:bg-lattice-accent/5 font-bold transition-all"
              >
                Learn More ↓
              </a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">Gameplay Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚔️",
                title: "6 Skill Trees",
                desc: "Master combat (Attack, Defense, Strength) and crafting (Tempering) alongside gathering skills (Reaping, Quarrying).",
              },
              {
                icon: "🏰",
                title: "Living World",
                desc: "Procedurally generated isometric environments with dynamic terrain, weather, and day/night cycles.",
              },
              {
                icon: "📈",
                title: "Deep Progression",
                desc: "Levels 1-99 on each skill with exponential growth. Every action builds toward mastery.",
              },
              {
                icon: "🛠️",
                title: "Craft & Equip",
                desc: "Find rare materials, craft legendary gear, and customize your character's loadout.",
              },
              {
                icon: "💰",
                title: "Economy System",
                desc: "Buy, sell, and trade with NPCs. Gold flows from combat, gathering, and quest rewards.",
              },
              {
                icon: "🎯",
                title: "Quests & Bosses",
                desc: "Epic boss encounters, multi-step quests, and hidden dungeons to discover and conquer.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-lattice-panel/50 border border-lattice-edge hover:border-lattice-accent/50 transition-all hover:bg-lattice-panel/70 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-lattice-dim">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Game Vision */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-br from-lattice-panel via-lattice-panel/50 to-lattice-bg border border-lattice-edge rounded-2xl p-12 md:p-16">
            <h2 className="text-4xl font-bold mb-8">The Vision</h2>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-lg text-lattice-dim leading-relaxed">
                  Prooflayer is built for players who love the grind. Whether you're AFK training or actively
                  hunting bosses, there's always something to progress. We're inspired by classic RPGs—Old School RuneScape,
                  Dark Souls, and roguelikes—but built from the ground up with modern game design.
                </p>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">What Makes Us Different:</h3>
                  {[
                    "Server-authoritative gameplay (no hacking or cheating)",
                    "Play offline, sync when you return",
                    "Fair economy with actual player-driven markets",
                    "Regular content updates and seasonal events",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-lattice-accent font-bold">✦</span>
                      <span className="text-lattice-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Roadmap</h3>
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-lattice-bg/50 border border-lattice-edge rounded-lg">
                    <div className="font-bold text-lattice-accent mb-1">Phase 1 (Now)</div>
                    <div className="text-lattice-dim">Core gameplay loop, 3 starter skills, boss encounters</div>
                  </div>
                  <div className="p-4 bg-lattice-bg/50 border border-lattice-edge rounded-lg opacity-60">
                    <div className="font-bold text-lattice-dim mb-1">Phase 2 (2026)</div>
                    <div className="text-lattice-dim">All 6 skills, player housing, guilds</div>
                  </div>
                  <div className="p-4 bg-lattice-bg/50 border border-lattice-edge rounded-lg opacity-60">
                    <div className="font-bold text-lattice-dim mb-1">Phase 3 (2026)</div>
                    <div className="text-lattice-dim">PvP arenas, seasonal leagues, cosmetics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Crypto Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-lattice-panel/30 border border-lattice-edge rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Built for Web3</h3>
            <p className="text-lattice-dim mb-6">
              Prooflayer integrates with Solana for verifiable on-chain progress and token rewards.
              Play the game you love, own your achievements.
            </p>
            <div className="inline-block px-6 py-3 rounded-lg bg-lattice-accent/10 border border-lattice-accent/30">
              <p className="text-sm text-lattice-dim">
                <span className="font-bold text-lattice-accent">Token address:</span> Coming soon
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-6">Join the Community</h2>
          <p className="text-xl text-lattice-dim mb-8">
            Be the first to know when Prooflayer launches. Get exclusive early access and insider updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-lattice-accent to-lattice-accent/80 text-lattice-bg font-bold hover:shadow-lg hover:shadow-lattice-accent/50 transition-all transform hover:scale-105 text-lg">
              Get Notified
            </button>
            <a
              href="https://twitter.com"
              className="px-8 py-4 rounded-lg border-2 border-lattice-accent/50 text-lattice-accent hover:border-lattice-accent hover:bg-lattice-accent/5 font-bold transition-all text-lg"
            >
              Follow on Twitter
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-lattice-edge mt-20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold mb-4">Prooflayer</h4>
                <p className="text-sm text-lattice-dim">
                  An isometric RPG built for the grind.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Game</h4>
                <ul className="space-y-2 text-sm text-lattice-dim">
                  <li><a href="#features" className="hover:text-lattice-accent">Features</a></li>
                  <li><a href="#" className="hover:text-lattice-accent">Gameplay</a></li>
                  <li><a href="#" className="hover:text-lattice-accent">Wiki</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Community</h4>
                <ul className="space-y-2 text-sm text-lattice-dim">
                  <li><a href="#" className="hover:text-lattice-accent">Discord</a></li>
                  <li><a href="#" className="hover:text-lattice-accent">Twitter</a></li>
                  <li><a href="#" className="hover:text-lattice-accent">GitHub</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-lattice-dim">
                  <li><a href="#" className="hover:text-lattice-accent">Privacy</a></li>
                  <li><a href="#" className="hover:text-lattice-accent">Terms</a></li>
                  <li><a href="#" className="hover:text-lattice-accent">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-lattice-edge pt-8 text-center text-sm text-lattice-dim">
              <p>© 2026 Prooflayer. A game where the grind never ends.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

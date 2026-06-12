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
              href="/play"
              className="px-6 py-2 rounded-lg bg-lattice-accent/20 border border-lattice-accent text-lattice-accent hover:bg-lattice-accent/30 transition-all font-medium"
            >
              Early Access
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="inline-block px-4 py-2 rounded-full bg-lattice-accent/10 border border-lattice-accent/30 text-lattice-accent text-sm font-medium">
                🚀 Coming Soon: Solana Integration
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              <span className="block">Skill Up, Earn Real</span>
              <span className="bg-gradient-to-r from-lattice-accent via-lattice-accent to-lattice-accent/60 bg-clip-text text-transparent">
                Crypto Rewards
              </span>
            </h1>

            <p className="text-xl text-lattice-dim max-w-2xl mx-auto leading-relaxed">
              An isometric idle skilling game where your progression is secured on-chain.
              Build your character, master skills, and earn verifiable rewards through Solana SPL tokens.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="/play"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-lattice-accent to-lattice-accent/80 text-lattice-bg font-bold hover:shadow-lg hover:shadow-lattice-accent/50 transition-all transform hover:scale-105"
              >
                Try Early Access →
              </a>
              <button className="px-8 py-3 rounded-lg border-2 border-lattice-accent/50 text-lattice-accent hover:border-lattice-accent hover:bg-lattice-accent/5 font-bold transition-all">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">Game Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⛏️",
                title: "6 Core Skills",
                desc: "Master Reaping, Quarrying, Tempering, Tracking, Distilling, and Sealing with progressive difficulty.",
              },
              {
                icon: "🏺",
                title: "Procedural World",
                desc: "Explore a dynamic isometric world with varied terrain, NPCs, and points of interest.",
              },
              {
                icon: "📊",
                title: "Server-Authoritative",
                desc: "All progression verified server-side. Your achievements can't be faked.",
              },
              {
                icon: "💰",
                title: "Earn Rewards",
                desc: "Convert your in-game gold into real Solana SPL tokens once integration launches.",
              },
              {
                icon: "🔗",
                title: "On-Chain Verification",
                desc: "Character progress and achievements stored and verified on Solana blockchain.",
              },
              {
                icon: "🎮",
                title: "Play Anytime",
                desc: "Offline progress tracked and synced. Game doesn't require constant internet.",
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

        {/* Solana Integration Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-br from-lattice-panel via-lattice-panel/50 to-lattice-bg border border-lattice-edge rounded-2xl p-12 md:p-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Powered by Solana</h2>
                <p className="text-lg text-lattice-dim mb-8 leading-relaxed">
                  Your gaming achievements matter. When Solana integration launches, your in-game
                  progression will be cryptographically verified and convertible to real SPL tokens.
                </p>

                <div className="space-y-4">
                  {[
                    "Earn $SPL tokens through legitimate gameplay",
                    "Trade, transfer, or stake your rewards",
                    "Verifiable on-chain achievement history",
                    "Low transaction fees and fast settlements",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-lattice-accent font-bold">✓</span>
                      <span className="text-lattice-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-lattice-accent/20 to-transparent rounded-lg blur-xl" />
                <div className="relative bg-lattice-bg border border-lattice-accent/30 rounded-lg p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">◆</span>
                    <span className="font-bold text-lattice-accent">Solana Network</span>
                  </div>

                  <div className="space-y-4 text-sm text-lattice-dim">
                    <div className="flex justify-between">
                      <span>Phase 1 (Current):</span>
                      <span className="text-lattice-accent">Game Fundamentals</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phase 2 (Q3 2026):</span>
                      <span className="text-lattice-accent">Token Bridge</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phase 3 (Q4 2026):</span>
                      <span className="text-lattice-accent">DeFi Integration</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-lattice-edge">
                    <p className="text-xs text-lattice-dim">
                      Smart contracts audited and deployed on Solana mainnet-beta. Testnet available now.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-lattice-dim mb-8">
            Join the early access program and be part of the future of Web3 gaming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/play"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-lattice-accent to-lattice-accent/80 text-lattice-bg font-bold hover:shadow-lg hover:shadow-lattice-accent/50 transition-all transform hover:scale-105 text-lg"
            >
              Enter The Game
            </a>
            <a
              href="https://twitter.com"
              className="px-8 py-4 rounded-lg border-2 border-lattice-accent/50 text-lattice-accent hover:border-lattice-accent hover:bg-lattice-accent/5 font-bold transition-all text-lg"
            >
              Follow Updates
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
                  Isometric idle skilling meets Web3 rewards.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Game</h4>
                <ul className="space-y-2 text-sm text-lattice-dim">
                  <li><a href="/play" className="hover:text-lattice-accent">Play</a></li>
                  <li><a href="#" className="hover:text-lattice-accent">Mechanics</a></li>
                  <li><a href="#" className="hover:text-lattice-accent">Roadmap</a></li>
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
              <p>© 2026 Prooflayer. Building the future of Web3 gaming.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

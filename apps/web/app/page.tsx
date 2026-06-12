"use client";

import { useState } from "react";

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "When is Prooflayer launching?",
      a: "We're targeting early 2026 for the full launch. Join our Discord for the latest updates and early access opportunities.",
    },
    {
      q: "Is this free to play?",
      a: "Yes! Prooflayer is completely free to play. Optional cosmetics and battle pass will fund development, but all core gameplay is free.",
    },
    {
      q: "Can I play offline?",
      a: "Absolutely. You can play offline and your progress will sync to the server when you reconnect. Up to 12 hours of offline progress.",
    },
    {
      q: "How does the Solana integration work?",
      a: "Your verified on-chain progress can be converted to SPL tokens. This is coming in Phase 2. No pay-to-win mechanics.",
    },
    {
      q: "What platforms will it be on?",
      a: "Prooflayer launches as a web app (browser-based). Mobile and other platforms are planned for Phase 3.",
    },
    {
      q: "Is PvP supported?",
      a: "PvP arenas are coming in Phase 3. Phase 1 focuses on PvE progression and cooperative guild features.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-lattice-bg text-lattice-text">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full border-b border-lattice-edge bg-lattice-bg/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <a href="#" className="text-xl sm:text-2xl font-bold text-lattice-accent">
            ⬡ Prooflayer
          </a>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 items-center">
            <a href="#features" className="text-sm hover:text-lattice-accent transition">
              Features
            </a>
            <a href="/coin" className="text-sm hover:text-lattice-accent transition">
              Coin
            </a>
            <a href="#faq" className="text-sm hover:text-lattice-accent transition">
              FAQ
            </a>
            <a href="#contact" className="text-sm hover:text-lattice-accent transition">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero (with top padding for fixed nav) */}
      <section className="max-w-6xl mx-auto px-6 py-32 pt-40">
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
              Get Updates
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
            AX6hiKrjzusB4k58zthxCg7WeXcw81z9a73rM9vvpump
          </div>
          <div className="mt-6">
            <a href="/coin" className="text-lattice-accent font-bold hover:underline">
              Read the official token context page
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-12">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-lattice-edge rounded-lg overflow-hidden bg-lattice-panel/50">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-lattice-panel transition text-left"
              >
                <span className="font-bold">{faq.q}</span>
                <span className="text-lattice-accent text-xl">{expandedFaq === i ? "−" : "+"}</span>
              </button>
              {expandedFaq === i && (
                <div className="px-6 py-4 border-t border-lattice-edge text-lattice-dim bg-lattice-bg/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-3">Have Questions?</h2>
            <p className="text-lattice-dim max-w-2xl mx-auto">
              Join our community on Discord or reach out directly. We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <a
              href="https://x.com/ProofLayerCoin"
              className="p-6 rounded-lg bg-lattice-panel border border-lattice-edge hover:border-lattice-accent/50 transition"
            >
              <div className="text-3xl mb-2">𝕏</div>
              <h3 className="font-bold mb-2">Twitter</h3>
              <p className="text-sm text-lattice-dim">Latest updates and news</p>
            </a>

            <a
              href="mailto:support@prooflayer.app"
              className="p-6 rounded-lg bg-lattice-panel border border-lattice-edge hover:border-lattice-accent/50 transition"
            >
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-bold mb-2">Email Support</h3>
              <p className="text-sm text-lattice-dim">support@prooflayer.app</p>
            </a>
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
              Get Updates
            </button>
            <a
              href="https://x.com/ProofLayerCoin"
              className="px-8 py-3 rounded border-2 border-lattice-accent text-lattice-accent font-bold hover:bg-lattice-accent/10 transition"
            >
              Follow on Twitter
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-lattice-edge mt-20 bg-lattice-panel/50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold mb-4">Prooflayer</h3>
              <p className="text-sm text-lattice-dim">An isometric RPG built for the grind.</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Game</h4>
              <ul className="space-y-2 text-sm text-lattice-dim">
                <li><a href="#features" className="hover:text-lattice-accent transition">Features</a></li>
                <li><a href="/coin" className="hover:text-lattice-accent transition">Coin</a></li>
                <li><a href="#faq" className="hover:text-lattice-accent transition">FAQ</a></li>
                <li><a href="#contact" className="hover:text-lattice-accent transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-lattice-dim">
                <li><a href="https://x.com/ProofLayerCoin" className="hover:text-lattice-accent transition">Twitter</a></li>
                <li><a href="https://github.com/prooflayercoin/prooflayer-game" className="hover:text-lattice-accent transition">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-lattice-dim">
                <li><a href="/privacy" className="hover:text-lattice-accent transition">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-lattice-accent transition">Terms of Service</a></li>
                <li><a href="/support" className="hover:text-lattice-accent transition">Support Center</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-lattice-edge pt-8 text-center text-sm text-lattice-dim">
            <p>© 2026 Prooflayer. A game where the grind never ends.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

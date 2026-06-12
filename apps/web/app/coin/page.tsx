import type { Metadata } from "next";

const TOKEN_ADDRESS = "AX6hiKrjzusB4k58zthxCg7WeXcw81z9a73rM9vvpump";
const PUMP_FUN_URL = `https://pump.fun/coin/${TOKEN_ADDRESS}`;

export const metadata: Metadata = {
  title: "Prooflayer Coin | Official Token Context",
  description:
    "Official transparency and context page for the Prooflayer community token.",
};

export default function CoinPage() {
  return (
    <div className="w-full min-h-screen bg-lattice-bg text-lattice-text">
      <nav className="fixed top-0 w-full border-b border-lattice-edge bg-lattice-bg/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <a href="/" className="text-xl sm:text-2xl font-bold text-lattice-accent">
            ⬡ Prooflayer
          </a>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 items-center">
            <a href="/#features" className="text-sm hover:text-lattice-accent transition">
              Features
            </a>
            <a href="/coin" className="text-sm text-lattice-accent font-bold">
              Coin
            </a>
            <a href="/#faq" className="text-sm hover:text-lattice-accent transition">
              FAQ
            </a>
            <a href="/#contact" className="text-sm hover:text-lattice-accent transition">
              Contact
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-32 pt-40">
        <section className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-10 items-start">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-lattice-accent/20 border border-lattice-accent/50 text-lattice-accent text-sm font-bold">
              Official Community Token Context
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              Prooflayer Coin is a pointer to the game, not an investment promise.
            </h1>
            <p className="text-xl text-lattice-dim max-w-3xl">
              This page exists so anyone who discovers the token can verify that it is connected to
              Prooflayer, understand what the project is, and read the risks in plain English.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="/play"
                className="px-8 py-3 rounded bg-lattice-accent text-lattice-bg font-bold hover:opacity-90 transition"
              >
                Play Prooflayer
              </a>
              <a
                href={PUMP_FUN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded border-2 border-lattice-accent text-lattice-accent font-bold hover:bg-lattice-accent/10 transition"
              >
                View on pump.fun
              </a>
            </div>
          </div>

          <aside className="rounded-lg bg-lattice-panel border border-lattice-edge p-6 space-y-5">
            <div>
              <p className="text-sm text-lattice-dim mb-1">Token</p>
              <h2 className="text-2xl font-bold">Prooflayer</h2>
              <p className="text-lattice-accent font-bold">$PROOFLAYER</p>
            </div>
            <div>
              <p className="text-sm text-lattice-dim mb-2">Contract address</p>
              <p className="break-all rounded bg-lattice-bg border border-lattice-edge p-3 text-sm font-mono text-lattice-text">
                {TOKEN_ADDRESS}
              </p>
            </div>
            <a
              href={PUMP_FUN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-5 py-3 rounded bg-lattice-accent text-lattice-bg font-bold hover:opacity-90 transition"
            >
              Open pump.fun listing
            </a>
          </aside>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-20">
          {[
            {
              title: "What is Prooflayer?",
              body:
                "Prooflayer is a browser-based isometric online RPG in development: gather resources, train skills, explore regions, fight NPCs, complete quests, and build progress over time.",
            },
            {
              title: "What is the token for?",
              body:
                "The token is an official community token connected to the Prooflayer project. Its main purpose is to give curious people a public trail back to the game and its updates.",
            },
            {
              title: "Do I need it to play?",
              body:
                "No. Prooflayer should be playable without buying or holding the token. The game is the product; the token is not required access, power, or progression.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-lattice-panel border border-lattice-edge p-6">
              <h2 className="text-xl font-bold mb-3">{item.title}</h2>
              <p className="text-lattice-dim leading-relaxed">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-lattice-warn/40 bg-lattice-warn/10 p-8">
          <h2 className="text-3xl font-bold mb-4 text-lattice-warn">Plain-English Risk Warning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lattice-dim">
            <p>
              This token is risky and speculative. Its price can move sharply, and you can lose the
              full amount you spend. Nothing on this page is financial advice.
            </p>
            <p>
              Prooflayer does not promise profit, yield, buybacks, price support, exchange listings,
              or future token utility. Do your own research and never spend money you cannot afford
              to lose.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Creator Disclosure & Wallet Policy</h2>
            <div className="space-y-4 text-lattice-dim leading-relaxed">
              <p>
                The Prooflayer creator intends to use this token page as the official context hub for
                the community token and to point attention back toward the game.
              </p>
              <p>
                Creator or project-associated wallets may hold or transact in the token. Those
                wallets should not be interpreted as a guarantee of price support, liquidity support,
                profit, or future performance.
              </p>
              <p>
                Any future project wallet, treasury, liquidity, reward, or game-related token policy
                should be documented publicly before it is used as part of Prooflayer.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Development Roadmap</h2>
            {[
              ["Now", "Public homepage, early game prototype, server-backed progression, and transparent token context."],
              ["Next", "World pipeline, larger regions, account-owned characters, multiplayer presence, and better MMO foundations."],
              ["Later", "Quests, banks, shops, combat loops, economy systems, and deeper public playtesting."],
            ].map(([label, body]) => (
              <div key={label} className="rounded-lg bg-lattice-panel border border-lattice-edge p-5">
                <p className="text-lattice-accent font-bold mb-1">{label}</p>
                <p className="text-lattice-dim">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-lattice-panel border border-lattice-edge p-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Follow the product, not just the chart.</h2>
          <p className="text-lattice-dim max-w-2xl mx-auto mb-8">
            The most important thing Prooflayer can do is keep building a real game. Use the links
            below to check the product, source, and official updates.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/play" className="px-6 py-3 rounded bg-lattice-accent text-lattice-bg font-bold hover:opacity-90 transition">
              Play
            </a>
            <a
              href="https://x.com/ProofLayerCoin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded border border-lattice-edge hover:border-lattice-accent transition"
            >
              Twitter
            </a>
            <a
              href="https://github.com/prooflayercoin/prooflayer-game"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded border border-lattice-edge hover:border-lattice-accent transition"
            >
              GitHub
            </a>
            <a
              href="mailto:support@prooflayer.app"
              className="px-6 py-3 rounded border border-lattice-edge hover:border-lattice-accent transition"
            >
              Contact
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

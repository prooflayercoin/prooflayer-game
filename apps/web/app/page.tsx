import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight">
            <span className="text-lattice-accent">Proof</span>
            <span className="text-lattice-text">layer</span>
          </h1>
          <p className="text-lattice-dim">
            The world is held together by layered sigils. Maintain the lattice.
            Harvest, refine, and seal across six disciplines.
          </p>
        </div>
        <Link
          href="/play"
          className="inline-block px-6 py-3 rounded-md bg-lattice-accent text-lattice-bg font-semibold hover:bg-lattice-accent/90 transition"
        >
          Enter the lattice
        </Link>
        <p className="text-xs text-lattice-dim/70">
          Stage 1 — local dev build. No accounts yet.
        </p>
      </div>
    </main>
  );
}

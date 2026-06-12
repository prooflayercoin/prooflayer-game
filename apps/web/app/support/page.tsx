"use client";

export default function Support() {
  return (
    <div className="w-full min-h-screen bg-lattice-bg text-lattice-text">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full border-b border-lattice-edge bg-lattice-bg/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <a href="/" className="text-xl sm:text-2xl font-bold text-lattice-accent">
            ⬡ Prooflayer
          </a>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 items-center">
            <a href="/#features" className="text-sm hover:text-lattice-accent transition">
              Features
            </a>
            <a href="/coin" className="text-sm hover:text-lattice-accent transition">
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

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 py-32 pt-40">
        <h1 className="text-4xl font-bold mb-8">Support Center</h1>

        <div className="space-y-8 text-lattice-dim">
          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Getting Help</h2>
            <p>
              Welcome to the Prooflayer Support Center. We're here to help you with any questions or issues you may encounter.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Common Issues</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Account recovery and password reset</li>
              <li>Technical issues and troubleshooting</li>
              <li>Gameplay questions and mechanics</li>
              <li>Reporting bugs and exploits</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Contact Support</h2>
            <p>
              For all support inquiries, please reach out to us at{" "}
              <a href="mailto:support@prooflayer.app" className="text-lattice-accent hover:underline">
                support@prooflayer.app
              </a>
            </p>
            <p className="mt-4">
              You can also follow us on{" "}
              <a href="https://x.com/ProofLayerCoin" className="text-lattice-accent hover:underline" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>{" "}
              for status updates and announcements.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

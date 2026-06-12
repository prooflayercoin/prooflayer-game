"use client";

export default function Terms() {
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
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-8 text-lattice-dim">
          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Agreement to Terms</h2>
            <p>
              By accessing and using Prooflayer, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Prooflayer for
              personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under
              this license you may not: modify or copy the materials, use the materials for any commercial purpose or for any public
              display, attempt to decompile or reverse engineer any software contained on the Site.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Disclaimer</h2>
            <p>
              The materials on Prooflayer are provided on an 'as is' basis. Prooflayer makes no warranties, expressed or implied,
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions
              of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation
              of rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@prooflayer.app.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

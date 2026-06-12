"use client";

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-lattice-dim">
          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Introduction</h2>
            <p>
              Prooflayer ("we," "us," or "our") operates prooflayer.app (the "Site"). This page informs you of our policies
              regarding the collection, use, and disclosure of personal data when you use our Site.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Information Collection</h2>
            <p>
              We collect information you provide directly to us, such as when you sign up for updates or contact us. This may include
              your email address and any information you choose to share.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Use of Information</h2>
            <p>
              We use the information we collect to send you updates about Prooflayer, respond to your inquiries, and improve our Site
              and services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-lattice-text mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@prooflayer.app.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

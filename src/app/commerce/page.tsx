import Link from "next/link";

export default function CommerceEntryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Commerce · Marketplace (Coming Soon)
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Commerce experience coming soon
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            The &quot;Commerce&quot; navigation item is reserved for a future
            marketplace experience (for example, services, products, or resources
            connected to your real estate ecosystem).
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            What exists today
          </h2>
          <p className="text-sm text-slate-300">
            Right now, the main new flows you asked for live in the{" "}
            <span className="font-semibold">ALLIN1REALESTATE</span> concept hub:
            Referrals, Crowdfunding, and Networking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/allin1realestate"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400 transition"
            >
              Go to ALLIN1REALESTATE hub
            </Link>
          </div>
        </section>

        <section className="text-xs text-slate-400 space-y-2">
          <p>
            This page is intentionally simple so you can later replace it with a
            full commerce / marketplace design without affecting your current
            navigation or the ALLIN1REALESTATE concept pages.
          </p>
        </section>
      </div>
    </div>
  );
}



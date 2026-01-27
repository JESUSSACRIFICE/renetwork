import Link from "next/link";

export default function NetworkEntryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Network · ALLIN1REALESTATE
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Deal-focused networking for real estate (concept)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            The &quot;Network&quot; navigation leads to our{" "}
            <span className="font-semibold">concept-only</span> networking
            experience. The full design — groups, forums, deal-focused profiles,
            and more — is inside the ALLIN1REALESTATE hub.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            Where to explore the full Networking vision
          </h2>
          <p className="text-sm text-slate-300">
            To see the complete networking concept page you described, use the
            links below:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/allin1realestate/networking"
              className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow hover:bg-indigo-400 transition"
            >
              View Networking concept page
            </Link>
            <Link
              href="/allin1realestate"
              className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-100 hover:border-indigo-400 transition"
            >
              Go to ALLIN1REALESTATE hub
            </Link>
          </div>
        </section>

        <section className="text-xs text-slate-400 space-y-2">
          <p>
            Note: This route exists mainly so the &quot;Network&quot; button in your
            top navigation has a valid destination. The full networking design and
            copy lives under <code>/allin1realestate/networking</code>.
          </p>
        </section>
      </div>
    </div>
  );
}



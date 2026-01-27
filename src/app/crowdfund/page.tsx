import Link from "next/link";

export default function CrowdfundEntryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Crowdfund · ALLIN1REALESTATE
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Faith-based real estate crowdfunding (concept)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            You&apos;re in the right place — this navigation points to our{" "}
            <span className="font-semibold">concept-only</span> crowdfunding
            experience. The full vision lives on a dedicated page inside the
            ALLIN1REALESTATE hub.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            Where to explore the full Crowdfunding vision
          </h2>
          <p className="text-sm text-slate-300">
            To see all the details (values, SEC notice, pledge section, example
            projects, and more), open the main concept page:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/allin1realestate/crowdfunding"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow hover:bg-sky-400 transition"
            >
              View Crowdfunding concept page
            </Link>
            <Link
              href="/allin1realestate"
              className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-100 hover:border-sky-400 transition"
            >
              Go to ALLIN1REALESTATE hub
            </Link>
          </div>
        </section>

        <section className="text-xs text-slate-400 space-y-2">
          <p>
            Note: This route exists mainly so the &quot;Crowdfund&quot; button in
            your top navigation has a valid destination. The full design and copy
            you described lives under <code>/allin1realestate/crowdfunding</code>.
          </p>
        </section>
      </div>
    </div>
  );
}



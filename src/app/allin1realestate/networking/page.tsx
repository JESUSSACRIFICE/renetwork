import Link from "next/link";

export default function NetworkingPage() {
  return (
    <div className="relative py-16 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Intro */}
        <section className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/50 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Networking · Deal Flow · Community
          </p>
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50">
              🌐 Networking:{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Your deal flow source
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 max-w-3xl">
              Think{" "}
              <span className="font-semibold">
                Facebook + LinkedIn for real estate
              </span>
              —but actually focused on{" "}
              <span className="font-semibold">getting deals done</span>, with a
              faith‑based foundation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#get-started"
              className="rounded-full bg-indigo-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition"
            >
              Find deal partners
            </Link>
            <Link
              href="#features"
              className="rounded-full border border-slate-700 bg-slate-950/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-100 hover:border-indigo-400 transition"
            >
              Explore features
            </Link>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8"
        >
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">
              What it is
            </h2>
            <p className="text-sm text-slate-300">
              A networking hub where{" "}
              <span className="font-semibold">
                investors, agents, lenders, and service providers
              </span>{" "}
              connect around real deals—not just likes and vanity metrics.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-slate-200">
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  <span className="font-semibold">Newsfeed</span> – see new
                  posts, opportunities, and even highlight cards connected to
                  PSP &quot;Fiverr‑style&quot; services.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  <span className="font-semibold">Articles &amp; blogs</span> –
                  long‑form content for strategies, testimonies, and case
                  studies.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  <span className="font-semibold">Forums</span> – ask questions,
                  share deals, and troubleshoot live scenarios with peers.
                </span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  <span className="font-semibold">Groups</span> – connect with
                  your tribe by market, strategy, experience level, or
                  denomination.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  <span className="font-semibold">Deal‑focused profiles</span>{" "}
                  – see what members actually{" "}
                  <span className="italic">want to buy or sell</span>, not just
                  job titles.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  <span className="font-semibold">Smart matching &amp; secure messaging</span>{" "}
                  – AI‑assisted suggestions plus safe, in‑platform negotiation.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* What you can do */}
        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">
              What you can do
            </h2>
            <p className="text-sm text-slate-300">
              Move from isolation to{" "}
              <span className="font-semibold text-indigo-300">
                Christ‑centered collaboration
              </span>
              .
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-slate-200">
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  Find{" "}
                  <span className="font-semibold">JV partners</span> for your
                  next flip, BRRRR, or development deal.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  Source{" "}
                  <span className="font-semibold">off‑market opportunities</span>{" "}
                  without feeding endless guru funnels.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  Get{" "}
                  <span className="font-semibold">
                    real‑time expert input
                  </span>{" "}
                  on creative financing, structuring, and risk.
                </span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  Build your{" "}
                  <span className="font-semibold">professional reputation</span>{" "}
                  with consistent, value‑adding contributions.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  Cross‑pollinate with the{" "}
                  <span className="font-semibold">Referrals</span> platform to
                  turn connections into warm introductions.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-400" />
                <span>
                  Feed future{" "}
                  <span className="font-semibold">Crowdfunding</span> projects
                  with real community feedback and demand.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Get started */}
        <section
          id="get-started"
          className="space-y-6 rounded-3xl border border-indigo-400/40 bg-indigo-500/10 p-6 sm:p-8"
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-indigo-50">
              Get started
            </h2>
            <p className="text-sm text-indigo-100/90">
              Your next business partner is one connection away.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-indigo-50/95">
            <div className="space-y-3">
              <h3 className="font-semibold">For active investors</h3>
              <ul className="space-y-2">
                <li>• Share your buy box and target markets.</li>
                <li>• Plug into groups for your strategy (BRRRR, flips, notes, etc.).</li>
                <li>• Meet agents, wholesalers, and lenders aligned with your values.</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">For service providers</h3>
              <ul className="space-y-2">
                <li>• Showcase how you support investors and homeowners.</li>
                <li>• Network into masterminds and micro‑communities.</li>
                <li>• Turn conversations into referrals and repeat business.</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/allin1realestate"
              className="rounded-full border border-slate-200/40 bg-slate-950/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-50 hover:bg-indigo-400 hover:text-slate-950 transition"
            >
              Choose a different starting point
            </Link>
          </div>
        </section>

        {/* Tagline */}
        <section className="text-center text-sm text-slate-300">
          &quot;Your next business partner is one connection away&quot;
        </section>
      </div>
    </div>
  );
}



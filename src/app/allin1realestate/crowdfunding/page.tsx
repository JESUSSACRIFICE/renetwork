import Link from "next/link";

export default function CrowdfundingPage() {
  return (
    <div className="relative py-16 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Intro */}
        <section className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Future Feature · Faith-Based Recreation & Entertainment
          </p>
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50">
              🚀 Crowdfunding:{" "}
              <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                Your investment engine
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 max-w-3xl">
              Democratized investing in{" "}
              <span className="font-semibold">
                Christian-themed entertainment and recreation venues
              </span>{" "}
              that combine profit with purpose—designed to be JOBS Act–friendly
              once SEC approval is received.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#pledge"
              className="rounded-full bg-sky-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 transition"
            >
              Join the early interest list
            </a>
            <a
              href="#what-it-is"
              className="rounded-full border border-slate-700 bg-slate-950/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-100 hover:border-sky-400 transition"
            >
              Understand the vision
            </a>
          </div>
        </section>

        {/* What it is / SEC note */}
        <section
          id="what-it-is"
          className="grid gap-8 md:grid-cols-2 items-start"
        >
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-slate-50">What it is</h2>
            <p className="text-sm text-slate-300">
              A future platform where believers can{" "}
              <span className="font-semibold">
                pool funds into faith-based recreation and entertainment
              </span>
              —bowling alleys, ice rinks, water parks, and more—anchored in
              Christian values.
            </p>
            <p className="text-sm text-slate-300">
              Until full{" "}
              <span className="font-semibold">U.S. SEC approval</span>, we are
              only gathering an interest list. No investments are being offered
              or accepted at this time.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-amber-400/40 bg-amber-500/5 p-6 sm:p-7 text-sm text-amber-100/90">
            <h2 className="text-base font-semibold text-amber-100">
              Important notice
            </h2>
            <p>
              This page describes a{" "}
              <span className="font-semibold">
                vision for future crowdfunding opportunities
              </span>
              . It is not an offer to sell securities or a solicitation of an
              offer to buy securities.
            </p>
            <p>
              Any eventual investment opportunity would be structured to align
              with applicable regulations, including the JOBS Act, and would
              only be available{" "}
              <span className="font-semibold">
                after all required approvals
              </span>{" "}
              are obtained.
            </p>
          </div>
        </section>

        {/* Why it's unique / What you may be able to do */}
        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">
                Why it&apos;s unique
              </h2>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>
                    <span className="font-semibold">
                      JOBS Act–minded design
                    </span>{" "}
                    – built so that, once approved,{" "}
                    <span className="font-semibold">
                      non‑accredited investors
                    </span>{" "}
                    can participate.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>
                    <span className="font-semibold">Values-aligned</span> –
                    projects that honor God and strengthen communities.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>
                    <span className="font-semibold">Community-driven</span> –
                    the community helps vote on{" "}
                    <span className="italic">what gets built</span>, where, and
                    with what features.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>
                    <span className="font-semibold">Transparent by design</span>{" "}
                    – clear visibility into{" "}
                    <span className="italic">how funds are used</span> and what
                    impact is being created.
                  </span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">
                What you may be able to do (post‑approval)
              </h2>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>
                    Invest in{" "}
                    <span className="font-semibold">
                      bowling alleys, ice rinks, water parks
                    </span>{" "}
                    and other family-friendly venues.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>
                    Start with accessible minimums (for example,{" "}
                    <span className="font-semibold">$5,000</span>) depending on
                    final structure.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>
                    Vote on{" "}
                    <span className="font-semibold">
                      locations, amenities, and design
                    </span>{" "}
                    features within each project.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-sky-400" />
                  <span>
                    Potentially earn{" "}
                    <span className="font-semibold">
                      financial and eternal impact returns
                    </span>{" "}
                    as families encounter wholesome, Christ‑centered spaces.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pledge / Interest form placeholder */}
        <section
          id="pledge"
          className="space-y-6 rounded-3xl border border-sky-400/40 bg-sky-500/10 p-6 sm:p-8"
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-sky-50">
              Pledge your interest
            </h2>
            <p className="text-sm text-sky-100/90">
              Join the list to be notified if and when SEC approval is obtained
              and opportunities become available.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-sky-50/95">
            <div className="space-y-2">
              <p className="font-semibold">Basic details</p>
              <ul className="space-y-1">
                <li>• Name</li>
                <li>• Contact details (email / phone)</li>
                <li>• Best time to be reached</li>
                <li>• Real estate / crowdfunding interests</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p>
                When you&apos;re ready to build the actual form, this section
                can become a secure pledge form with fields for those details
                and a simple &quot;Click here to join the list&quot; action.
              </p>
              <p className="text-xs text-sky-100/80">
                For now, treat this as a design and content prototype: it shows
                the flow, tone, and expectations without collecting any real
                investment commitments.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/allin1realestate"
              className="rounded-full border border-slate-200/40 bg-slate-950/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-50 hover:bg-sky-400 hover:text-slate-950 transition"
            >
              Choose a different starting point
            </Link>
          </div>
        </section>

        {/* Tagline */}
        <section className="text-center text-sm text-slate-300">
          &quot;Build legacy while building wealth&quot;
        </section>
      </div>
    </div>
  );
}



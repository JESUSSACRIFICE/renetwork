import Link from "next/link";

export default function ReferralsPage() {
  return (
    <div className="relative py-16 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Intro */}
        <section className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Priority Platform · PSP · Referrals
          </p>
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50">
              🤝 Referrals:{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Your trusted real estate team
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 max-w-3xl">
              JN&apos;s vetted network of top-rated property service providers,
              designed like a faith-based{" "}
              <span className="font-semibold">Fiverr for real estate</span>—but
              with transparent teaching, learning, and referral rewards built
              in.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#get-started"
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition"
            >
              Find my dream team
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full border border-slate-700 bg-slate-950/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-100 hover:border-emerald-400 transition"
            >
              How referrals work
            </Link>
          </div>
        </section>

        {/* What it is / Why it's better */}
        <section className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-slate-50">What it is</h2>
            <p className="text-sm text-slate-300">
              A property service provider (PSP) platform where you can{" "}
              <span className="font-semibold text-emerald-300">
                find, favorite, and refer
              </span>{" "}
              trusted professionals—investors, agents, lenders, contractors,
              property managers, and more.
            </p>
            <p className="text-sm text-slate-300">
              Built to serve{" "}
              <span className="font-semibold">
                both active investors and service providers
              </span>
              , with transparent training so you can learn real estate while you
              earn referral rewards.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-emerald-500/40 bg-emerald-500/5 p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-emerald-100">
              Why it&apos;s better
            </h2>
            <ul className="space-y-3 text-sm text-emerald-50/90">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  <span className="font-semibold">
                    No more guessing who&apos;s active
                  </span>{" "}
                  – see who is ready to send or receive referrals in real time.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  <span className="font-semibold">Pre-vetted experts</span> –
                  cut through the noise and connect with trusted professionals.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  <span className="font-semibold">Performance tracked</span> –
                  see reviews, success metrics, and past work before referring.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  <span className="font-semibold">Specialized matching</span> –
                  get the right pro for {" "}
                  <span className="italic">this specific project</span>, not
                  just any project.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  <span className="font-semibold">
                    Earn rewards & get trained
                  </span>{" "}
                  – earn commissions for successful referrals while learning
                  real estate in the process.
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
              Turn &quot;I wish I was in real estate&quot; into{" "}
              <span className="font-semibold text-emerald-300">
                practical next steps
              </span>
              .
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-slate-200">
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  Find investors, professionals, agents, lenders, contractors,
                  and property managers to expand your think tank and
                  mastermind.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  Favorite, create, and name{" "}
                  <span className="font-semibold">playlists</span> of your go-to
                  pros by market, strategy, or project type.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  Read verified reviews and see{" "}
                  <span className="font-semibold">past work</span> before you
                  send a single client or partner.
                </span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  Get matched based on{" "}
                  <span className="font-semibold">
                    specific projects and needs
                  </span>{" "}
                  instead of generic categories.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  Earn commission for{" "}
                  <span className="font-semibold">successful referrals</span>,
                  tracked with transparency.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                <span>
                  Get trained while you refer—actually{" "}
                  <span className="font-semibold">get your feet wet</span> in
                  real estate instead of only dreaming about it.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Get started */}
        <section
          id="get-started"
          className="space-y-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600/20 via-emerald-500/15 to-sky-500/10 p-6 sm:p-8"
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-emerald-50">
              Get started
            </h2>
            <p className="text-sm text-emerald-100/90">
              Find your dream team in minutes, not months.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-emerald-50/95">
            <div className="space-y-3">
              <h3 className="font-semibold">For active investors</h3>
              <ul className="space-y-2">
                <li>• Build your local and remote PSP playlist.</li>
                <li>• Lock in your go-to agent, lender, and contractor.</li>
                <li>• Use referrals to scale deals without burning trust.</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">For service providers</h3>
              <ul className="space-y-2">
                <li>• Showcase verified work and success metrics.</li>
                <li>• Receive warm, pre-qualified referrals.</li>
                <li>• Plug into JN&apos;s ecosystem of faith-based deals.</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/allin1realestate"
              className="rounded-full border border-emerald-300/70 bg-slate-950/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-100 hover:bg-emerald-400 hover:text-slate-950 transition"
            >
              Choose a different starting point
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}



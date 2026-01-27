import Link from "next/link";

const cards = [
  {
    slug: "referrals",
    title: "🤝 Referrals",
    subtitle: "Your trusted team",
    tagline: "Find your dream team in minutes, not months.",
    description:
      "JN's vetted network of top-rated real estate professionals ready to help you succeed.",
    highlights: [
      "Pre-vetted experts with tracked performance metrics",
      "Specialized matching for each specific project",
      "Earn rewards and get trained as you refer",
    ],
    cta: "Explore Referrals",
  },
  {
    slug: "crowdfunding",
    title: "🚀 Crowdfunding",
    subtitle: "Your investment engine",
    tagline: "Build legacy while building wealth.",
    description:
      "Democratized, faith-aligned investing in Christian-themed recreation and entertainment venues.",
    highlights: [
      "Values-aligned projects that honor God",
      "Community-driven decisions on what gets built",
      "Transparent, JOBS Act–minded structure (pending SEC approval)",
    ],
    cta: "Explore Crowdfunding",
  },
  {
    slug: "networking",
    title: "🌐 Networking",
    subtitle: "Your deal flow source",
    tagline: "Your next business partner is one connection away.",
    description:
      "A deal-focused network for like-minded, faith-based real estate professionals.",
    highlights: [
      "Groups, forums, and newsfeed for real-time collaboration",
      "Profiles that highlight what people actually want to buy or sell",
      "Secure messaging and smart matching to turn conversations into deals",
    ],
    cta: "Explore Networking",
  },
];

export default function AllIn1RealEstatePage() {
  return (
    <div className="relative py-16 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-1 text-xs font-medium text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ALLIN1REALESTATE · Where faith, finance & future connect
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-50">
            Your complete{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              real estate ecosystem
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300">
            Stop jumping between disconnected platforms. Everything you need to
            succeed in real estate—referrals, crowdfunding, and networking—in
            one place built on Christian values.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/allin1realestate/referrals"
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition"
            >
              I need reliable pros
            </Link>
            <Link
              href="/allin1realestate/crowdfunding"
              className="rounded-full border border-slate-600 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-100 transition"
            >
              I want to invest
            </Link>
            <Link
              href="/allin1realestate/networking"
              className="rounded-full border border-slate-700/80 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-sky-400 hover:text-sky-100 transition"
            >
              I want more deal flow
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            “Where faith, finance, and future connect” 🙏
          </p>
        </section>

        {/* Cards */}
        <section className="grid gap-8 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.slug}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/40"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                  {card.subtitle}
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">
                  {card.title}
                </h2>
                <p className="text-sm text-emerald-300/80">{card.tagline}</p>
              </div>
              <p className="mt-4 text-sm text-slate-300">{card.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {card.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href={`/allin1realestate/${card.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 hover:text-slate-950 transition"
                >
                  {card.cta}
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* How they work together */}
        <section className="space-y-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-50">
              The perfect cycle
            </h2>
            <p className="text-sm text-slate-300">
              REFER → INVEST → NETWORK → REPEAT
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 text-sm text-slate-200">
            <div>
              <h3 className="font-semibold text-slate-50">REFER</h3>
              <p className="mt-2 text-slate-300">
                Connect people to trusted property service providers—agents,
                lenders, contractors, property managers—and earn commissions
                while learning the business.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-50">INVEST</h3>
              <p className="mt-2 text-slate-300">
                Pool funds into faith-based recreation and entertainment
                ventures once SEC approval is obtained, starting with simple
                pledges today.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-50">NETWORK</h3>
              <p className="mt-2 text-slate-300">
                Meet partners, find off-market deals, and grow your mastermind
                through forums, groups, and direct messaging.
              </p>
            </div>
          </div>
          <p className="text-sm text-emerald-300/90">
            Real example: Meet an investor in Networking → Refer them to your
            agent → Crowdfund a faith-based entertainment venue together ={" "}
            <span className="font-semibold">triple win</span>.
          </p>
        </section>

        {/* Comparison */}
        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-50">
            Why this beats everything else
          </h2>
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-slate-200">
              <thead className="text-xs uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="pr-6 pb-2">Feature</th>
                  <th className="pr-6 pb-2">BiggerPockets</th>
                  <th className="pr-6 pb-2">Facebook Groups</th>
                  <th className="pb-2 text-emerald-300">ALLIN1REALESTATE</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm">
                <tr>
                  <td className="pr-6 py-2 font-medium text-slate-100">
                    Vetted Professionals
                  </td>
                  <td className="pr-6 py-2">❌ Limited</td>
                  <td className="pr-6 py-2">❌ Random</td>
                  <td className="py-2 text-emerald-300">✅ Curated</td>
                </tr>
                <tr>
                  <td className="pr-6 py-2 font-medium text-slate-100">
                    Investment Opportunities
                  </td>
                  <td className="pr-6 py-2">❌ Talk only</td>
                  <td className="pr-6 py-2">❌ Scams common</td>
                  <td className="py-2 text-emerald-300">✅ Actual deals</td>
                </tr>
                <tr>
                  <td className="pr-6 py-2 font-medium text-slate-100">
                    Quality Connections
                  </td>
                  <td className="pr-6 py-2">❌ Overwhelming</td>
                  <td className="pr-6 py-2">❌ Unprofessional</td>
                  <td className="py-2 text-emerald-300">✅ Targeted</td>
                </tr>
                <tr>
                  <td className="pr-6 py-2 font-medium text-slate-100">
                    Values Alignment
                  </td>
                  <td className="pr-6 py-2">❌ Secular</td>
                  <td className="pr-6 py-2">❌ Mixed</td>
                  <td className="py-2 text-emerald-300">✅ Faith-based</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}



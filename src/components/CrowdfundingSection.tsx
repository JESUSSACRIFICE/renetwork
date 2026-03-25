import Link from "next/link";
import {
  Check,
  Landmark,
  Sparkles,
  UsersRound,
  Eye,
  Vote,
  Coins,
  Compass,
  Rocket,
  ArrowRight,
  HandCoins,
  Info,
} from "lucide-react";

const uniquePoints = [
  {
    icon: Landmark,
    title: "JOBS Act compliant",
    body: "Non-accredited investors welcome where regulations allow.",
  },
  {
    icon: Sparkles,
    title: "Values-aligned",
    body: "Projects that honor God—faith-based recreation and entertainment.",
  },
  {
    icon: UsersRound,
    title: "Community-driven",
    body: "You vote on what gets built—locations, features, and direction.",
  },
  {
    icon: Eye,
    title: "Transparent",
    body: "See where money goes and how each venture is structured.",
  },
] as const;

const mayAble = [
  "Invest in bowling alleys, ice rinks, water parks, and similar venues",
  "Start with as little as $5,000 (where offerings permit)",
  "Vote on locations and features as the community shapes each project",
  "Aim for financial returns alongside purpose-driven impact",
] as const;

export default function CrowdfundingSection() {
  return (
    <section
      className="border-t-[5px] border-orange-950/50 bg-gradient-to-b from-orange-700 via-orange-600 to-orange-800 text-white"
      aria-labelledby="crowdfunding-heading"
    >
      <div className="container pt-14 pb-6 md:pt-16 md:pb-8">
        <Link
          href="/crowdfund/projects"
          className="mb-6 inline-block text-3xl font-bold uppercase tracking-tight text-white underline decoration-orange-100/90 decoration-2 underline-offset-[6px] transition hover:text-white hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-4xl"
        >
          <span className="mr-2" aria-hidden>
            🚀
          </span>
          Crowdfunding
        </Link>
        <div className="grid grid-cols-2 gap-4 sm:gap-8 items-start">
          <div className="min-w-0">
            <div className="min-w-0 flex-1 md:pr-8 lg:pr-12">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Rocket className="h-5 w-5 shrink-0 text-white" aria-hidden />
                Create or list a project
              </h3>
              <p className="mt-2 max-w-3xl text-base leading-relaxed text-orange-50/95">
                Raising for a faith-based recreation or entertainment venue?
                Join the early interest list so we can guide you toward
                publishing on RE Network as soon as compliance and SEC
                milestones allow.
              </p>
              <Link
                href="/allin1realestate/crowdfunding#pledge"
                className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-white underline-offset-4 hover:text-orange-50 hover:underline"
              >
                Join the organizer list
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="min-w-0 pt-10 md:pl-8 lg:pl-8 md:pt-0">
            <h2
              id="crowdfunding-heading"
              className="flex items-start gap-2 text-lg font-semibold text-white sm:gap-3"
            >
              <HandCoins
                className="mt-0.5 h-6 w-6 shrink-0 text-white"
                aria-hidden
              />
              <span className="min-w-0">
                Invest in faith-based recreation &amp; entertainment
              </span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-orange-50/95">
              Democratized investing in Christian-themed venues that combine
              profit with purpose—until SEC approval, join the pledge and
              interest list to raise and allocate capital together.
            </p>
          </div>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-8 pt-12 md:grid-cols-2 md:items-start md:gap-0"
          aria-label="Crowdfunding actions"
        >
          <div className="min-w-0 md:pr-8 lg:pr-12 border-r-[3px] border-white/70">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Info className="h-5 w-5 shrink-0 text-white" aria-hidden />
              What it is
            </h3>
            <p className="mt-3 text-base leading-relaxed text-orange-50/95">
              A pathway to back faith-aligned recreation and entertainment
              ventures. Until U.S. SEC approval, we collect pledges and interest
              so you can signal demand, stay informed, and be ready when
              offerings go live.
            </p>
            <p className="mt-4 text-base leading-relaxed text-orange-100/90">
              Basic interest details: name, contact, best time to reach you, and
              real-estate crowdfunding interests—so we can match you to the
              right updates and opportunities.
            </p>
          </div>

          <div className="min-w-0 pt-10 md:pl-8 lg:pl-12 md:pt-0">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Compass className="h-5 w-5 shrink-0 text-white" aria-hidden />
              Explore RE Network projects
            </h3>
            <p className="mt-2 text-base leading-relaxed text-orange-50/95">
              Browse live crowdfunding listings, compare venues and goals, and
              pledge or follow projects that match your values.
            </p>
            <Link
              href="/crowdfund/projects"
              className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-white underline-offset-4 hover:text-orange-50 hover:underline"
            >
              See all projects
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <div className="container space-y-12 py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Vote className="h-5 w-5 text-white" aria-hidden />
              You may be able to
            </h3>
            <ul className="mt-4 space-y-2 text-orange-50/95">
              {mayAble.map((line) => (
                <li key={line} className="flex gap-2 text-base leading-relaxed">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-emerald-200"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Why it&apos;s unique
            </h3>
            <ul className="mt-4 space-y-4">
              {uniquePoints.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-white"
                    aria-hidden
                  />
                  <span>
                    <span className="font-medium text-white">{title}</span>
                    <span className="mt-0.5 block text-base leading-relaxed text-orange-100/90">
                      {body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-8 pt-14 md:flex-row md:items-start md:justify-between md:gap-10 md:pt-16">
          <div className="flex flex-col gap-3 md:max-w-md md:items-end">
            <p className="text-base font-medium italic leading-relaxed text-white md:text-right">
              &ldquo;Build legacy while building wealth.&rdquo;
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end">
              <Link
                href="/crowdfund/projects"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-base font-semibold text-orange-800 transition hover:bg-orange-50"
              >
                Explore projects
                <Compass className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/allin1realestate/crowdfunding#pledge"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-white/50 bg-transparent px-5 py-2.5 text-base font-semibold text-white transition hover:border-white/80 hover:bg-white/10"
              >
                List a project
                <Rocket className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/allin1realestate/crowdfunding"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/50 bg-transparent px-5 py-2.5 text-base font-semibold text-white transition hover:border-white/80 hover:bg-white/15"
              >
                Vision &amp; FAQ
              </Link>
            </div>
            <p className="flex items-start gap-2 text-base leading-relaxed text-orange-950/80 md:max-w-sm md:justify-end md:text-right">
              <Coins className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                Not an offer to sell securities. Participation depends on
                regulatory approval and offering documents.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

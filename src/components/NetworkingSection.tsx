import Link from "next/link";
import {
  Check,
  ArrowRight,
  Info,
  Compass,
  Network,
  Satellite,
  Newspaper,
  BookOpen,
  MessagesSquare,
  UsersRound,
  LayoutGrid,
  Sparkles,
  Shield,
  Lock,
  UserCircle,
} from "lucide-react";

const powerfulPoints = [
  {
    icon: Newspaper,
    title: "Newsfeed",
    body: "Stay current with posts and activity from professionals across the network.",
  },
  {
    icon: BookOpen,
    title: "Articles & blogs",
    body: "Long-form insights, case studies, and market takes from people in the field.",
  },
  {
    icon: MessagesSquare,
    title: "Forums",
    body: "Threaded discussions on strategy, markets, and execution—not scattered group chaos.",
  },
  {
    icon: LayoutGrid,
    title: "Groups",
    body: "Find your tribe by strategy, geography, or role and go deep with the right peers.",
  },
  {
    icon: UserCircle,
    title: "Deal-focused profiles",
    body: "See what people actually want to buy, sell, or partner on—not just a static resume.",
  },
  {
    icon: Sparkles,
    title: "Smart matching",
    body: "Suggestions tuned to your interests, markets, and how you want to participate.",
  },
  {
    icon: Lock,
    title: "Secure messaging",
    body: "Negotiate and build rapport in-platform before you share personal contact details.",
  },
] as const;

const youCan = [
  "Find JV partners for your next deal",
  "Source off-market opportunities through trusted connections",
  "Get expert advice in real time from people who’ve done the work",
  "Build your professional reputation with activity people can verify",
] as const;

export default function NetworkingSection() {
  return (
    <section
      className="border-t-[5px] border-teal-950/60 bg-gradient-to-b from-teal-900 via-cyan-900 to-slate-900 text-white"
      aria-labelledby="networking-heading"
    >
      <div className="container pt-14 pb-6 md:pt-16 md:pb-8">
        <Link
          href="/network"
          className="mb-6 inline-block text-3xl font-bold uppercase tracking-tight text-white underline decoration-cyan-200/80 decoration-2 underline-offset-[6px] transition hover:text-cyan-100 hover:decoration-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-4xl"
        >
          <span className="mr-2" aria-hidden>
            {"\u{1F5A7}"}
          </span>
          Networking
        </Link>
        <div className="grid grid-cols-2 items-start gap-4 sm:gap-8">
          <div className="min-w-0">
            <div className="min-w-0 md:pr-8 lg:pr-12">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Compass
                  className="h-5 w-5 shrink-0 text-cyan-200"
                  aria-hidden
                />
                Open the network feed
              </h3>
              <p className="mt-2 max-w-3xl text-base leading-relaxed text-cyan-50/95">
                Jump into the live feed: posts, conversations, and deal-oriented
                updates from RE Network members—similar in spirit to the social
                layers you know, built for real estate outcomes.
              </p>
              <Link
                href="/network/feed"
                className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-white underline-offset-4 hover:text-cyan-100 hover:underline"
              >
                Go to your feed
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="min-w-0 pt-10 md:pl-8 md:pt-0 lg:pl-8">
            <h2
              id="networking-heading"
              className="flex items-start gap-2 text-lg font-semibold text-white sm:gap-3"
            >
              {/* <Satellite
                className="mt-0.5 h-6 w-6 shrink-0 text-cyan-200"
                aria-hidden
              /> */}
              📡
              <span className="min-w-0">
                Connect with like-minded professionals
              </span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cyan-50/95">
              The Facebook- and LinkedIn-style layer for real estate—except the
              point is deals: partners, intel, and introductions that move
              projects forward, not endless scrolling.
            </p>
          </div>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-8 pt-12 md:grid-cols-2 md:items-start md:gap-0"
          aria-label="Networking overview"
        >
          <div className="min-w-0 border-r-[3px] border-cyan-200/50 md:pr-8 lg:pr-12">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Info className="h-5 w-5 shrink-0 text-cyan-200" aria-hidden />
              What it is
            </h3>
            <p className="mt-3 text-base leading-relaxed text-cyan-50/95">
              A professional graph for real estate: profiles, feed, groups, and
              forums oriented around who you need next—not generic “likes,” but
              clarity on buy boxes, capital, and collaboration.
            </p>
            <p className="mt-4 text-base leading-relaxed text-cyan-100/90">
              Think familiar social patterns (feed, articles, groups) applied to
              referrals, crowdfunding touchpoints, and deal flow so the three
              pillars of RE Network reinforce each other.
            </p>
          </div>

          <div className="min-w-0 pt-10 md:pl-8 md:pt-0 lg:pl-12">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Shield className="h-5 w-5 shrink-0 text-cyan-200" aria-hidden />
              Why it matters
            </h3>
            <p className="mt-2 text-base leading-relaxed text-cyan-50/95">
              Stop hunting across disconnected groups and DMs. One place to
              discover people, follow threads, and graduate conversations into
              referrals or investments when the fit is right.
            </p>
            <Link
              href="/allin1realestate/networking"
              className="mt-3 inline-flex items-center gap-1 text-base font-semibold text-white underline-offset-4 hover:text-cyan-100 hover:underline"
            >
              Read the networking vision
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <div className="container space-y-12 py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <UsersRound className="h-5 w-5 text-cyan-200" aria-hidden />
              You can
            </h3>
            <ul className="mt-4 space-y-2 text-cyan-50/95">
              {youCan.map((line) => (
                <li key={line} className="flex gap-2 text-base leading-relaxed">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-emerald-300"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Why it&apos;s powerful
            </h3>
            <ul className="mt-4 space-y-4">
              {powerfulPoints.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200"
                    aria-hidden
                  />
                  <span>
                    <span className="font-medium text-white">{title}</span>
                    <span className="mt-0.5 block text-base leading-relaxed text-cyan-100/90">
                      {body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-8 pt-14 md:flex-row md:items-start md:justify-between md:gap-10 md:pt-16">
          <div className="flex flex-col gap-3 md:max-w-lg md:items-end">
            <p className="text-base font-medium italic leading-relaxed text-white md:text-right">
              &ldquo;Your next business partner is one connection away.&rdquo;
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end">
              <Link
                href="/network/feed"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-base font-semibold text-teal-900 transition hover:bg-cyan-50"
              >
                Open network feed
                <Network className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/allin1realestate"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-white/50 bg-transparent px-5 py-2.5 text-base font-semibold text-white transition hover:border-white/80 hover:bg-white/10"
              >
                All three pillars
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/allin1realestate/networking"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/50 bg-transparent px-5 py-2.5 text-base font-semibold text-white transition hover:border-white/80 hover:bg-white/15"
              >
                Vision &amp; FAQ
              </Link>
            </div>
            <p className="text-base leading-relaxed text-slate-300/90 md:max-w-md md:text-right">
              Community content is user-generated. Verify credentials,
              opportunities, and counterparties the same way you would in any
              professional relationship.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type BrowseItem = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  size?: "poster" | "wide";
};

type BrowseRow = {
  id: string;
  title: string;
  subtitle?: string;
  items: BrowseItem[];
  accent?: "amber" | "violet" | "cyan" | "rose";
};

const HERO_ITEMS: BrowseItem[] = [
  {
    id: "hero-1",
    title: "City Lights",
    subtitle: "New original",
    size: "wide",
  },
  { id: "hero-2", title: "After Hours", subtitle: "Trending", size: "wide" },
  { id: "hero-3", title: "Neon Miles", subtitle: "Top pick", size: "wide" },
];

const ROWS: BrowseRow[] = [
  {
    id: "recommended",
    title: "Recommended",
    subtitle: "Fresh picks based on tonight's vibe",
    accent: "amber",
    items: [
      { id: "rec-1", title: "The Bachelorette Party" },
      { id: "rec-2", title: "Terri Joe: Mission" },
      { id: "rec-3", title: "Everybody Hates Chris" },
      { id: "rec-4", title: "Rooftop Sessions" },
      { id: "rec-5", title: "Jersey Days" },
      { id: "rec-6", title: "Weekend Rebels" },
    ],
  },
  {
    id: "movie-night",
    title: "Movie Night",
    subtitle: "Blockbusters and comfort classics",
    accent: "violet",
    items: [
      { id: "movie-1", title: "Talladega Nights" },
      { id: "movie-2", title: "Taken 2" },
      { id: "movie-3", title: "The Longest Yard" },
      { id: "movie-4", title: "Fast Lane" },
      { id: "movie-5", title: "Neon Boulevard" },
    ],
  },
  {
    id: "series",
    title: "Series to Binge",
    subtitle: "Get hooked in one episode",
    accent: "cyan",
    items: [
      { id: "series-1", title: "Midnight Club" },
      { id: "series-2", title: "Sunset Drive" },
      { id: "series-3", title: "Northside" },
      { id: "series-4", title: "Metro Pulse" },
      { id: "series-5", title: "Afterglow" },
    ],
  },
  {
    id: "family",
    title: "Family Favorites",
    subtitle: "All ages, all smiles",
    accent: "rose",
    items: [
      { id: "fam-1", title: "Sunday Brunch" },
      { id: "fam-2", title: "Campus Crew" },
      { id: "fam-3", title: "Young Legends" },
      { id: "fam-4", title: "Playground Dreams" },
      { id: "fam-5", title: "Weekend Wonders" },
    ],
  },
];

const GRADIENTS = [
  "from-slate-900 via-slate-800 to-amber-500/50",
  "from-indigo-950 via-indigo-900 to-cyan-500/50",
  "from-neutral-950 via-neutral-900 to-rose-500/50",
  "from-zinc-950 via-zinc-900 to-emerald-500/50",
  "from-slate-950 via-slate-900 to-violet-500/50",
];

function getGradient(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

function AccentTag({
  accent,
  text,
}: {
  accent: BrowseRow["accent"];
  text: string;
}) {
  const styles = {
    amber: "bg-amber-400/20 text-amber-200 border-amber-300/40",
    violet: "bg-violet-400/20 text-violet-200 border-violet-300/40",
    cyan: "bg-cyan-400/20 text-cyan-200 border-cyan-300/40",
    rose: "bg-rose-400/20 text-rose-200 border-rose-300/40",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32em]",
        accent ? styles[accent] : "border-neutral-700 text-neutral-300",
      )}
    >
      {text}
    </span>
  );
}

function PosterCard({ item, index }: { item: BrowseItem; index: number }) {
  return (
    <button
      type="button"
      className={cn(
        "group relative flex h-48 w-32 shrink-0 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-3 text-left shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
        "sm:h-52 sm:w-36",
      )}
      aria-label={item.title}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-br opacity-90",
          getGradient(index),
        )}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_55%)]"
        aria-hidden
      />
      {item.badge ? (
        <span className="mb-2 inline-flex w-fit rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
          {item.badge}
        </span>
      ) : null}
      <p className="text-sm font-semibold text-white line-clamp-2">
        {item.title}
      </p>
      {item.subtitle ? (
        <p className="mt-1 text-xs text-white/70 line-clamp-1">
          {item.subtitle}
        </p>
      ) : null}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-200/90">
        Watch now
        <span aria-hidden>→</span>
      </span>
    </button>
  );
}

function WideCard({ item, index }: { item: BrowseItem; index: number }) {
  return (
    <button
      type="button"
      className={cn(
        "group relative flex h-44 w-72 shrink-0 flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1",
        "sm:h-56 sm:w-[26rem]",
      )}
      aria-label={item.title}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-br opacity-95",
          getGradient(index),
        )}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]"
        aria-hidden
      />
      <span className="mb-2 inline-flex w-fit rounded-full bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
        {item.subtitle ?? "Featured"}
      </span>
      <p className="text-lg font-semibold text-white sm:text-2xl">
        {item.title}
      </p>
      <p className="mt-1 text-sm text-white/70">Stream now • 4K</p>
    </button>
  );
}

function BrowseRowSection({ row }: { row: BrowseRow }) {
  return (
    <section className="space-y-3" aria-labelledby={`row-${row.id}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2
              id={`row-${row.id}`}
              className="text-xl font-semibold text-white sm:text-2xl"
            >
              {row.title}
            </h2>
            {row.accent ? (
              <AccentTag accent={row.accent} text="Curated" />
            ) : null}
          </div>
          {row.subtitle ? (
            <p className="mt-1 text-sm text-white/60">{row.subtitle}</p>
          ) : null}
        </div>
        <Link
          href="/browse"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80 hover:text-amber-200"
        >
          See all
        </Link>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {row.items.map((item, index) => (
          <PosterCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

export default function BrowsePage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[#0c0b14] text-white">
      <div className="pointer-events-none absolute -top-28 right-0 h-64 w-64 rounded-full bg-amber-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-500/20 blur-[140px]" />

      <section className="px-4 pt-6 sm:px-6 lg:px-10">
        <div className="mb-5 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-700/60 via-purple-700/60 to-indigo-700/60 px-4 py-3 text-sm text-white/90 sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">
              Download the app for a faster, smoother experience.
            </p>
            <button
              type="button"
              className="rounded-full bg-white/10 px-2 py-1 text-xs uppercase tracking-[0.2em] text-white/80"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="reveal">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                Browse
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Find your next obsession
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/60">
                Curated drops, bingeable series, and midnight movie runs. Pick a
                row and hit play.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {["Recommended", "Movie Night", "Series", "Family"].map(
                (chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 transition hover:border-amber-300/40 hover:text-amber-200"
                  >
                    {chip}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4 px-4 sm:px-6 lg:px-10">
        <div className="no-scrollbar reveal-delay flex gap-4 overflow-x-auto pb-2">
          {HERO_ITEMS.map((item, index) => (
            <WideCard key={item.id} item={item} index={index} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full",
                i === 4 ? "bg-amber-300" : "bg-white/20",
              )}
            />
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-10 px-4 pb-12 sm:px-6 lg:px-10">
        {ROWS.map((row) => (
          <BrowseRowSection key={row.id} row={row} />
        ))}
      </section>

      <style jsx>{`
        .no-scrollbar {
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .reveal {
          animation: fadeUp 0.6s ease-out both;
        }
        .reveal-delay {
          animation: fadeUp 0.8s ease-out both;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

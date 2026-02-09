import Link from "next/link";
import { cn } from "@/lib/utils";
import { contentService } from "@/lib/services/content.service";
import type { ContentSummaryDto } from "@/types/api";

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

const GRADIENTS = [
  "from-slate-950 via-slate-900 to-slate-500/40",
  "from-indigo-950 via-indigo-900 to-slate-400/40",
  "from-neutral-950 via-neutral-900 to-slate-500/40",
  "from-zinc-950 via-zinc-900 to-slate-400/40",
  "from-slate-950 via-slate-900 to-slate-500/40",
];

const ACCENTS: BrowseRow["accent"][] = ["amber", "violet", "cyan", "rose"];

function getGradient(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

function formatSubtitle(item: ContentSummaryDto): string | undefined {
  const parts: string[] = [];
  if (item.releaseYear) parts.push(String(item.releaseYear));
  if (item.ageRating) parts.push(item.ageRating);
  const subtitle = parts.join(" • ");
  return subtitle.length > 0 ? subtitle : undefined;
}

function toBrowseItem(item: ContentSummaryDto): BrowseItem {
  return {
    id: item.id,
    title: item.title,
    subtitle: formatSubtitle(item),
  };
}

function slugifyRowId(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug.length > 0 ? slug : "featured";
}

function buildRows(
  items: ContentSummaryDto[],
  categories: string[],
): BrowseRow[] {
  const grouped = new Map<string, ContentSummaryDto[]>();
  for (const item of items) {
    const key = item.category?.trim() || "Featured";
    const existing = grouped.get(key);
    if (existing) existing.push(item);
    else grouped.set(key, [item]);
  }

  const orderedCategories = categories.filter(
    (category) => category.toLowerCase() !== "all",
  );
  const rowKeys = [
    ...orderedCategories.filter((category) => grouped.has(category)),
    ...Array.from(grouped.keys()).filter(
      (category) => !orderedCategories.includes(category),
    ),
  ];

  return rowKeys
    .map((category, index) => ({
      id: slugifyRowId(category),
      title: category,
      subtitle:
        category === "Featured"
          ? "Fresh picks for you"
          : `Top picks in ${category}`,
      accent: ACCENTS[index % ACCENTS.length],
      items: (grouped.get(category) ?? []).map(toBrowseItem),
    }))
    .filter((row) => row.items.length > 0);
}

async function getBrowseData(): Promise<{
  rows: BrowseRow[];
  chips: string[];
}> {
  try {
    const [items, categories] = await Promise.all([
      contentService.getContentForBrowse(),
      contentService.getCategories(),
    ]);
    return {
      rows: buildRows(items, categories),
      chips: categories.length > 0 ? categories : ["All"],
    };
  } catch {
    return { rows: [], chips: ["All"] };
  }
}

function AccentTag({
  accent,
  text,
}: {
  accent: BrowseRow["accent"];
  text: string;
}) {
  const styles = {
    amber: "bg-white/10 text-white/80 border-white/20",
    violet: "bg-white/10 text-white/80 border-white/20",
    cyan: "bg-white/10 text-white/80 border-white/20",
    rose: "bg-white/10 text-white/80 border-white/20",
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
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/80">
        Watch now
        <span aria-hidden>→</span>
      </span>
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
          className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70 hover:text-white"
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

export default async function BrowsePage() {
  const { rows, chips } = await getBrowseData();
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[#0b0b0e] text-white">
      <div className="pointer-events-none absolute -top-28 right-0 h-64 w-64 rounded-full bg-white/10 blur-[120px]" />
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
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-10 px-4 pb-12 sm:px-6 lg:px-10">
        {rows.length > 0 ? (
          rows.map((row) => <BrowseRowSection key={row.id} row={row} />)
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            No content is available yet. Check back soon.
          </div>
        )}
      </section>
    </main>
  );
}

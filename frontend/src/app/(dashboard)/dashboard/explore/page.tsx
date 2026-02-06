import Link from "next/link";
import { Button, Input } from "@/components/ui";

const TRENDING_TITLES = [
  { title: "City of Echoes", tag: "Drama" },
  { title: "Night Shift", tag: "Thriller" },
  { title: "Analog Dreams", tag: "Sci-fi" },
  { title: "Wildlight", tag: "Documentary" },
];

const MOODS = ["Chill", "High energy", "Focus", "Family", "Indie", "Live"];

export default function ExplorePage() {
  return (
    <div className="font-[var(--font-geist-sans)]">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Search / Explore
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Find your next favorite watch
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Search across creators, collections, and playlists curated for your
          mood.
        </p>
      </header>

      <section
        className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6"
        aria-label="Search"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Input
            label="Search titles, creators, or genres"
            placeholder='Try "live concerts"'
          />
          <div className="rounded-xl border border-neutral-700/70 bg-neutral-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Quick filters
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Trending", "New", "Free", "Live now", "Top rated"].map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    className="rounded-full border border-neutral-600 px-3 py-1 text-xs font-semibold text-neutral-200 hover:border-accent hover:text-accent"
                  >
                    {filter}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-label="Trending">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Trending now</h2>
          <Link
            href="/browse"
            className="text-xs font-semibold text-neutral-400 hover:text-accent"
          >
            Open browse
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRENDING_TITLES.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 p-4"
            >
              <div className="h-24 rounded-lg bg-gradient-to-br from-neutral-800/80 via-neutral-900 to-neutral-800/60" />
              <p className="mt-4 text-sm font-semibold text-white">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-neutral-400">{item.tag}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full"
              >
                View details
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-label="Browse by mood">
        <h2 className="text-lg font-semibold text-white">Browse by mood</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOODS.map((mood) => (
            <div
              key={mood}
              className="flex items-center justify-between rounded-xl border border-neutral-700/60 bg-neutral-900/60 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">{mood}</p>
                <p className="text-xs text-neutral-400">Curated playlists</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-neutral-400 hover:text-accent"
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

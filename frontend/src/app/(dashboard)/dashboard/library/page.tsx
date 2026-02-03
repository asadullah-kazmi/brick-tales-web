import Link from "next/link";
import { Button } from "@/components/ui";

export default function LibraryPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Library
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Saved and watched content will appear here.
        </p>
      </header>

      <section
        className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-8 sm:p-12 text-center"
        aria-label="Library content"
      >
        <span className="text-5xl text-neutral-600" aria-hidden>
          📚
        </span>
        <p className="mt-4 text-lg font-medium text-white">
          Your library is empty
        </p>
        <p className="mt-2 max-w-sm mx-auto text-sm text-neutral-400">
          Videos you save or watch will show up here for quick access.
        </p>
        <Link href="/browse" className="mt-6 inline-block">
          <Button type="button">Browse content</Button>
        </Link>
      </section>
    </>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
        Welcome to Stream
      </h1>
      <p className="mt-4 max-w-xl text-center text-neutral-600 dark:text-neutral-400">
        Your video streaming platform. Browse content and start watching.
      </p>
      <Link
        href="/browse"
        className="mt-8 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        Browse content
      </Link>
    </main>
  );
}

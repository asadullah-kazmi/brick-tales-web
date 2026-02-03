import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Stream. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              href="/browse"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Browse
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

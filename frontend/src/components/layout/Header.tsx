import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold text-neutral-900 dark:text-white"
        >
          Stream
        </Link>
        <nav className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
          <Link
            href="/browse"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/login"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

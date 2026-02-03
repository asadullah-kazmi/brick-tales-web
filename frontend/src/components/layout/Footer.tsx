import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="BRICK TALES.TV"
              width={100}
              height={26}
              className="h-6 w-auto object-contain opacity-90"
            />
            <p>
              © {new Date().getFullYear()} BRICK TALES.TV. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Footer links">
            <Link
              href="/browse"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/terms-of-use"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy-policy"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookie-consent"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Cookie Consent Tool
            </Link>
            <Link
              href="/do-not-sell"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Do Not Sell or Share My Personal Information
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

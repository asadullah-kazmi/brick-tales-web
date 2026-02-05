import Link from "next/link";

/**
 * Custom 404 page. Kept minimal so Next can collect page data for /_not-found at build time.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0c0c0c] px-4 text-center">
      <h1 className="text-4xl font-bold text-[#fafafa]">404</h1>
      <p className="text-lg text-gray-400">This page could not be found.</p>
      <Link
        href="/"
        className="rounded bg-[#ffe700] px-4 py-2 font-medium text-[#0c0c0c] hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  SITE_BRAND,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  absoluteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Watch & Discover Video Content",
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  openGraph: {
    title: `${SITE_BRAND} — Watch & Discover Video Content`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    type: "website",
  },
  twitter: {
    title: `${SITE_BRAND} — Watch & Discover Video Content`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_BRAND,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/browse")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <WebSiteJsonLd />
      <div className="relative mb-8">
        <Image
          src="/logo.png"
          alt={SITE_BRAND}
          width={280}
          height={96}
          className="h-20 w-auto object-contain sm:h-24"
          priority
        />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
        Welcome to {SITE_BRAND}
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

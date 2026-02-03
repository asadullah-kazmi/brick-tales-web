/**
 * (public) — Public route group
 *
 * Purpose: Unauthenticated, marketing-facing routes. No login required.
 * Use for: Landing page, browse/catalog, watch page, marketing pages.
 * URL segments: (public) does not appear in the URL (e.g. /, /browse, /watch/123).
 */

import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
  openGraph: {
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

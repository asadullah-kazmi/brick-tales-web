import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Browse Videos",
  description: `Browse and discover video content. ${SITE_DESCRIPTION}`,
  openGraph: {
    title: `Browse Videos | ${SITE_NAME}`,
    description: `Browse and discover video content. ${SITE_DESCRIPTION}`,
    url: absoluteUrl("/browse"),
    type: "website",
  },
  twitter: {
    title: `Browse Videos | ${SITE_NAME}`,
    description: `Browse and discover video content. ${SITE_DESCRIPTION}`,
  },
  alternates: {
    canonical: absoluteUrl("/browse"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

function CollectionPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Browse Videos",
    description: `Browse and discover video content. ${SITE_DESCRIPTION}`,
    url: absoluteUrl("/browse"),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CollectionPageJsonLd />
      {children}
    </>
  );
}

import type { Metadata } from "next";
import { contentService } from "@/lib/services";
import { SITE_BRAND, absoluteUrl } from "@/lib/seo";
import { durationToIso8601 } from "@/lib/video-utils";
import WatchPageClient from "./WatchPageClient";

type WatchPageProps = {
  params: { id: string };
};

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { id } = params;
  const res = await contentService.getVideoById(id);
  const video = res?.video;

  if (!video) {
    return {
      title: "Video Not Found",
      description: "The requested video could not be found.",
      robots: { index: false, follow: true },
    };
  }

  const title = video.title;
  const description =
    video.description?.slice(0, 160) ??
    `Watch ${video.title} on ${SITE_BRAND}.${
      video.category ? ` Category: ${video.category}.` : ""
    }`;
  const canonicalUrl = absoluteUrl(`/watch/${id}`);
  const image = video.thumbnailUrl ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_BRAND}`,
      description,
      url: canonicalUrl,
      type: "video.other",
      images: image
        ? [{ url: image, width: 1280, height: 720, alt: title }]
        : undefined,
      siteName: SITE_BRAND,
      videos: undefined, // optional: og:video for embed URL
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_BRAND}`,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function VideoObjectJsonLd({
  video,
  id,
}: {
  video: {
    title: string;
    description?: string;
    duration: string;
    thumbnailUrl: string | null;
    publishedAt?: string;
    createdAt: string;
  };
  id: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description ?? video.title,
    thumbnailUrl: video.thumbnailUrl ?? undefined,
    uploadDate: video.publishedAt ?? video.createdAt,
    duration: durationToIso8601(video.duration),
    contentUrl: undefined as string | undefined, // optional: direct video URL
    embedUrl: absoluteUrl(`/watch/${id}`),
    publisher: {
      "@type": "Organization",
      name: SITE_BRAND,
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

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = params;
  const res = await contentService.getVideoById(id);
  const video = res?.video;

  return (
    <>
      {video && <VideoObjectJsonLd video={video} id={id} />}
      <WatchPageClient params={{ id }} />
    </>
  );
}

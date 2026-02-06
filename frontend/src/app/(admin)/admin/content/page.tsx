"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminContent } from "@/contexts";
import { Button, Loader } from "@/components/ui";
import { formatDuration } from "@/lib/video-utils";
import { cn } from "@/lib/utils";

function formatCreatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminContentPage() {
  const router = useRouter();
  const { videos, loading, error, updateVideo, refresh } = useAdminContent();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleTogglePublish(id: string, current: boolean) {
    setTogglingId(id);
    try {
      await updateVideo(id, { published: !current });
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Library
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review uploads, edit metadata, and manage publish status.
          </p>
        </div>
        <Link href="/admin/content/upload">
          <Button type="button">Upload video</Button>
        </Link>
      </header>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12">
          <Loader size="lg" label="Loading content…" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 py-12 text-center">
          <p className="text-red-300">{error}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => void refresh()}
          >
            Try again
          </Button>
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12 text-center">
          <p className="text-neutral-400">
            No content yet. Upload a video to get started.
          </p>
          <Link href="/admin/content/upload" className="mt-4 inline-block">
            <Button type="button" variant="secondary">
              Upload video
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-700/50 bg-neutral-900/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-700/50 bg-neutral-800/50">
                  <th className="px-4 py-3 font-medium text-neutral-300">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-300">
                    Duration
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-300">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-300">
                    Created
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-300">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr
                    key={video.id}
                    className="border-b border-neutral-700/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {video.title}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {formatDuration(video.duration)}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {video.category ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {formatCreatedAt(video.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          video.published
                            ? "bg-green-900/40 text-green-200"
                            : "bg-neutral-700 text-neutral-300",
                        )}
                      >
                        {video.published ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            void router.push(`/admin/content/${video.id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={togglingId === video.id}
                          onClick={() =>
                            handleTogglePublish(video.id, video.published)
                          }
                        >
                          {video.published ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

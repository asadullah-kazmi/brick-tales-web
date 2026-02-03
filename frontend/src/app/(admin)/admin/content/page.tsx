"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminContent } from "@/contexts";
import { Button } from "@/components/ui";
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
  const { videos, updateVideo } = useAdminContent();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function handleTogglePublish(id: string, current: boolean) {
    setTogglingId(id);
    updateVideo(id, { published: !current });
    setTogglingId(null);
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Content
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Manage uploaded content. Toggle publish to show or hide in the
            catalog (mock).
          </p>
        </div>
        <Link href="/admin/content/upload">
          <Button type="button">Upload metadata</Button>
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="text-neutral-600 dark:text-neutral-400">
            No content yet. Upload video metadata to get started.
          </p>
          <Link href="/admin/content/upload" className="mt-4 inline-block">
            <Button type="button" variant="secondary">
              Upload metadata
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Duration
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Created
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr
                    key={video.id}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                      {video.title}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {formatDuration(video.duration)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {video.category ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {formatCreatedAt(video.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          video.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                            : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
                        )}
                      >
                        {video.published ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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

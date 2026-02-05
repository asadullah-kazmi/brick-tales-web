"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AdminVideo } from "@/types";
import { contentService } from "@/lib/services";
import { adminService, type AdminContentItemDto } from "@/lib/services";
import { USE_MOCK_API } from "@/lib/services/config";

type AdminContentContextValue = {
  videos: AdminVideo[];
  loading: boolean;
  error: string | null;
  addVideo: (metadata: {
    title: string;
    duration: string;
    description?: string;
    category?: string;
    videoFile: File;
    thumbnailFile: File;
  }) => Promise<void>;
  updateVideo: (
    id: string,
    updates: Partial<
      Pick<
        AdminVideo,
        "published" | "title" | "duration" | "description" | "category"
      >
    >,
  ) => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminContentContext = createContext<AdminContentContextValue | null>(
  null,
);

function mapContentToAdminVideo(item: AdminContentItemDto): AdminVideo {
  return {
    id: item.id,
    title: item.title,
    duration: item.duration,
    description: item.description,
    category: item.category,
    published: item.published,
    createdAt: item.createdAt,
  };
}

export function AdminContentProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (USE_MOCK_API) {
      setVideos(contentService.getAdminVideoList());
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await adminService.getContent();
      setVideos(list.map(mapContentToAdminVideo));
    } catch (err) {
      setVideos([]);
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addVideo = useCallback(
    async (metadata: {
      title: string;
      duration: string;
      description?: string;
      category?: string;
      videoFile: File;
      thumbnailFile: File;
    }) => {
      const { videoFile, thumbnailFile, ...rest } = metadata;

      if (USE_MOCK_API) {
        await contentService.createVideo(rest);
        await refresh();
        return;
      }

      const videoPresign = await adminService.presignUpload({
        kind: "video",
        fileName: videoFile.name,
        contentType: videoFile.type,
        sizeBytes: videoFile.size,
      });

      const thumbnailPresign = await adminService.presignUpload({
        kind: "thumbnail",
        fileName: thumbnailFile.name,
        contentType: thumbnailFile.type,
        sizeBytes: thumbnailFile.size,
        uploadId: videoPresign.uploadId,
      });

      await Promise.all([
        fetch(videoPresign.url, {
          method: "PUT",
          headers: { "Content-Type": videoFile.type },
          body: videoFile,
        }),
        fetch(thumbnailPresign.url, {
          method: "PUT",
          headers: { "Content-Type": thumbnailFile.type },
          body: thumbnailFile,
        }),
      ]).then(async (responses) => {
        const failed = responses.find((res) => !res.ok);
        if (failed) {
          const message = await failed.text();
          throw new Error(message || "Upload failed");
        }
      });

      await adminService.createVideo({
        ...rest,
        videoKey: videoPresign.key,
        thumbnailKey: thumbnailPresign.key,
      });
      await refresh();
    },
    [refresh],
  );

  const updateVideo = useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<
          AdminVideo,
          "published" | "title" | "duration" | "description" | "category"
        >
      >,
    ) => {
      if (USE_MOCK_API) {
        await contentService.updateVideo(id, updates);
        await refresh();
        return;
      }

      const updated = await adminService.updateVideo(id, updates);
      if (updated) {
        setVideos((prev) =>
          prev.map((v) => (v.id === id ? mapContentToAdminVideo(updated) : v)),
        );
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const value: AdminContentContextValue = {
    videos,
    loading,
    error,
    addVideo,
    updateVideo,
    refresh,
  };

  return (
    <AdminContentContext.Provider value={value}>
      {children}
    </AdminContentContext.Provider>
  );
}

export function useAdminContent(): AdminContentContextValue {
  const ctx = useContext(AdminContentContext);
  if (ctx === null) {
    throw new Error(
      "useAdminContent must be used within an AdminContentProvider",
    );
  }
  return ctx;
}

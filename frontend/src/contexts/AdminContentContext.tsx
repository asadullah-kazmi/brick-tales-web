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

type AdminContentContextValue = {
  videos: AdminVideo[];
  addVideo: (metadata: {
    title: string;
    duration: string;
    description?: string;
    category?: string;
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
  refresh: () => void;
};

const AdminContentContext = createContext<AdminContentContextValue | null>(
  null,
);

export function AdminContentProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<AdminVideo[]>([]);

  const refresh = useCallback(() => {
    setVideos(contentService.getAdminVideoList());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addVideo = useCallback(
    async (metadata: {
      title: string;
      duration: string;
      description?: string;
      category?: string;
    }) => {
      await contentService.createVideo(metadata);
      refresh();
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
      await contentService.updateVideo(id, updates);
      refresh();
    },
    [refresh],
  );

  const value: AdminContentContextValue = {
    videos,
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

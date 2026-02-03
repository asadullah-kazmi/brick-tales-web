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
import {
  getAdminVideos,
  createAdminVideo,
  updateAdminVideo as updateAdminVideoStorage,
} from "@/lib/mock-admin-content";

type AdminContentContextValue = {
  videos: AdminVideo[];
  addVideo: (metadata: {
    title: string;
    duration: string;
    description?: string;
    category?: string;
  }) => AdminVideo;
  updateVideo: (
    id: string,
    updates: Partial<
      Pick<
        AdminVideo,
        "published" | "title" | "duration" | "description" | "category"
      >
    >,
  ) => AdminVideo | null;
  refresh: () => void;
};

const AdminContentContext = createContext<AdminContentContextValue | null>(
  null,
);

export function AdminContentProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<AdminVideo[]>([]);

  const refresh = useCallback(() => {
    setVideos(getAdminVideos());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addVideo = useCallback(
    (metadata: {
      title: string;
      duration: string;
      description?: string;
      category?: string;
    }) => {
      const video = createAdminVideo(metadata);
      setVideos(getAdminVideos());
      return video;
    },
    [],
  );

  const updateVideo = useCallback(
    (
      id: string,
      updates: Partial<
        Pick<
          AdminVideo,
          "published" | "title" | "duration" | "description" | "category"
        >
      >,
    ) => {
      const updated = updateAdminVideoStorage(id, updates);
      setVideos(getAdminVideos());
      return updated;
    },
    [],
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

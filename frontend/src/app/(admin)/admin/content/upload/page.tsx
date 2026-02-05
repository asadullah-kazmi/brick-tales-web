"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "@/components/ui";
import { useAdminContent } from "@/contexts";

const CATEGORY_OPTIONS = [
  "Tutorial",
  "Technical",
  "Best Practices",
  "Architecture",
  "Infrastructure",
  "Analytics",
  "Security",
];

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/mkv"];
const THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_VIDEO_BYTES = 20 * 1024 * 1024 * 1024;
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function isValidDuration(value: string): boolean {
  return /^\d{1,2}:\d{2}(?::\d{2})?$/.test(value.trim());
}

export default function AdminUploadPage() {
  const router = useRouter();
  const { addVideo } = useAdminContent();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function runValidation(): boolean {
    if (!title.trim()) {
      setError("Title is required.");
      return false;
    }
    if (!duration.trim()) {
      setError("Duration is required (e.g. 12:34 or 1:22:10).");
      return false;
    }
    if (!isValidDuration(duration)) {
      setError("Duration must be MM:SS or HH:MM:SS.");
      return false;
    }
    if (!videoFile) {
      setError("Please select a video file.");
      return false;
    }
    if (!VIDEO_TYPES.includes(videoFile.type)) {
      setError("Video type must be MP4, WebM, or MKV.");
      return false;
    }
    if (videoFile.size > MAX_VIDEO_BYTES) {
      setError(`Video exceeds ${formatBytes(MAX_VIDEO_BYTES)}.`);
      return false;
    }
    if (!thumbnailFile) {
      setError("Please select a thumbnail image.");
      return false;
    }
    if (!THUMBNAIL_TYPES.includes(thumbnailFile.type)) {
      setError("Thumbnail must be JPEG, PNG, or WebP.");
      return false;
    }
    if (thumbnailFile.size > MAX_THUMBNAIL_BYTES) {
      setError(`Thumbnail exceeds ${formatBytes(MAX_THUMBNAIL_BYTES)}.`);
      return false;
    }
    setError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!runValidation()) return;
    if (!videoFile || !thumbnailFile) return;
    setSubmitting(true);
    try {
      await addVideo({
        title: title.trim(),
        duration: duration.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        videoFile,
        thumbnailFile,
      });
      setSuccess(true);
      setTitle("");
      setDuration("");
      setDescription("");
      setCategory("");
      setVideoFile(null);
      setThumbnailFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <h1 className="text-2xl font-semibold text-white">Upload video</h1>
        <Card className="mt-6 max-w-lg">
          <CardHeader>
            <CardTitle>Saved</CardTitle>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Your video and thumbnail have been uploaded.
            </p>
          </CardHeader>
          <CardFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSuccess(false);
                router.push("/admin/content");
              }}
            >
              View content list
            </Button>
            <Button type="button" onClick={() => setSuccess(false)}>
              Add another
            </Button>
          </CardFooter>
        </Card>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-white">Upload video</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Upload a video file and thumbnail, then add metadata.
      </p>
      <Card className="mt-6 max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Video upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}
            <Input
              label="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              required
            />
            <Input
              label="Duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 12:34 or 1:22:10"
              hint="Format: MM:SS or HH:MM:SS"
            />
            <div>
              <label
                htmlFor="video-file"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Video file
              </label>
              <input
                id="video-file"
                type="file"
                accept={VIDEO_TYPES.join(",")}
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-sm file:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:file:bg-neutral-700 dark:file:text-neutral-100"
              />
              <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                MP4, WebM, or MKV. Max {formatBytes(MAX_VIDEO_BYTES)}.
              </p>
            </div>
            <div>
              <label
                htmlFor="thumbnail-file"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Thumbnail image
              </label>
              <input
                id="thumbnail-file"
                type="file"
                accept={THUMBNAIL_TYPES.join(",")}
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-sm file:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:file:bg-neutral-700 dark:file:text-neutral-100"
              />
              <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                JPEG, PNG, or WebP. Max {formatBytes(MAX_THUMBNAIL_BYTES)}.
              </p>
            </div>
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-400"
                placeholder="Optional description"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Uploading…" : "Upload video"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/content")}
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}

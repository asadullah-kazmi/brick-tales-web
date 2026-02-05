"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Loader,
} from "@/components/ui";
import { adminService } from "@/lib/services";
import type { AdminCategoryDto } from "@/types/api";

function isValidDuration(value: string): boolean {
  return /^\d{1,2}:\d{2}(?::\d{2})?$/.test(value.trim());
}

function getCategoryOptions(list: AdminCategoryDto[]): AdminCategoryDto[] {
  const seen = new Set<string>();
  return list.filter((item) => {
    const name = item.name.trim();
    if (!name) return false;
    const key = name.toLowerCase();
    if (key === "uncategorized") return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function AdminEditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    let active = true;
    setLoading(true);
    setError(null);
    adminService
      .getContentItem(videoId)
      .then((item) => {
        if (!active) return;
        if (!item) {
          setError("Video not found.");
          return;
        }
        setTitle(item.title);
        setDuration(item.duration);
        setDescription(item.description ?? "");
        setCategory(item.category ?? "");
        setPublished(item.published);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load video.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [videoId]);

  useEffect(() => {
    let active = true;
    setCategoriesLoading(true);
    setCategoriesError(null);
    adminService
      .getCategories()
      .then((list) => {
        if (!active) return;
        setCategories(list);
      })
      .catch((err) => {
        if (!active) return;
        setCategories([]);
        setCategoriesError(
          err instanceof Error ? err.message : "Failed to load categories.",
        );
      })
      .finally(() => {
        if (!active) return;
        setCategoriesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
    setError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!videoId) return;
    if (!runValidation()) return;
    setSaving(true);
    try {
      await adminService.updateVideo(videoId, {
        title: title.trim(),
        duration: duration.trim(),
        description: description.trim() || "",
        category: category.trim(),
        published,
      });
      router.push("/admin/content");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update video.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12">
        <Loader size="lg" label="Loading video…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Edit video
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Update metadata and publishing status.
        </p>
      </header>

      <Card className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Video details</CardTitle>
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
                <option value="Uncategorized">Uncategorized</option>
                {getCategoryOptions(categories).map((opt) => (
                  <option key={opt.id} value={opt.name}>
                    {opt.name}
                  </option>
                ))}
              </select>
              {categoriesLoading ? (
                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Loading categories…
                </p>
              ) : categoriesError ? (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                  {categoriesError}
                </p>
              ) : categories.length === 0 ? (
                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  No categories yet. Create one in the Categories page.
                </p>
              ) : null}
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
            <div>
              <label
                htmlFor="published"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Status
              </label>
              <select
                id="published"
                value={published ? "published" : "unpublished"}
                onChange={(e) => setPublished(e.target.value === "published")}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/lib/services";
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

export default function AdminEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    adminService
      .getSitePage(slug)
      .then((page) => {
        if (!active) return;
        setTitle(page.title);
        setContent(page.content ?? "");
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load page.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setError(null);
    setSuccess(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const updated = await adminService.updateSitePage(slug, {
        title: title.trim(),
        content,
      });
      setTitle(updated.title);
      setContent(updated.content ?? "");
      setSuccess("Saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12">
        <Loader size="lg" label="Loading page…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Edit page
          </h1>
          <p className="mt-1 text-sm text-neutral-400">Slug: {slug}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/settings/pages")}
        >
          Back to pages
        </Button>
      </header>

      <Card className="max-w-3xl">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Page content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p
                className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300"
                role="alert"
              >
                {error}
              </p>
            )}
            {success && (
              <p
                className="rounded-lg bg-emerald-950/50 px-3 py-2 text-sm text-emerald-200"
                role="status"
              >
                {success}
              </p>
            )}
            <Input
              label="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div>
              <label
                htmlFor="page-content"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Content
              </label>
              <textarea
                id="page-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-400"
                placeholder="Write the page content here."
              />
              <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                Plain text supported. Line breaks will be preserved.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

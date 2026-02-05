"use client";

import { useEffect, useRef, useState } from "react";
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function toEditorHtml(value: string, treatAsHtml: boolean): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (treatAsHtml) return trimmed;
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function runCommand(command: string, value?: string): void {
  if (typeof document === "undefined") return;
  document.execCommand(command, false, value);
}

export default function AdminEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentIsHtml, setContentIsHtml] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    adminService
      .getSitePage(slug)
      .then((page) => {
        if (!active) return;
        setTitle(page.title);
        const nextContent = page.content ?? "";
        setContent(nextContent);
        setContentIsHtml(looksLikeHtml(nextContent));
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

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (isFocusedRef.current) return;
    const nextHtml = toEditorHtml(content, contentIsHtml);
    if (editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
  }, [content, contentIsHtml]);

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
              <div className="flex flex-wrap gap-2 rounded-t-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-xs text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200">
                <button
                  type="button"
                  className="rounded px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => runCommand("bold")}
                >
                  Bold
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => runCommand("italic")}
                >
                  Italic
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => runCommand("underline")}
                >
                  Underline
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => runCommand("insertUnorderedList")}
                >
                  Bullet list
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => runCommand("insertOrderedList")}
                >
                  Numbered list
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => {
                    const url = window.prompt("Enter a URL");
                    if (!url) return;
                    runCommand("createLink", url);
                  }}
                >
                  Link
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => runCommand("unlink")}
                >
                  Unlink
                </button>
              </div>
              <div
                id="page-content"
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => {
                  isFocusedRef.current = true;
                }}
                onBlur={() => {
                  isFocusedRef.current = false;
                }}
                onInput={() => {
                  const html = editorRef.current?.innerHTML ?? "";
                  setContent(html);
                  setContentIsHtml(true);
                }}
                className="min-h-[320px] w-full rounded-b-lg border border-t-0 border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
              />
              <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                Rich text supported. Formatting is saved to the public pages.
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

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

export default function AdminUploadPage() {
  const router = useRouter();
  const { addVideo } = useAdminContent();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function runValidation(): boolean {
    if (!title.trim()) {
      setError("Title is required.");
      return false;
    }
    if (!duration.trim()) {
      setError("Duration is required (e.g. 12:34 or 1:22:10).");
      return false;
    }
    setError(null);
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!runValidation()) return;

    addVideo({
      title: title.trim(),
      duration: duration.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
    });
    setSuccess(true);
    setTitle("");
    setDuration("");
    setDescription("");
    setCategory("");
  }

  if (success) {
    return (
      <>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Upload metadata
        </h1>
        <Card className="mt-6 max-w-lg">
          <CardHeader>
            <CardTitle>Saved</CardTitle>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Video metadata has been saved to mock storage. No file was
              uploaded.
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
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
        Upload metadata
      </h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Add video metadata only. File upload is not implemented yet.
      </p>
      <Card className="mt-6 max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Video metadata</CardTitle>
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
            <Button type="submit">Save metadata</Button>
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

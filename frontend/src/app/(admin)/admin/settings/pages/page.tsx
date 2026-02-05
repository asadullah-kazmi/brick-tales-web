"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/lib/services";
import type { SitePageSummaryDto } from "@/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Loader,
} from "@/components/ui";

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<SitePageSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminService
      .getSitePages()
      .then((data) => {
        if (!active) return;
        setPages(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load pages.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Legal pages
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Update the content shown on your public legal pages.
          </p>
        </div>
        <Link href="/admin/settings">
          <Button variant="outline">Back to settings</Button>
        </Link>
      </header>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12">
          <Loader size="lg" label="Loading pages…" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-8 text-red-300">
          {error}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pages.map((page) => (
            <Card
              key={page.slug}
              className="border-neutral-700/60 bg-neutral-900/50"
            >
              <CardHeader>
                <CardTitle>{page.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-neutral-400">
                <span>
                  Last updated: {new Date(page.updatedAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/admin/settings/pages/${page.slug}`}
                  className="text-accent"
                >
                  Edit
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

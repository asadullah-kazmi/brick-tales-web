"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { adminService } from "@/lib/services";
import { parseBranding, type ThemeSettings } from "@/lib/branding";
import { ApiError } from "@/lib/api-client";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Loader,
} from "@/components/ui";

export default function AdminBrandingPage() {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [theme, setTheme] = useState<ThemeSettings>({
    background: "#0c0c0c",
    foreground: "#fafafa",
    offBlack: "#0c0c0c",
    accent: "#ffe700",
    accentForeground: "#0c0c0c",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    adminService
      .getSitePage("branding")
      .then((page) => {
        if (!active) return;
        const branding = parseBranding(page?.content ?? "");
        setLogoUrl(branding.logoUrl ?? "");
        setBannerUrl(branding.bannerUrl ?? "");
        setLogoPreview(branding.logoUrl ?? null);
        setBannerPreview(branding.bannerUrl ?? null);
        setTheme((prev) => ({
          ...prev,
          ...(branding.theme ?? {}),
        }));
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setLogoUrl("");
          setBannerUrl("");
          setLogoPreview(null);
          setBannerPreview(null);
          setTheme((prev) => ({ ...prev }));
          setError(null);
          return;
        }
        setError(
          err instanceof Error ? err.message : "Failed to load branding.",
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const canPreviewLogo = useMemo(
    () => (logoPreview ?? logoUrl).trim().length > 0,
    [logoPreview, logoUrl],
  );
  const canPreviewBanner = useMemo(
    () => (bannerPreview ?? bannerUrl).trim().length > 0,
    [bannerPreview, bannerUrl],
  );

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!bannerFile) return;
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  async function uploadAsset(file: File): Promise<string> {
    const presign = await adminService.presignUpload({
      kind: "thumbnail",
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });
    await fetch(presign.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    }).then(async (res) => {
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Upload failed");
      }
    });
    return presign.publicUrl || presign.key;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      let nextLogoUrl = logoUrl.trim();
      let nextBannerUrl = bannerUrl.trim();

      if (logoFile) {
        nextLogoUrl = await uploadAsset(logoFile);
      }
      if (bannerFile) {
        nextBannerUrl = await uploadAsset(bannerFile);
      }

      const content = JSON.stringify({
        logoUrl: nextLogoUrl || undefined,
        bannerUrl: nextBannerUrl || undefined,
        theme,
      });
      await adminService.updateSitePage("branding", {
        title: "Branding",
        content,
      });
      setLogoUrl(nextLogoUrl);
      setBannerUrl(nextBannerUrl);
      setLogoFile(null);
      setBannerFile(null);
      setSuccess("Branding updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save branding.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12">
        <Loader size="lg" label="Loading branding…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Branding
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Set the logo and hero banner image for the site.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/settings")}
        >
          Back to settings
        </Button>
      </header>

      <Card className="max-w-3xl">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Brand assets</CardTitle>
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Logo file
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-sm file:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:file:bg-neutral-700 dark:file:text-neutral-100"
              />
            </div>
            {canPreviewLogo ? (
              <div className="rounded-lg border border-neutral-700/60 bg-neutral-900/60 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Logo preview
                </p>
                <Image
                  src={logoPreview ?? logoUrl}
                  alt="Logo preview"
                  width={160}
                  height={48}
                  className="mt-3 h-12 w-auto object-contain"
                  unoptimized
                />
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Landing page banner file
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-sm file:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:file:bg-neutral-700 dark:file:text-neutral-100"
              />
            </div>
            {canPreviewBanner ? (
              <div className="rounded-lg border border-neutral-700/60 bg-neutral-900/60 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Banner preview
                </p>
                <Image
                  src={bannerPreview ?? bannerUrl}
                  alt="Banner preview"
                  width={1200}
                  height={400}
                  className="mt-3 h-28 w-full rounded-md object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <p className="text-xs text-neutral-500">
              Tip: PNG, JPG, WebP (and SVG for logo). These images are used
              across the site.
            </p>
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-white">Color scheme</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Update the global theme colors used across the site UI.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  { key: "background", label: "Background" },
                  { key: "foreground", label: "Foreground" },
                  { key: "offBlack", label: "Off-black" },
                  { key: "accent", label: "Accent" },
                  { key: "accentForeground", label: "Accent foreground" },
                ] as const
              ).map((item) => (
                <div key={item.key} className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    {item.label}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme[item.key] ?? "#000000"}
                      onChange={(e) =>
                        setTheme((prev) => ({
                          ...prev,
                          [item.key]: e.target.value,
                        }))
                      }
                      className="h-10 w-12 rounded border border-neutral-700 bg-neutral-900"
                      aria-label={`${item.label} color`}
                    />
                    <input
                      type="text"
                      value={theme[item.key] ?? ""}
                      onChange={(e) =>
                        setTheme((prev) => ({
                          ...prev,
                          [item.key]: e.target.value,
                        }))
                      }
                      className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-neutral-700/60 bg-neutral-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Preview
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <div
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: theme.background,
                    color: theme.foreground,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Background
                </div>
                <div
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: theme.offBlack,
                    color: theme.foreground,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Off-black
                </div>
                <div
                  className="rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{
                    background: theme.accent,
                    color: theme.accentForeground,
                  }}
                >
                  Accent
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save branding"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

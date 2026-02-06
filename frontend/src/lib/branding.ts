import { siteService } from "@/lib/services";

export type BrandingSettings = {
  logoUrl?: string;
  bannerUrl?: string;
  theme?: ThemeSettings;
};

export type ThemeSettings = {
  background?: string;
  foreground?: string;
  accent?: string;
  accentForeground?: string;
  offBlack?: string;
};

function normalizeColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return undefined;
  return trimmed.toLowerCase();
}

export function parseBranding(content?: string | null): BrandingSettings {
  if (!content) return {};
  try {
    const data = JSON.parse(content) as BrandingSettings & {
      theme?: ThemeSettings;
    };
    const theme: ThemeSettings = {
      background: normalizeColor(data.theme?.background),
      foreground: normalizeColor(data.theme?.foreground),
      accent: normalizeColor(data.theme?.accent),
      accentForeground: normalizeColor(data.theme?.accentForeground),
      offBlack: normalizeColor(data.theme?.offBlack),
    };
    const hasTheme = Object.values(theme).some(Boolean);
    return {
      logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : undefined,
      bannerUrl:
        typeof data.bannerUrl === "string" ? data.bannerUrl : undefined,
      theme: hasTheme ? theme : undefined,
    };
  } catch {
    return {};
  }
}

export async function fetchBranding(): Promise<BrandingSettings> {
  const page = await siteService.getPage("branding");
  return parseBranding(page?.content ?? "");
}

import { get } from "@/lib/api-client";
import type { SitePageDto } from "@/types/api";

export const siteService = {
  async getPage(slug: string): Promise<SitePageDto | null> {
    try {
      return await get<SitePageDto>(`site/pages/${slug}`);
    } catch {
      return null;
    }
  },
};

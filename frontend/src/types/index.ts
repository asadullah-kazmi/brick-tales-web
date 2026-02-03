/**
 * Shared TypeScript types for the streaming platform.
 */

export type UserRole = "user" | "admin";

export type User = {
  email: string;
  name: string;
  /** Mocked role. Admin users can access /admin. */
  role?: UserRole;
};

export type Video = {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string | null;
  description?: string;
  category?: string;
  /** ISO date string for display (e.g. "2024-01-15"). */
  publishedAt?: string;
};

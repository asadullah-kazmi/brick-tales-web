export interface AdminSystemHealthDto {
  ok: boolean;
  database: boolean;
  checkedAt: string;
  counts: {
    users: number;
    videos: number;
    subscriptions: number;
    downloads: number;
  };
  error?: string;
}

export interface AdminSystemLogDto {
  id: string;
  type: 'user' | 'video' | 'subscription';
  message: string;
  createdAt: string;
}

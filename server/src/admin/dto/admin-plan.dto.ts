export interface AdminPlanDto {
  id: string;
  name: string;
  price: string;
  duration: string;
  deviceLimit: number;
  offlineAllowed: boolean;
  maxOfflineDownloads: number;
  stripePriceId?: string;
  activeSubscribers: number;
  createdAt: string;
  updatedAt: string;
}

export interface OperationsSettings {
  schemaVersion: 1;
  defaultLowStockThreshold: number;
  leadTimeDays: number;
  safetyStockDays: number;
  deadStockDays: number;
  hideUntrackedByDefault: boolean;
  productThresholds: Record<string, number>;
  alerts: { emailEnabled: boolean; whatsappEnabled: boolean };
  updatedAt: string | null;
}

export interface SnapshotRun {
  schemaVersion: 1;
  id: string;
  source: "cron" | "manual";
  status: "success" | "failure";
  startedAt: string;
  completedAt: string;
  snapshotDate: string | null;
  totalInventory: number | null;
  totalProducts: number | null;
  message: string;
  alertResults?: AlertDeliveryResult[];
}

export interface AlertDeliveryResult {
  channel: "email" | "whatsapp";
  status: "sent" | "skipped" | "failed";
  message: string;
}

export interface InventoryInsight {
  productId: string;
  inventoryItemId: string;
  locationId: string;
  productTitle: string;
  variantTitle: string;
  sku: string | null;
  locationName: string;
  imageUrl: string | null;
  currentStock: number;
  averageDailySales: number;
  daysUntilStockout: number | null;
  reorderQuantity: number;
  daysWithoutMovement: number;
  inventoryAgeDays: number | null;
  deadStock: boolean;
  historyDays: number;
}

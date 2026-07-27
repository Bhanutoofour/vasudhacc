export type InventoryStatus =
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "stock-increased"
  | "stock-reduced";

export interface InventoryRecord {
  productId: string;
  variantId: string;
  inventoryItemId: string;
  locationId: string;
  productTitle: string;
  variantTitle: string;
  sku: string | null;
  imageUrl: string | null;
  locationName: string;
  dayBeforeYesterday: number;
  yesterday: number;
  today: number;
}

export interface InventoryComparison extends InventoryRecord {
  todayChange: number;
  yesterdayChange: number;
  threeDayChange: number;
  percentageChange: number | null;
  status: InventoryStatus;
}

export interface DailyTotal {
  label: string;
  date: string;
  inventory: number;
}

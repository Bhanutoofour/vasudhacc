import type { DailyTotal, InventoryComparison } from "@/types/inventory";
import type { CurrentInventoryResult } from "@/types/shopify";

export interface InventorySnapshotDocument {
  schemaVersion: 1;
  snapshotDate: string;
  capturedAt: string;
  inventory: CurrentInventoryResult;
}

export interface InventorySnapshotDescriptor {
  pathname: string;
  uploadedAt: string;
  snapshotDate: string;
}

export interface InventoryHistoryResult {
  availableSnapshots: number;
  snapshots: InventorySnapshotDescriptor[];
  dailyTotals: DailyTotal[];
  items: InventoryComparison[];
}

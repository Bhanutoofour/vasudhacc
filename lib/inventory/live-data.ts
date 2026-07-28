import "server-only";
import { compareInventory } from "@/lib/comparison/inventory";
import { readLatestInventoryHistory } from "@/services/inventory-snapshots";
import { fetchCurrentInventory } from "@/services/shopify-inventory";
import { dailyTotals as mockDailyTotals, dashboardSummary as mockDashboardSummary, mockInventory } from "@/lib/mock/inventory";
import type { DailyTotal, InventoryComparison } from "@/types/inventory";
import type { CurrentInventoryItem, CurrentInventoryResult } from "@/types/shopify";

export interface InventoryFeed {
  source: "live" | "mock";
  mode: "snapshot" | "current" | "mock";
  availableSnapshots: number;
  latestSnapshotDate: string | null;
  dailyTotals: DailyTotal[];
  items: InventoryComparison[];
  summary: {
    today: number;
    yesterday: number;
    dayBeforeYesterday: number;
    products: number;
    variants: number;
    locations: number;
    lowStock: number;
    outOfStock: number;
  };
}

function buildSummary(items: InventoryComparison[]) {
  const latest = items.reduce(
    (acc, item) => ({
      today: acc.today + item.today,
      yesterday: acc.yesterday + item.yesterday,
      dayBeforeYesterday: acc.dayBeforeYesterday + item.dayBeforeYesterday,
      products: acc.products.add(item.productId),
      variants: acc.variants.add(item.variantId),
      lowStock: acc.lowStock + (item.today > 0 && item.today <= 20 ? 1 : 0),
      outOfStock: acc.outOfStock + (item.today <= 0 ? 1 : 0),
    }),
    {
      today: 0,
      yesterday: 0,
      dayBeforeYesterday: 0,
      products: new Set<string>(),
      variants: new Set<string>(),
      lowStock: 0,
      outOfStock: 0,
    },
  );

  return {
    today: latest.today,
    yesterday: latest.yesterday,
    dayBeforeYesterday: latest.dayBeforeYesterday,
    products: latest.products.size,
    variants: latest.variants.size,
    locations: new Set(items.map((item) => item.locationId)).size,
    lowStock: latest.lowStock,
    outOfStock: latest.outOfStock,
  };
}

function formatKolkataDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) return date.toISOString().slice(0, 10);
  return `${year}-${month}-${day}`;
}

function buildCurrentComparison(items: CurrentInventoryItem[]): InventoryComparison[] {
  return items.map((item) =>
    compareInventory({
      productId: item.productId,
      variantId: item.variantId,
      inventoryItemId: item.inventoryItemId,
      locationId: item.locationId,
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      sku: item.sku,
      imageUrl: item.imageUrl,
      locationName: item.locationName,
      dayBeforeYesterday: item.available,
      yesterday: item.available,
      today: item.available,
    }),
  );
}

function buildCurrentDailyTotals(current: CurrentInventoryResult): DailyTotal[] {
  return [{ label: "Current", date: formatKolkataDateKey(new Date(current.capturedAt)), inventory: current.summary.totalInventory }];
}

function buildMockFallbackFeed(availableSnapshots: number, latestSnapshotDate: string | null): InventoryFeed {
  return {
    source: "mock",
    mode: "mock",
    availableSnapshots,
    latestSnapshotDate,
    dailyTotals: mockDailyTotals,
    items: mockInventory,
    summary: mockDashboardSummary,
  };
}

export async function getInventoryFeed(): Promise<InventoryFeed> {
  const history = await readLatestInventoryHistory();
  if (history.availableSnapshots >= 3) {
    return {
      source: "live",
      mode: "snapshot",
      availableSnapshots: history.availableSnapshots,
      latestSnapshotDate: history.dailyTotals.at(-1)?.date ?? null,
      dailyTotals: history.dailyTotals,
      items: history.items,
      summary: buildSummary(history.items),
    };
  }

  try {
    const current = await fetchCurrentInventory();
    const items = buildCurrentComparison(current.items);
    return {
      source: "live",
      mode: "current",
      availableSnapshots: history.availableSnapshots,
      latestSnapshotDate: history.dailyTotals.at(-1)?.date ?? formatKolkataDateKey(new Date(current.capturedAt)),
      dailyTotals: buildCurrentDailyTotals(current),
      items,
      summary: buildSummary(items),
    };
  } catch {
    return buildMockFallbackFeed(history.availableSnapshots, history.dailyTotals.at(-1)?.date ?? null);
  }
}

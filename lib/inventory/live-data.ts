import "server-only";
import { readLatestInventoryHistory } from "@/services/inventory-snapshots";
import { dailyTotals as mockDailyTotals, dashboardSummary as mockDashboardSummary, mockInventory } from "@/lib/mock/inventory";
import type { DailyTotal, InventoryComparison } from "@/types/inventory";

export interface InventoryFeed {
  source: "live" | "mock";
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
    lowStock: latest.lowStock,
    outOfStock: latest.outOfStock,
  };
}

function buildMockFallbackFeed(availableSnapshots: number, latestSnapshotDate: string | null): InventoryFeed {
  return {
    source: "mock",
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
      availableSnapshots: history.availableSnapshots,
      latestSnapshotDate: history.dailyTotals.at(-1)?.date ?? null,
      dailyTotals: history.dailyTotals,
      items: history.items,
      summary: buildSummary(history.items),
    };
  }

  return buildMockFallbackFeed(history.availableSnapshots, history.dailyTotals.at(-1)?.date ?? null);
}

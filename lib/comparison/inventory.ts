import { LOW_STOCK_THRESHOLD } from "@/lib/constants/inventory";
import type { InventoryComparison, InventoryRecord, InventoryStatus } from "@/types/inventory";

function getStatus(item: InventoryRecord): InventoryStatus {
  if (item.today <= 0) return "out-of-stock";
  if (item.today <= LOW_STOCK_THRESHOLD) return "low-stock";
  if (item.today > item.yesterday) return "stock-increased";
  if (item.today < item.yesterday) return "stock-reduced";
  return "in-stock";
}

export function compareInventory(item: InventoryRecord): InventoryComparison {
  const threeDayChange = item.today - item.dayBeforeYesterday;
  return {
    ...item,
    todayChange: item.today - item.yesterday,
    yesterdayChange: item.yesterday - item.dayBeforeYesterday,
    threeDayChange,
    percentageChange:
      item.dayBeforeYesterday === 0 ? null : (threeDayChange / item.dayBeforeYesterday) * 100,
    status: getStatus(item),
  };
}

export function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

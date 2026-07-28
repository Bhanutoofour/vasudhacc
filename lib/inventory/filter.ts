import type { InventoryComparison, InventoryStatus } from "@/types/inventory";

export interface InventoryFilterState {
  query: string;
  status: "all" | InventoryStatus;
  location: string;
}

export function filterInventoryItems(items: InventoryComparison[], filters: InventoryFilterState): InventoryComparison[] {
  const query = filters.query.trim().toLowerCase();
  return items.filter((item) =>
    (!query || `${item.productTitle} ${item.variantTitle} ${item.sku ?? ""}`.toLowerCase().includes(query)) &&
    (filters.status === "all" || item.status === filters.status) &&
    (filters.location === "all" || item.locationName === filters.location),
  );
}

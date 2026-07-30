import type { InventoryComparison, InventoryStatus } from "@/types/inventory";

export interface InventoryFilterState {
  query: string;
  status: "all" | InventoryStatus;
  location: string;
  productStatus?: "all" | "ACTIVE" | "DRAFT" | "ARCHIVED" | "UNLISTED";
  tracked?: "all" | "tracked" | "untracked";
}

export function filterInventoryItems(items: InventoryComparison[], filters: InventoryFilterState): InventoryComparison[] {
  const query = filters.query.trim().toLowerCase();
  return items.filter((item) =>
    (!query || `${item.productTitle} ${item.variantTitle} ${item.sku ?? ""}`.toLowerCase().includes(query)) &&
    (filters.status === "all" || item.status === filters.status) &&
    (filters.location === "all" || item.locationName === filters.location) &&
    (!filters.productStatus || filters.productStatus === "all" || item.productStatus === filters.productStatus) &&
    (!filters.tracked || filters.tracked === "all" || (filters.tracked === "tracked" ? item.tracked !== false : item.tracked === false)),
  );
}

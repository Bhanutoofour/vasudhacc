import type { InventoryComparison } from "@/types/inventory";

function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function formatCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  return escapeCsv(typeof value === "string" ? value : String(value));
}

export function buildInventoryCsv(items: InventoryComparison[]): string {
  const header = [
    "productId",
    "variantId",
    "inventoryItemId",
    "locationId",
    "productTitle",
    "variantTitle",
    "sku",
    "imageUrl",
    "locationName",
    "dayBeforeYesterday",
    "yesterday",
    "today",
    "todayChange",
    "threeDayChange",
    "status",
  ];

  const rows = items
    .slice()
    .sort((left, right) =>
      left.productTitle.localeCompare(right.productTitle) ||
      left.locationName.localeCompare(right.locationName) ||
      left.variantTitle.localeCompare(right.variantTitle) ||
      left.inventoryItemId.localeCompare(right.inventoryItemId),
    )
    .map((item) => [
      item.productId,
      item.variantId,
      item.inventoryItemId,
      item.locationId,
      item.productTitle,
      item.variantTitle,
      item.sku,
      item.imageUrl,
      item.locationName,
      item.dayBeforeYesterday,
      item.yesterday,
      item.today,
      item.todayChange,
      item.threeDayChange,
      item.status,
    ].map(formatCell).join(","));

  return ["\ufeff" + header.join(","), ...rows].join("\r\n");
}

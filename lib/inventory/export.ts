import type { InventoryComparison } from "@/types/inventory";
import type { InventoryFeed } from "@/lib/inventory/live-data";

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

export function buildInventoryJson(feed: Pick<InventoryFeed, "source" | "availableSnapshots" | "latestSnapshotDate" | "summary">, items: InventoryComparison[]): string {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    exportType: "inventory-comparison",
    source: feed.source,
    availableSnapshots: feed.availableSnapshots,
    latestSnapshotDate: feed.latestSnapshotDate,
    summary: feed.summary,
    items: items
      .slice()
      .sort((left, right) =>
        left.productTitle.localeCompare(right.productTitle) ||
        left.locationName.localeCompare(right.locationName) ||
        left.variantTitle.localeCompare(right.variantTitle) ||
        left.inventoryItemId.localeCompare(right.inventoryItemId),
      ),
  };

  return JSON.stringify(payload, null, 2);
}

function escapeXml(value: string): string { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

export function buildInventoryExcel(items: InventoryComparison[]): string {
  const columns = ["Product", "Variant", "SKU", "Location", "Lifecycle", "Tracked", "Day before", "Yesterday", "Today", "Today change", "3-day change", "Status"];
  const rows = items.map((item) => [item.productTitle, item.variantTitle, item.sku ?? "", item.locationName, item.productStatus ?? "", item.tracked === false ? "No" : "Yes", item.dayBeforeYesterday, item.yesterday, item.today, item.todayChange, item.threeDayChange, item.status]);
  const rowXml = [columns, ...rows].map((row) => `<Row>${row.map((cell) => typeof cell === "number" ? `<Cell><Data ss:Type="Number">${cell}</Data></Cell>` : `<Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>`).join("")}</Row>`).join("");
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Inventory"><Table>${rowXml}</Table></Worksheet></Workbook>`;
}

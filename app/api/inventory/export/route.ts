import { getInventoryFeed } from "@/lib/inventory/live-data";
import { buildInventoryCsv } from "@/lib/inventory/export";
import { filterInventoryItems } from "@/lib/inventory/filter";
import type { InventoryStatus } from "@/types/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function filenameForFeed(source: "live" | "mock", latestSnapshotDate: string | null): string {
  if (source === "live" && latestSnapshotDate) return `inventory-${latestSnapshotDate}.csv`;
  return "inventory-mock.csv";
}

function parseStatus(value: string | null): "all" | InventoryStatus {
  if (value === "in-stock" || value === "low-stock" || value === "out-of-stock" || value === "stock-increased" || value === "stock-reduced") return value;
  return "all";
}

export async function GET(request: Request) {
  const feed = await getInventoryFeed();
  const url = new URL(request.url);
  const csv = buildInventoryCsv(filterInventoryItems(feed.items, {
    query: url.searchParams.get("query") ?? "",
    status: parseStatus(url.searchParams.get("status")),
    location: url.searchParams.get("location") ?? "all",
  }));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameForFeed(feed.source, feed.latestSnapshotDate)}"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

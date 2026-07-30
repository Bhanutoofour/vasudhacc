import { getInventoryFeed } from "@/lib/inventory/live-data";
import { buildInventoryCsv, buildInventoryJson } from "@/lib/inventory/export";
import { filterInventoryItems } from "@/lib/inventory/filter";
import { getDashboardSession } from "@/lib/auth/authorization";
import type { InventoryStatus } from "@/types/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function filenameForFeed(source: "live" | "error", inventoryDate: string, extension: "csv" | "json"): string {
  return source === "error" ? `inventory-error.${extension}` : `inventory-${inventoryDate}.${extension}`;
}

function parseStatus(value: string | null): "all" | InventoryStatus {
  if (value === "in-stock" || value === "low-stock" || value === "out-of-stock" || value === "stock-increased" || value === "stock-reduced") return value;
  return "all";
}

export async function GET(request: Request) {
  if (!await getDashboardSession()) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication is required." } }, { status: 401 });
  }
  const feed = await getInventoryFeed();
  const url = new URL(request.url);
  const items = filterInventoryItems(feed.items, {
    query: url.searchParams.get("query") ?? "",
    status: parseStatus(url.searchParams.get("status")),
    location: url.searchParams.get("location") ?? "all",
  });
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const body = format === "json" ? buildInventoryJson(feed, items) : buildInventoryCsv(items);
  return new Response(body, {
    headers: {
      "Content-Type": format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameForFeed(feed.source, feed.inventoryDates.today, format)}"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

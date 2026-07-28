import { getInventoryFeed } from "@/lib/inventory/live-data";
import { buildInventoryCsv } from "@/lib/inventory/export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function filenameForFeed(source: "live" | "mock", latestSnapshotDate: string | null): string {
  if (source === "live" && latestSnapshotDate) return `inventory-${latestSnapshotDate}.csv`;
  return "inventory-mock.csv";
}

export async function GET() {
  const feed = await getInventoryFeed();
  const csv = buildInventoryCsv(feed.items);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameForFeed(feed.source, feed.latestSnapshotDate)}"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

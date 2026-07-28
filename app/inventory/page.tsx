import { getInventoryFeed } from "@/lib/inventory/live-data";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { SnapshotStatusStrip } from "@/components/inventory/snapshot-status-strip";
import { connection } from "next/server";
export default async function InventoryPage() {
  await connection();
  const feed = await getInventoryFeed();
  return <div className="space-y-6"><div><p className="text-xs font-medium text-[#2d725f]">Inventory</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{feed.mode === "snapshot" ? "Inventory intelligence" : feed.mode === "current" ? "Live inventory intelligence" : "Inventory unavailable"}</h1><p className="mt-1 text-sm text-slate-500">{feed.mode === "snapshot" ? "Compare stock across three daily snapshots and locations." : feed.mode === "current" ? "Inspect the current Shopify inventory while history snapshots warm up." : "We could not load Shopify inventory, so the table is intentionally empty."}</p></div><SnapshotStatusStrip feed={feed}/><InventoryTable items={feed.items} feed={feed}/></div>;
}

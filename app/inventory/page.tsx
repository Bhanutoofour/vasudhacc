import { getInventoryFeed } from "@/lib/inventory/live-data";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { SnapshotStatusStrip } from "@/components/inventory/snapshot-status-strip";
import { connection } from "next/server";
export default async function InventoryPage() {
  await connection();
  const feed = await getInventoryFeed();
  return <div className="space-y-6"><div><p className="text-xs font-medium text-[#2d725f]">Inventory</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Inventory intelligence</h1><p className="mt-1 text-sm text-slate-500">Compare stock across three daily snapshots and locations.</p></div><SnapshotStatusStrip feed={feed}/><InventoryTable items={feed.items} feed={feed}/></div>;
}

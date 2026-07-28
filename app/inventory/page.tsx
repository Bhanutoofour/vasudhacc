import { getInventoryFeed } from "@/lib/inventory/live-data";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { Icon } from "@/components/ui/icon";
import { SnapshotStatusStrip } from "@/components/inventory/snapshot-status-strip";
import { connection } from "next/server";
export default async function InventoryPage() {
  await connection();
  const feed = await getInventoryFeed();
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium text-[#2d725f]">Inventory</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Inventory intelligence</h1><p className="mt-1 text-sm text-slate-500">Compare stock across three daily snapshots and locations.</p></div><a href="/api/inventory/export" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"><Icon name="download" className="size-4"/>Export CSV</a></div><SnapshotStatusStrip feed={feed}/><InventoryTable items={feed.items}/></div>;
}

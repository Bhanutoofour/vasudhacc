import { getInventoryFeed } from "@/lib/inventory/live-data";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { Icon } from "@/components/ui/icon";
import { connection } from "next/server";
export default async function InventoryPage() {
  await connection();
  const feed = await getInventoryFeed();
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium text-[#2d725f]">Inventory</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Inventory intelligence</h1><p className="mt-1 text-sm text-slate-500">Compare stock across three daily snapshots and locations.</p></div><button className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"><Icon name="download" className="size-4"/>Export inventory</button></div><div className={`rounded-lg px-4 py-3 text-xs ${feed.source === "live" ? "border border-emerald-100 bg-emerald-50/70 text-emerald-800" : "border border-blue-100 bg-blue-50/60 text-blue-700"}`}><strong>{feed.source === "live" ? "Live Blob data:" : "Mock fallback:"}</strong> {feed.source === "live" ? `showing the latest ${feed.availableSnapshots} snapshots from Vercel Blob.` : "waiting for at least three snapshots before switching the table over."}</div><InventoryTable items={feed.items}/></div>;
}

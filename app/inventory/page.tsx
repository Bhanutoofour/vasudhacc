import { getInventoryFeed } from "@/lib/inventory/live-data";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { SnapshotStatusStrip } from "@/components/inventory/snapshot-status-strip";
import { connection } from "next/server";
import { requireDashboardSession } from "@/lib/auth/authorization";
import { SnapshotControls } from "@/components/inventory/snapshot-controls";
import { readSnapshotRuns, readOperationsSettings } from "@/services/operations-store";
export default async function InventoryPage() {
  await requireDashboardSession();
  await connection();
  const [feed, runs, settings] = await Promise.all([getInventoryFeed(), readSnapshotRuns(10), readOperationsSettings()]);
  return <div className="space-y-6"><div><p className="text-xs font-medium text-[#2d725f]">Inventory</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{feed.mode === "snapshot" ? "Inventory snapshot fallback" : feed.mode === "current" ? "Live inventory intelligence" : "Inventory unavailable"}</h1><p className="mt-1 text-sm text-slate-500">{feed.mode === "snapshot" ? "Shopify is temporarily unavailable, so the latest saved inventory is shown." : feed.mode === "current" ? "Today is live from Shopify; prior columns use their exact dated snapshots." : "We could not load Shopify inventory, so the table is intentionally empty."}</p></div><SnapshotStatusStrip feed={feed}/><SnapshotControls today={feed.inventoryDates.today} latestSnapshotDate={feed.latestSnapshotDate} runs={runs}/><InventoryTable items={feed.items} feed={feed} hideUntrackedByDefault={settings.hideUntrackedByDefault}/></div>;
}

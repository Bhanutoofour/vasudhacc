import { InventoryTrendChart } from "@/components/charts/inventory-trend-chart";
import { MovementList } from "@/components/dashboard/movement-list";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Icon } from "@/components/ui/icon";
import { SnapshotStatusStrip } from "@/components/inventory/snapshot-status-strip";
import { getInventoryFeed } from "@/lib/inventory/live-data";
import { formatQuantity } from "@/lib/comparison/inventory";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  const feed = await getInventoryFeed();
  const change = feed.summary.today - feed.summary.yesterday;
  const reductions = [...feed.items].filter((item) => item.todayChange < 0).sort((a,b) => a.todayChange - b.todayChange).slice(0, 4);
  const additions = [...feed.items].filter((item) => item.todayChange > 0).sort((a,b) => b.todayChange - a.todayChange).slice(0, 4);
  const attention = feed.items.filter((item) => item.status === "low-stock" || item.status === "out-of-stock");
  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium text-[#2d725f]">Inventory overview</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Good morning, Vasudha</h1><p className="mt-1 text-sm text-slate-500">Here is how your inventory is performing today.</p></div></div>
    <SnapshotStatusStrip feed={feed}/>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Today's inventory" value={feed.summary.today} helper={`${change >= 0 ? "+" : ""}${change} units vs yesterday`} icon="box" tone={change >= 0 ? "positive" : "danger"}/><SummaryCard label="Yesterday's inventory" value={feed.summary.yesterday} helper={feed.dailyTotals[1]?.date ? `Snapshot · ${feed.dailyTotals[1].date}` : "Snapshot · unavailable"} icon="inventory"/><SummaryCard label="Day-before inventory" value={feed.summary.dayBeforeYesterday} helper={feed.dailyTotals[0]?.date ? `Snapshot · ${feed.dailyTotals[0].date}` : "Snapshot · unavailable"} icon="orders"/><SummaryCard label="Products requiring attention" value={attention.length} helper="Low or out of stock" icon="warning" tone="warning"/></section>
    <section className="grid gap-4 sm:grid-cols-3"><SummaryCard label="Total products" value={feed.summary.products} helper="Across all locations" icon="inventory"/><SummaryCard label="Low stock" value={feed.summary.lowStock} helper="At or below 20 units" icon="warning" tone="warning"/><SummaryCard label="Out of stock" value={feed.summary.outOfStock} helper="Immediate action required" icon="warning" tone="danger"/></section>
    <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]"><div className="rounded-xl border border-slate-200/80 bg-white p-5"><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold text-slate-800">Three-day inventory</h2><p className="mt-1 text-xs text-slate-400">Total available units across locations</p></div><div className={`rounded-md px-2 py-1 text-xs font-semibold ${change >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{change >= 0 ? "+" : ""}{change} today</div></div><div className="mt-4"><InventoryTrendChart data={feed.dailyTotals}/></div></div><div className="rounded-xl border border-slate-200/80 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-800">Products requiring attention</h2><p className="mt-1 text-[11px] text-slate-400">Prioritised by stock level</p></div><div className="divide-y divide-slate-100">{attention.map((item) => <div key={item.inventoryItemId} className="flex items-center gap-3 px-5 py-4"><div className={`grid size-9 place-items-center rounded-lg ${item.today <= 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}><Icon name="warning" className="size-4"/></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-700">{item.productTitle}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.locationName}</p></div><div className="text-right"><p className={`text-sm font-bold ${item.today <= 0 ? "text-red-600" : "text-amber-700"}`}>{formatQuantity(item.today)}</p><p className="text-[9px] uppercase text-slate-400">units</p></div></div>)}</div></div></section>
    <section className="grid gap-5 lg:grid-cols-2"><MovementList title="Top inventory reductions" items={reductions} positive={false}/><MovementList title="Top inventory additions" items={additions} positive/></section>
  </div>;
}

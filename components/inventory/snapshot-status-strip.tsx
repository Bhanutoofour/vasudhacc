import type { InventoryFeed } from "@/lib/inventory/live-data";

function buildStatusText(feed: InventoryFeed): string {
  if (feed.mode === "snapshot") {
    return `Live Shopify data · ${feed.availableSnapshots} snapshot${feed.availableSnapshots === 1 ? "" : "s"}`;
  }
  if (feed.mode === "current") {
    const remaining = Math.max(0, 3 - feed.availableSnapshots);
    return remaining > 0
      ? `Live Shopify current inventory · waiting for ${remaining} more snapshot${remaining === 1 ? "" : "s"}`
      : "Live Shopify current inventory";
  }
  const remaining = Math.max(0, 3 - feed.availableSnapshots);
  return remaining === 0 ? "Snapshot history unavailable" : `Waiting for ${remaining} more snapshot${remaining === 1 ? "" : "s"}`;
}

export function SnapshotStatusStrip({ feed }: { feed: InventoryFeed }) {
  const isLive = feed.mode !== "mock";
  const toneClasses = isLive
    ? "border-emerald-100 bg-emerald-50/80 text-emerald-900"
    : "border-amber-100 bg-amber-50/80 text-amber-950";
  const dotClasses = isLive ? "bg-emerald-500" : "bg-amber-500";

  return (
    <div className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${toneClasses}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 size-2 rounded-full ${dotClasses}`} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">{feed.mode === "snapshot" ? "Snapshot history" : feed.mode === "current" ? "Live Shopify" : "Snapshot fallback"}</p>
          <p className="mt-1 text-sm">
            {buildStatusText(feed)}
            {feed.mode === "snapshot" && feed.latestSnapshotDate ? ` · Latest snapshot ${feed.latestSnapshotDate}` : ""}
            {feed.mode === "current" && feed.latestSnapshotDate ? ` · Current day ${feed.latestSnapshotDate}` : ""}
          </p>
        </div>
      </div>
      <div className="text-xs font-medium opacity-80">
        {feed.mode === "snapshot"
          ? "Dashboard is reading Blob history"
          : feed.mode === "current"
            ? "Dashboard is reading live Shopify inventory while snapshots warm up"
            : "Dashboard is showing mock data because Shopify could not be reached"}
      </div>
    </div>
  );
}

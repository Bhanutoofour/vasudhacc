import type { InventoryFeed } from "@/lib/inventory/live-data";

function buildStatusText(feed: InventoryFeed): string {
  if (feed.source === "live") {
    return `Live Blob data · ${feed.availableSnapshots} snapshots`;
  }
  const remaining = Math.max(0, 3 - feed.availableSnapshots);
  return remaining === 0 ? "Mock fallback · snapshot history unavailable" : `Mock fallback · waiting for ${remaining} more snapshot${remaining === 1 ? "" : "s"}`;
}

export function SnapshotStatusStrip({ feed }: { feed: InventoryFeed }) {
  const isLive = feed.source === "live";
  const toneClasses = isLive
    ? "border-emerald-100 bg-emerald-50/80 text-emerald-900"
    : "border-amber-100 bg-amber-50/80 text-amber-950";
  const dotClasses = isLive ? "bg-emerald-500" : "bg-amber-500";

  return (
    <div className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${toneClasses}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 size-2 rounded-full ${dotClasses}`} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">{isLive ? "Live snapshots" : "Snapshot fallback"}</p>
          <p className="mt-1 text-sm">
            {buildStatusText(feed)}
            {feed.latestSnapshotDate ? ` · Latest snapshot ${feed.latestSnapshotDate}` : ""}
          </p>
        </div>
      </div>
      <div className="text-xs font-medium opacity-80">
        {isLive ? "Dashboard is reading Blob history" : "Dashboard is showing mock data until the third snapshot lands"}
      </div>
    </div>
  );
}

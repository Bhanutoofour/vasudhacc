import type { InventoryFeed } from "@/lib/inventory/live-data";

function formatCapturedAt(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function historyStatus(feed: InventoryFeed): string {
  const available = Number(feed.snapshotAvailability.yesterday) + Number(feed.snapshotAvailability.dayBeforeYesterday);
  if (available === 2) return "Yesterday and day-before snapshots are ready";
  if (available === 1) return "1 of 2 historical snapshots is ready";
  return "Waiting for the first 2 historical snapshots";
}

export function SnapshotStatusStrip({ feed }: { feed: InventoryFeed }) {
  const isError = feed.mode === "error";
  const isFallback = feed.mode === "snapshot";
  const toneClasses = isError
    ? "border-rose-100 bg-rose-50/80 text-rose-950"
    : isFallback
      ? "border-amber-100 bg-amber-50/80 text-amber-950"
      : "border-emerald-100 bg-emerald-50/80 text-emerald-900";
  const dotClasses = isError ? "bg-rose-500" : isFallback ? "bg-amber-500" : "bg-emerald-500";
  const capturedAt = formatCapturedAt(feed.liveCapturedAt);

  return (
    <div className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${toneClasses}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 size-2 rounded-full ${dotClasses}`} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">
            {isError ? "Shopify error" : isFallback ? "Snapshot fallback" : "Live Shopify"}
          </p>
          <p className="mt-1 text-sm">
            {isError
              ? feed.errorMessage ?? "Shopify inventory could not be loaded."
              : isFallback
                ? `Live Shopify is unavailable · latest saved snapshot ${feed.latestSnapshotDate ?? "unknown"}`
                : `Today is live · ${historyStatus(feed)}${capturedAt ? ` · updated ${capturedAt} IST` : ""}`}
          </p>
        </div>
      </div>
      <div className="text-xs font-medium opacity-80">
        {isError
          ? "No fake inventory is shown"
          : isFallback
            ? "Showing saved inventory until Shopify reconnects"
            : "Refreshing this page pulls current Shopify stock"}
      </div>
    </div>
  );
}

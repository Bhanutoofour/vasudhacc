"use client";

import { Icon } from "@/components/ui/icon";
import type { InventoryFeed } from "@/lib/inventory/live-data";

export function ExportControls({ feed, query, status, location }: {
  feed: InventoryFeed;
  query: string;
  status: string;
  location: string;
}) {
  function buildHref(format: "csv" | "json") {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (status !== "all") params.set("status", status);
    if (location !== "all") params.set("location", location);
    params.set("format", format);
    return `/api/inventory/export?${params.toString()}`;
  }

  const snapshotLabel =
    feed.mode === "snapshot"
      ? `Last snapshot: ${feed.latestSnapshotDate ?? "unknown"}`
      : feed.mode === "current"
        ? "Live Shopify inventory"
        : "Mock fallback";

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <a href={buildHref("csv")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">
          <Icon name="download" className="size-4" />
          Export CSV
        </a>
        <a href={buildHref("json")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">
          <Icon name="download" className="size-4" />
          Download JSON
        </a>
      </div>
      <p className="text-[11px] text-slate-400">{snapshotLabel}</p>
    </div>
  );
}

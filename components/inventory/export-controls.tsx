"use client";

import { Icon } from "@/components/ui/icon";
import type { InventoryFeed } from "@/lib/inventory/live-data";

export function ExportControls({ feed, query, status, location, productStatus, tracked }: {
  feed: InventoryFeed;
  query: string;
  status: string;
  location: string;
  productStatus: string;
  tracked: string;
}) {
  function buildHref(format: "csv" | "json" | "xls") {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (status !== "all") params.set("status", status);
    if (location !== "all") params.set("location", location);
    if (productStatus !== "all") params.set("productStatus", productStatus);
    if (tracked !== "all") params.set("tracked", tracked);
    params.set("format", format);
    return `/api/inventory/export?${params.toString()}`;
  }

  const snapshotLabel =
    feed.mode === "snapshot"
      ? `Last snapshot: ${feed.latestSnapshotDate ?? "unknown"}`
      : feed.mode === "current"
        ? "Live Shopify inventory"
        : feed.errorMessage
          ? feed.errorMessage
          : "Shopify inventory unavailable";

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
        <a href={buildHref("xls")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"><Icon name="download" className="size-4" />Export Excel</a>
      </div>
      <p className="text-[11px] text-slate-400">{snapshotLabel}</p>
    </div>
  );
}

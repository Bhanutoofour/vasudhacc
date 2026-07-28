import "server-only";
import { get, list, put } from "@vercel/blob";
import { compareInventory } from "@/lib/comparison/inventory";
import type { CurrentInventoryItem, CurrentInventoryResult } from "@/types/shopify";
import type {
  InventoryHistoryResult,
  InventorySnapshotDescriptor,
  InventorySnapshotDocument,
} from "@/types/inventory-snapshot";

const SNAPSHOT_PREFIX = "inventory-snapshots";
const SNAPSHOT_ACCESS = "private";
const SNAPSHOT_CACHE_SECONDS = 300;
const KOLKATA_TIME_ZONE = "Asia/Kolkata";
const MAX_HISTORY_SNAPSHOTS = 3;

interface BlobSnapshotEntry {
  pathname: string;
  uploadedAt: Date;
}

function toKolkataDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KOLKATA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) throw new Error("Could not determine the Asia/Kolkata date.");
  return `${year}-${month}-${day}`;
}

function buildSnapshotPath(snapshotDate: string): string {
  return `${SNAPSHOT_PREFIX}/${snapshotDate}.json`;
}

function buildSnapshotDocument(inventory: CurrentInventoryResult, snapshotDate: string): InventorySnapshotDocument {
  return {
    schemaVersion: 1,
    snapshotDate,
    capturedAt: inventory.capturedAt,
    inventory,
  };
}

async function listSnapshotEntries(): Promise<BlobSnapshotEntry[]> {
  const blobs: BlobSnapshotEntry[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${SNAPSHOT_PREFIX}/`, cursor, limit: 1000 });
    blobs.push(...page.blobs.map((blob) => ({ pathname: blob.pathname, uploadedAt: blob.uploadedAt })));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs.filter((blob) => blob.pathname.endsWith(".json")).sort((left, right) => left.pathname.localeCompare(right.pathname));
}

async function readSnapshot(pathname: string): Promise<InventorySnapshotDocument | null> {
  const response = await get(pathname, { access: SNAPSHOT_ACCESS, useCache: false });
  if (!response || response.statusCode !== 200) return null;
  const document = (await new Response(response.stream).json()) as Partial<InventorySnapshotDocument>;
  if (!document || document.schemaVersion !== 1 || typeof document.snapshotDate !== "string" || typeof document.capturedAt !== "string" || !document.inventory) return null;
  return document as InventorySnapshotDocument;
}

function snapshotLabel(index: number, total: number): string {
  if (total <= 1) return "Today";
  if (total === 2) return index === 0 ? "Yesterday" : "Today";
  return index === 0 ? "Day before" : index === 1 ? "Yesterday" : "Today";
}

function buildComparison(itemsByKey: Map<string, { item: CurrentInventoryItem; values: number[] }>) {
  return [...itemsByKey.values()]
    .map(({ item, values }) =>
      compareInventory({
        ...item,
        dayBeforeYesterday: values[0] ?? 0,
        yesterday: values[1] ?? 0,
        today: values[2] ?? 0,
      }),
    )
    .sort((left, right) => {
      if (left.today !== right.today) return left.today - right.today;
      return left.productTitle.localeCompare(right.productTitle);
    });
}

function alignSnapshotsForComparison(snapshots: InventorySnapshotDocument[]) {
  const valuesByKey = new Map<string, { item: CurrentInventoryItem; values: number[] }>();
  const startIndex = 3 - snapshots.length;

  snapshots.forEach((snapshot, index) => {
    const slotIndex = startIndex + index;
    for (const item of snapshot.inventory.items) {
      const key = `${item.inventoryItemId}::${item.locationId}`;
      const existing = valuesByKey.get(key);
      if (existing) {
        existing.item = item;
        existing.values[slotIndex] = item.available;
        continue;
      }
      const values = [0, 0, 0];
      values[slotIndex] = item.available;
      valuesByKey.set(key, { item, values });
    }
  });

  return { valuesByKey };
}

export async function writeCurrentInventorySnapshot(inventory: CurrentInventoryResult): Promise<InventorySnapshotDescriptor> {
  const snapshotDate = toKolkataDateKey(new Date());
  const pathname = buildSnapshotPath(snapshotDate);
  const document = buildSnapshotDocument(inventory, snapshotDate);

  const blob = await put(pathname, JSON.stringify(document, null, 2), {
    access: SNAPSHOT_ACCESS,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: SNAPSHOT_CACHE_SECONDS,
  });

  return {
    pathname: blob.pathname,
    uploadedAt: document.capturedAt,
    snapshotDate,
  };
}

export async function readLatestInventoryHistory(): Promise<InventoryHistoryResult> {
  const entries = await listSnapshotEntries();
  const latestEntries = entries.slice(-MAX_HISTORY_SNAPSHOTS);
  const snapshots = (await Promise.all(latestEntries.map((entry) => readSnapshot(entry.pathname)))).filter((snapshot): snapshot is InventorySnapshotDocument => snapshot !== null);

  if (snapshots.length === 0) {
    return {
      availableSnapshots: 0,
      snapshots: [],
      dailyTotals: [],
      items: [],
    };
  }

  const { valuesByKey } = alignSnapshotsForComparison(snapshots);
  const items = buildComparison(valuesByKey);

  return {
    availableSnapshots: snapshots.length,
    snapshots: snapshots.map((snapshot) => ({
      pathname: buildSnapshotPath(snapshot.snapshotDate),
      uploadedAt: snapshot.capturedAt,
      snapshotDate: snapshot.snapshotDate,
    })),
    dailyTotals: snapshots.map((snapshot, index) => ({
      label: snapshotLabel(index, snapshots.length),
      date: snapshot.snapshotDate,
      inventory: snapshot.inventory.summary.totalInventory,
    })),
    items,
  };
}

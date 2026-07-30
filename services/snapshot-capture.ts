import "server-only";
import { randomUUID } from "node:crypto";
import { deliverInventorySummary } from "@/services/inventory-alerts";
import { writeCurrentInventorySnapshot } from "@/services/inventory-snapshots";
import { writeSnapshotRun } from "@/services/operations-store";
import { fetchCurrentInventory } from "@/services/shopify-inventory";
import type { SnapshotRun } from "@/types/operations";

export async function captureInventorySnapshot(source: SnapshotRun["source"]) {
  const startedAt = new Date().toISOString();
  const id = randomUUID();
  try {
    const inventory = await fetchCurrentInventory();
    const snapshot = await writeCurrentInventorySnapshot(inventory);
    const alertResults = source === "cron" ? await deliverInventorySummary(inventory) : [];
    const run: SnapshotRun = { schemaVersion: 1, id, source, status: "success", startedAt, completedAt: new Date().toISOString(), snapshotDate: snapshot.snapshotDate, totalInventory: inventory.summary.totalInventory, totalProducts: inventory.summary.totalProducts, message: "Inventory snapshot saved.", alertResults };
    await writeSnapshotRun(run);
    return { inventory, snapshot, run };
  } catch (error) {
    const run: SnapshotRun = { schemaVersion: 1, id, source, status: "failure", startedAt, completedAt: new Date().toISOString(), snapshotDate: null, totalInventory: null, totalProducts: null, message: error instanceof Error ? error.message : "Snapshot failed." };
    try { await writeSnapshotRun(run); } catch { /* Preserve the original failure. */ }
    throw error;
  }
}

import { getDashboardSession } from "@/lib/auth/authorization";
import { captureInventorySnapshot } from "@/services/snapshot-capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!await getDashboardSession()) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    const result = await captureInventorySnapshot("manual");
    return Response.json({ ok: true, snapshot: result.snapshot, run: result.run }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Snapshot failed." }, { status: 500 });
  }
}

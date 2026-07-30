import { captureInventorySnapshot } from "@/services/snapshot-capture";
import { EnvironmentConfigurationError, isAuthorizedInternalRequest } from "@/lib/validation/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedInternalRequest(request)) return json({ error: { code: "UNAUTHORIZED", message: "A valid bearer token is required." } }, 401);
    const result = await captureInventorySnapshot("cron");
    return json({ ok: true, ...result });
  } catch (error: unknown) {
    if (error instanceof EnvironmentConfigurationError) return json({ error: { code: error.code, message: error.message } }, 503);
    console.error("Inventory snapshot failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return json({ error: { code: "INTERNAL_ERROR", message: "Inventory snapshot could not be saved." } }, 500);
  }
}

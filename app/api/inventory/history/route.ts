import { EnvironmentConfigurationError, isAuthorizedInternalRequest } from "@/lib/validation/env";
import { readLatestInventoryHistory } from "@/services/inventory-snapshots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedInternalRequest(request)) return json({ error: { code: "UNAUTHORIZED", message: "A valid bearer token is required." } }, 401);
    return json(await readLatestInventoryHistory());
  } catch (error: unknown) {
    if (error instanceof EnvironmentConfigurationError) return json({ error: { code: error.code, message: error.message } }, 503);
    console.error("Inventory history request failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return json({ error: { code: "INTERNAL_ERROR", message: "Inventory history could not be loaded." } }, 500);
  }
}

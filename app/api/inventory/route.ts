import { EnvironmentConfigurationError, isAuthorizedInternalRequest } from "@/lib/validation/env";
import { ShopifyError } from "@/lib/shopify/errors";
import { fetchCurrentInventory } from "@/services/shopify-inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedInternalRequest(request)) return json({ error: { code: "UNAUTHORIZED", message: "A valid bearer token is required." } }, 401);
    return json(await fetchCurrentInventory());
  } catch (error: unknown) {
    if (error instanceof EnvironmentConfigurationError) return json({ error: { code: error.code, message: error.message } }, 503);
    if (error instanceof ShopifyError) {
      console.error("Shopify inventory request failed", { name: error.name, code: error.code, status: error.status });
      return json({ error: { code: error.code, message: error.message } }, error.status);
    }
    console.error("Unexpected inventory request failure", { name: error instanceof Error ? error.name : "UnknownError" });
    return json({ error: { code: "INTERNAL_ERROR", message: "Inventory could not be loaded." } }, 500);
  }
}

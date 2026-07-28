import "server-only";
import { getShopifyConfig } from "@/lib/validation/env";
import { ShopifyAuthenticationError, ShopifyNetworkError } from "./errors";

interface TokenResponse {
  access_token: string;
  scope: string;
  expires_in: number;
}

interface CachedToken { value: string; expiresAt: number; }

let cachedToken: CachedToken | null = null;
let refreshPromise: Promise<string> | null = null;
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

function isTokenResponse(value: unknown): value is TokenResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TokenResponse>;
  return typeof candidate.access_token === "string" && candidate.access_token.length > 10 && typeof candidate.expires_in === "number";
}

async function responseDetail(response: Response): Promise<string | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    const parsed = JSON.parse(text) as { error?: unknown; error_description?: unknown };
    const error = typeof parsed.error === "string" ? parsed.error : null;
    const description = typeof parsed.error_description === "string" ? parsed.error_description : null;
    if (error && description) return `${error}: ${description}`;
    if (error) return error;
    if (description) return description;
  } catch {
    return text.slice(0, 200);
  }
  return text.slice(0, 200);
}

async function requestAccessToken(): Promise<string> {
  const config = getShopifyConfig();
  const body = new URLSearchParams({ grant_type: "client_credentials", client_id: config.clientId, client_secret: config.clientSecret });
  let response: Response;
  try {
    response = await fetch(`https://${config.storeDomain}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new ShopifyNetworkError();
  }
  if (response.status === 400 || response.status === 401 || response.status === 403) {
    throw new ShopifyAuthenticationError(await responseDetail(response) ?? undefined);
  }
  if (!response.ok) throw new ShopifyNetworkError();
  let payload: unknown;
  try { payload = await response.json(); } catch { throw new ShopifyAuthenticationError("Invalid JSON response from Shopify."); }
  if (!isTokenResponse(payload)) throw new ShopifyAuthenticationError("Unexpected token response from Shopify.");
  cachedToken = { value: payload.access_token, expiresAt: Date.now() + payload.expires_in * 1000 };
  return cachedToken.value;
}

export async function getShopifyAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - EXPIRY_BUFFER_MS > Date.now()) return cachedToken.value;
  refreshPromise ??= requestAccessToken().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export function invalidateShopifyAccessToken(): void { cachedToken = null; }

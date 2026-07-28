import "server-only";
import { timingSafeEqual } from "node:crypto";

const SHOPIFY_DOMAIN = /^(?!https?:\/\/)[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;
const API_VERSION = /^20\d{2}-(01|04|07|10)$/;

export class EnvironmentConfigurationError extends Error {
  readonly code = "SHOPIFY_CONFIGURATION_ERROR";
  constructor(message: string) { super(message); this.name = "EnvironmentConfigurationError"; }
}

function required(name: "SHOPIFY_STORE_DOMAIN" | "SHOPIFY_CLIENT_ID" | "SHOPIFY_CLIENT_SECRET" | "SHOPIFY_API_VERSION") {
  const value = process.env[name]?.trim();
  if (!value) throw new EnvironmentConfigurationError(`${name} is not configured.`);
  return value;
}

export function getShopifyConfig() {
  const storeDomain = required("SHOPIFY_STORE_DOMAIN").toLowerCase();
  const clientId = required("SHOPIFY_CLIENT_ID");
  const clientSecret = required("SHOPIFY_CLIENT_SECRET");
  const apiVersion = required("SHOPIFY_API_VERSION");
  if (!SHOPIFY_DOMAIN.test(storeDomain)) throw new EnvironmentConfigurationError("SHOPIFY_STORE_DOMAIN must be a valid .myshopify.com domain without a protocol.");
  if (!API_VERSION.test(apiVersion)) throw new EnvironmentConfigurationError("SHOPIFY_API_VERSION must use YYYY-MM format for a quarterly Shopify release.");
  if (clientId.length < 10) throw new EnvironmentConfigurationError("SHOPIFY_CLIENT_ID is invalid.");
  if (clientSecret.length < 20) throw new EnvironmentConfigurationError("SHOPIFY_CLIENT_SECRET is invalid.");
  return { storeDomain, clientId, clientSecret, apiVersion } as const;
}

export function isAuthorizedInternalRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) throw new EnvironmentConfigurationError("CRON_SECRET is not configured.");
  const supplied = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

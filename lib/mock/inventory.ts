import { compareInventory } from "@/lib/comparison/inventory";
import type { DailyTotal, InventoryRecord } from "@/types/inventory";

const records: InventoryRecord[] = [
  { productId: "gid://shopify/Product/101", variantId: "gid://shopify/ProductVariant/201", inventoryItemId: "gid://shopify/InventoryItem/301", locationId: "gid://shopify/Location/401", productTitle: "A2 Cow Ghee", variantTitle: "500 ml", sku: "VF-GHEE-500", imageUrl: null, locationName: "Mumbai Warehouse", dayBeforeYesterday: 132, yesterday: 116, today: 95 },
  { productId: "gid://shopify/Product/102", variantId: "gid://shopify/ProductVariant/202", inventoryItemId: "gid://shopify/InventoryItem/302", locationId: "gid://shopify/Location/401", productTitle: "Wood Pressed Groundnut Oil", variantTitle: "1 L", sku: "VF-GNO-1L", imageUrl: null, locationName: "Mumbai Warehouse", dayBeforeYesterday: 84, yesterday: 102, today: 124 },
  { productId: "gid://shopify/Product/103", variantId: "gid://shopify/ProductVariant/203", inventoryItemId: "gid://shopify/InventoryItem/303", locationId: "gid://shopify/Location/402", productTitle: "Organic Jaggery Powder", variantTitle: "500 g", sku: "VF-JAG-500", imageUrl: null, locationName: "Bengaluru Fulfilment", dayBeforeYesterday: 64, yesterday: 45, today: 18 },
  { productId: "gid://shopify/Product/104", variantId: "gid://shopify/ProductVariant/204", inventoryItemId: "gid://shopify/InventoryItem/304", locationId: "gid://shopify/Location/401", productTitle: "Gir Cow Bilona Ghee", variantTitle: "1 L", sku: "VF-BILONA-1L", imageUrl: null, locationName: "Mumbai Warehouse", dayBeforeYesterday: 38, yesterday: 20, today: 0 },
  { productId: "gid://shopify/Product/105", variantId: "gid://shopify/ProductVariant/205", inventoryItemId: "gid://shopify/InventoryItem/305", locationId: "gid://shopify/Location/402", productTitle: "Stone Ground Turmeric", variantTitle: "200 g", sku: "VF-TUR-200", imageUrl: null, locationName: "Bengaluru Fulfilment", dayBeforeYesterday: 91, yesterday: 91, today: 91 },
  { productId: "gid://shopify/Product/106", variantId: "gid://shopify/ProductVariant/206", inventoryItemId: "gid://shopify/InventoryItem/306", locationId: "gid://shopify/Location/401", productTitle: "Raw Forest Honey", variantTitle: "350 g", sku: "VF-HONEY-350", imageUrl: null, locationName: "Mumbai Warehouse", dayBeforeYesterday: 55, yesterday: 48, today: 64 },
  { productId: "gid://shopify/Product/107", variantId: "gid://shopify/ProductVariant/207", inventoryItemId: "gid://shopify/InventoryItem/307", locationId: "gid://shopify/Location/402", productTitle: "Cold Pressed Coconut Oil", variantTitle: "500 ml", sku: "VF-COCO-500", imageUrl: null, locationName: "Bengaluru Fulfilment", dayBeforeYesterday: 75, yesterday: 61, today: 43 },
  { productId: "gid://shopify/Product/108", variantId: "gid://shopify/ProductVariant/208", inventoryItemId: "gid://shopify/InventoryItem/308", locationId: "gid://shopify/Location/401", productTitle: "Heritage Wheat Flour", variantTitle: "2 kg", sku: null, imageUrl: null, locationName: "Mumbai Warehouse", dayBeforeYesterday: 12, yesterday: 10, today: 7 },
  { productId: "gid://shopify/Product/109", variantId: "gid://shopify/ProductVariant/209", inventoryItemId: "gid://shopify/InventoryItem/309", locationId: "gid://shopify/Location/402", productTitle: "Single Origin Red Chilli", variantTitle: "200 g", sku: "VF-CHILLI-200", imageUrl: null, locationName: "Bengaluru Fulfilment", dayBeforeYesterday: 43, yesterday: 40, today: 54 },
  { productId: "gid://shopify/Product/110", variantId: "gid://shopify/ProductVariant/210", inventoryItemId: "gid://shopify/InventoryItem/310", locationId: "gid://shopify/Location/401", productTitle: "Native Cow Dung Cakes", variantTitle: "Pack of 12", sku: "VF-CDC-12", imageUrl: null, locationName: "Mumbai Warehouse", dayBeforeYesterday: 27, yesterday: 19, today: 11 },
];

export const mockInventory = records.map(compareInventory);

const total = (key: "today" | "yesterday" | "dayBeforeYesterday") =>
  mockInventory.reduce((sum, item) => sum + item[key], 0);

export const dailyTotals: DailyTotal[] = [
  { label: "Day before", date: "25 Jul", inventory: total("dayBeforeYesterday") },
  { label: "Yesterday", date: "26 Jul", inventory: total("yesterday") },
  { label: "Today", date: "27 Jul", inventory: total("today") },
];

export const dashboardSummary = {
  today: total("today"),
  yesterday: total("yesterday"),
  dayBeforeYesterday: total("dayBeforeYesterday"),
  products: new Set(mockInventory.map((item) => item.productId)).size,
  variants: new Set(mockInventory.map((item) => item.variantId)).size,
  lowStock: mockInventory.filter((item) => item.today > 0 && item.today <= 20).length,
  outOfStock: mockInventory.filter((item) => item.today <= 0).length,
};

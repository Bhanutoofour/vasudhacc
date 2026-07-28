import "server-only";

export const INVENTORY_VARIANTS_QUERY = `#graphql
  query InventoryVariants($first: Int!, $after: String, $levelsFirst: Int!) {
    shop { name myshopifyDomain }
    productVariants(first: $first, after: $after, sortKey: ID) {
      nodes {
        id
        title
        sku
        media(first: 1) { nodes { preview { image { url } } } }
        product {
          id
          title
          media(first: 1) { nodes { preview { image { url } } } }
        }
        inventoryItem {
          id
          sku
          tracked
          inventoryLevels(first: $levelsFirst) {
            nodes {
              id
              location { id name }
              quantities(names: ["available"]) { name quantity }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const INVENTORY_LEVELS_QUERY = `#graphql
  query InventoryLevels($inventoryItemId: ID!, $first: Int!, $after: String) {
    inventoryItem(id: $inventoryItemId) {
      inventoryLevels(first: $first, after: $after) {
        nodes {
          id
          location { id name }
          quantities(names: ["available"]) { name quantity }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

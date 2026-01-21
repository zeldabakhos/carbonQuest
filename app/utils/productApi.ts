// API utility for Open Food Facts & Open Beauty Facts

export interface Product {
  barcode: string;
  name: string;
  brand: string;
  image_url?: string;
  categories?: string;
  ingredients_text?: string;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  nova_group?: number;
  quantity?: string;
  packaging?: string;
  source: "openfoodfacts" | "openbeautyfacts";
  raw?: any; // Full API response for later use
}

export interface ProductResult {
  success: boolean;
  product?: Product;
  error?: string;
}

const OPEN_FOOD_FACTS_API = "https://world.openfoodfacts.org/api/v2/product";
const OPEN_BEAUTY_FACTS_API = "https://world.openbeautyfacts.org/api/v2/product";

async function fetchFromApi(
  url: string,
  barcode: string,
  source: "openfoodfacts" | "openbeautyfacts"
): Promise<ProductResult> {
  try {
    const response = await fetch(`${url}/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      return {
        success: true,
        product: {
          barcode,
          name: p.product_name || p.product_name_en || "Unknown Product",
          brand: p.brands || "Unknown Brand",
          image_url: p.image_url || p.image_front_url || p.image_front_small_url,
          categories: p.categories,
          ingredients_text: p.ingredients_text || p.ingredients_text_en,
          nutriscore_grade: p.nutriscore_grade,
          ecoscore_grade: p.ecoscore_grade,
          nova_group: p.nova_group,
          quantity: p.quantity,
          packaging: p.packaging,
          source,
          raw: p,
        },
      };
    }

    return { success: false, error: "Product not found" };
  } catch (error) {
    return { success: false, error: `Failed to fetch: ${error}` };
  }
}

export async function lookupProduct(barcode: string): Promise<ProductResult> {
  // Try Open Food Facts first (food products)
  const foodResult = await fetchFromApi(
    OPEN_FOOD_FACTS_API,
    barcode,
    "openfoodfacts"
  );

  if (foodResult.success) {
    return foodResult;
  }

  // Fall back to Open Beauty Facts (cosmetics, beauty products)
  const beautyResult = await fetchFromApi(
    OPEN_BEAUTY_FACTS_API,
    barcode,
    "openbeautyfacts"
  );

  if (beautyResult.success) {
    return beautyResult;
  }

  // Neither found the product
  return {
    success: false,
    error: "Product not found in Open Food Facts or Open Beauty Facts databases",
  };
}

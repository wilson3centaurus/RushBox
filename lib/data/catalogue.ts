import { getSupabase, USE_MOCK_DATA } from "@/lib/supabase";
import { CATEGORIES, PRODUCTS } from "@/lib/mock/data";
import type { Category, Product } from "@/lib/types";

/**
 * Row shapes as the database actually returns them, taken from the generated
 * Supabase types. Narrow on purpose — only the columns the catalogue reads.
 * Run `npm run types:gen` for the full generated `Database` type.
 */
type CategoryRow = {
  slug: string;
  name: string;
  emoji: string;
  tile: string;
  sort: number;
};

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  was_price: number | null;
  unit: string;
  emoji: string;
  image: string | null;
  store_id: string;
  stock: number;
  tags: string[];
};

export type Catalogue = { categories: Category[]; products: Product[] };

export const MOCK_CATALOGUE: Catalogue = {
  categories: CATEGORIES,
  products: PRODUCTS,
};

/**
 * What the UI renders before the fetch resolves. In mock mode that is the
 * bundled catalogue, which is also the final answer. Against a real database
 * it has to be empty: showing mock products for a moment would display items
 * the shop may not actually stock.
 */
export const INITIAL_CATALOGUE: Catalogue = USE_MOCK_DATA
  ? MOCK_CATALOGUE
  : { categories: [], products: [] };

function toCategory(row: CategoryRow): Category {
  return {
    slug: row.slug,
    name: row.name,
    emoji: row.emoji,
    tile: row.tile,
  };
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    // numeric columns arrive as strings over PostgREST on some versions.
    price: Number(row.price),
    wasPrice: row.was_price === null ? undefined : Number(row.was_price),
    unit: row.unit,
    emoji: row.emoji,
    image: row.image ?? undefined,
    store: row.store_id,
    stock: row.stock,
    tags: row.tags as Product["tags"],
  };
}

/**
 * Reads the catalogue from Supabase, or returns the bundled mock data when the
 * app is in mock mode or no credentials are configured. Both tables are world
 * readable, so this works signed out.
 */
export async function loadCatalogue(): Promise<Catalogue> {
  const supabase = getSupabase();
  if (!supabase) return MOCK_CATALOGUE;

  const [categories, products] = await Promise.all([
    supabase.from("categories").select("slug,name,emoji,tile,sort").order("sort"),
    supabase
      .from("products")
      .select("id,name,category,price,was_price,unit,emoji,image,store_id,stock,tags")
      .eq("active", true)
      .order("name"),
  ]);

  if (categories.error) throw categories.error;
  if (products.error) throw products.error;

  return {
    categories: (categories.data as CategoryRow[]).map(toCategory),
    products: (products.data as ProductRow[]).map(toProduct),
  };
}

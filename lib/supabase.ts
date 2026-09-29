import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

let client: SupabaseClient | null = null;

/**
 * Returns null while the app runs on mock data, or when the env vars are absent,
 * so screens can fall back without every caller guarding separately.
 */
export function getSupabase(): SupabaseClient | null {
  if (USE_MOCK_DATA) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  client ??= createClient(url, key);
  return client;
}

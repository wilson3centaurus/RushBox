import { getSupabase } from "@/lib/supabase";
import { DEFAULT_PRICING, withDefaults, type PricingSettings } from "@/lib/pricing";

/**
 * Pricing lives in the `app_settings` table under the key "pricing". Anyone can
 * read it (the cart needs it signed out); only admins can write it, enforced by
 * row-level security, not by this code.
 */
const KEY = "pricing";

export async function loadPricing(): Promise<PricingSettings> {
  const supabase = getSupabase();
  if (!supabase) return DEFAULT_PRICING;

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();

  if (error) throw error;
  return withDefaults(data?.value);
}

export type PublishResult =
  | { published: true }
  | { published: false; reason: string };

/**
 * Writes pricing for every customer. Needs a real Supabase session belonging to
 * an admin — until phone sign-in is live there is none, and the caller keeps
 * the change on this device instead.
 */
export async function publishPricing(next: PricingSettings): Promise<PublishResult> {
  const supabase = getSupabase();
  if (!supabase) return { published: false, reason: "Saved on this device. Demo mode has no database to publish to." };

  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    return {
      published: false,
      reason: "Saved on this device only. Publishing to all customers needs an admin sign-in.",
    };
  }

  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: KEY, value: next, updated_at: new Date().toISOString() });

  if (error) return { published: false, reason: error.message };
  return { published: true };
}

import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key.
 * NEVER import this into a "use client" component — the service-role key
 * must never reach the browser. It's safe here because route handlers and
 * server components run only on the server.
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && url !== "placeholder");
}

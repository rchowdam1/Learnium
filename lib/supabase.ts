import { createBrowserClient } from "@supabase/ssr";

export const createSupabaseClient = () => {
  return createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_API_KEY!
  );
};

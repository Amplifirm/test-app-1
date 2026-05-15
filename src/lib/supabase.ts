// Supabase client — null-guarded so the app boots without env vars set.
// Until the founder fills .env.local with EXPO_PUBLIC_SUPABASE_URL +
// EXPO_PUBLIC_SUPABASE_ANON_KEY, `supabase` is null and every helper
// returns a graceful-degradation result (local-only).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: client is untyped here. After `supabase gen types typescript --linked`
// re-generates `database.types.ts`, switch to `createClient<Database>(...)`
// for full row-level type safety.

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const supabaseEnabled = supabase !== null;

if (!supabaseEnabled && __DEV__) {
  console.log(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY not set — running in local-only mode'
  );
}

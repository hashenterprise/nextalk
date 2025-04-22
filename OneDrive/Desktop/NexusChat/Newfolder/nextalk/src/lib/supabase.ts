// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl!, supabaseKey!);

export const updateSupabaseAuth = async (clerkToken: string) => {
  const { data } = await supabase.auth.setSession({
    access_token: clerkToken,
    refresh_token: '',
  });

  return data;
};
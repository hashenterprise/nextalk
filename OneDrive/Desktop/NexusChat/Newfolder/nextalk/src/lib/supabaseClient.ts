import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

const supabase = createBrowserSupabaseClient({
  options: {
    global: {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLERK_JWT}`, // Pass Clerk JWT
      },
    },
  },
});

export default supabase;
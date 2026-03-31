import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase environment variables are missing. Deployment might fail or functionality will be limited.");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

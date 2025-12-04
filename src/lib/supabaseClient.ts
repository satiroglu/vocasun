import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env vars missing! Check your Vercel project settings.', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
    });
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

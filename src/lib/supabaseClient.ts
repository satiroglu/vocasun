import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// if (!supabaseUrl || !supabaseAnonKey) {
//     console.error('Supabase env vars missing!', {
//         url: !!supabaseUrl,
//         key: !!supabaseAnonKey
//     });
// } else {
//     console.log('Supabase client initialized', {
//         url: supabaseUrl,
//         keyLength: supabaseAnonKey.length
//     });
// }

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

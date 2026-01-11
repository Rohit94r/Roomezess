import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let client: any
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey)
} else {
  const err = () => new Error('Supabase not configured')
  client = {
    auth: {
      signUp: async () => { throw err() },
      signInWithPassword: async () => { throw err() },
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      updateUser: async () => { throw err() },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: async () => { throw err() },
      insert: async () => { throw err() },
      update: async () => { throw err() },
      delete: async () => { throw err() }
    }),
    storage: {
      from: () => ({
        upload: async () => { throw err() },
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  }
}
export const supabase = client

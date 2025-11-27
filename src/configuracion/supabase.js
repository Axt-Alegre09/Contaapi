import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Verificar que las variables estén cargadas (quitar en producción final)
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  mode: import.meta.env.MODE
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'contaapi-auth',
    flowType: 'pkce'
  }
})

// Debug: Verificar estado de autenticación (quitar en producción final)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth event:', event, session?.user?.email || 'no user')
})

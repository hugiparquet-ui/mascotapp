import { create } from 'zustand'
import { supabase } from '../config/supabase.client'

interface AppState {
  user: any
  session: any
  loading: boolean
  setUser: (user: any) => void
  setSession: (session: any) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      set({ user: session.user, session, loading: false })
    } else {
      set({ loading: false })
    }
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session })
    })
  }
}))
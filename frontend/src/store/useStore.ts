import { create } from 'zustand'

interface AppState {
  user: {
    name: string
    role: string
  } | null
  loading: boolean
  setUser: (user: { name: string; role: string } | null) => void
  setLoading: (loading: boolean) => void
}

const useStore = create<AppState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}))

export default useStore
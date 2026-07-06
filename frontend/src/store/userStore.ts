import { create } from 'zustand'
import api from '../services/api'

interface User {
  id: number
  username: string
  role: string
}

interface UserStore {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  login: async (username, password) => {
    const data = await api.post('/auth/login', { username, password }) as any
    localStorage.setItem('token', data.token)
    set({ user: data.user })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null })
  },
  checkAuth: async () => {
    try {
      const data = await api.get('/auth/me') as any
      set({ user: data, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
}))

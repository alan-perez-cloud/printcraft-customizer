import { defineStore } from 'pinia'

const API_URL = 'http://localhost:8080/api/v1'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null as string | null,
    userEmail: localStorage.getItem('userEmail') || null as string | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Credenciales inválidas')
      const data = await res.json()
      this.setSession(data.token, email)
    },
    async register(email: string, password: string, fullName: string) {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      })
      if (!res.ok) throw new Error('No se pudo registrar')
      const data = await res.json()
      this.setSession(data.token, email)
    },
    setSession(token: string, email: string) {
      this.token = token
      this.userEmail = email
      localStorage.setItem('token', token)
      localStorage.setItem('userEmail', email)
    },
    logout() {
      this.token = null
      this.userEmail = null
      localStorage.removeItem('token')
      localStorage.removeItem('userEmail')
    },
    async autoLoginDev() {
      if (import.meta.env.DEV && !this.token) {
        try {
          await this.login('test@test.com', '123456')
        } catch {
          // usuario de dev no existe todavía, ignora
        }
      }
    },  
  },
})
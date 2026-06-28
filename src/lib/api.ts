import axios from 'axios'
import type { User, ApiKey, NewApiKeyResponse, LedgerBalance, LedgerEntry, Provider, ProviderRoute, ProviderEarnings, Review } from './types'

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/v1`,
  headers: { 'Content-Type': 'application/json' },
})

/* Request interceptor — attach JWT */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gateway_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

/* Response interceptor — handle 401 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('gateway_token')
      window.location.href = '/'
    }
    return Promise.reject(error.response?.data?.error || error.message)
  }
)

/* ── Auth ───────────────────────────────────────────────────── */

export async function login(privyToken: string) {
  const { data } = await api.post('/auth/privy', { privyToken })
  return data as { token: string; user: User }
}

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data as User
}

/* ── Ledger ─────────────────────────────────────────────────── */

export async function getBalance() {
  const { data } = await api.get('/ledger/balance')
  return data as LedgerBalance
}

export async function getLedgerHistory(page = 1) {
  const { data } = await api.get('/ledger/history', { params: { page } })
  return data as { entries: LedgerEntry[]; page: number; limit: number }
}

/* ── API Keys ───────────────────────────────────────────────── */

export async function getKeys() {
  const { data } = await api.get('/keys')
  return data as ApiKey[]
}

export async function createKey(label: string, scopes?: string[]) {
  const { data } = await api.post('/keys', { label, scopes })
  return data as NewApiKeyResponse
}

export async function deleteKey(id: string) {
  await api.delete(`/keys/${id}`)
}

/* ── Provider ───────────────────────────────────────────────── */

export async function registerProvider(data: {
  businessName: string
  description: string
  website?: string
}) {
  const { data: response } = await api.post('/provider/register', data)
  return response as Provider
}

export async function getMyProvider() {
  const { data } = await api.get('/provider/me')
  return data as Provider & {
    routes: ProviderRoute[]
    earnings: ProviderEarnings
  }
}

export async function createRoute(routeData: object) {
  const { data } = await api.post('/provider/routes', routeData)
  return data as ProviderRoute
}

/* ── Marketplace ────────────────────────────────────────────── */

export async function getMarketplace(params?: {
  q?: string
  category?: string
  page?: number
  limit?: number
}) {
  const { data } = await api.get('/marketplace', { params })
  return data as ProviderRoute[]
}

export async function getRoute(routeId: string) {
  const { data } = await api.get(`/marketplace/${routeId}`)
  return data as ProviderRoute & {
    reviews: Review[]
    provider: { name: string; verified: boolean }
  }
}

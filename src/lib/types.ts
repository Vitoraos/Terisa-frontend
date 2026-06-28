export type RouteCategory =
  | 'TEXT_AI'
  | 'IMAGE_AI'
  | 'DATA'
  | 'FINANCE'
  | 'WEATHER'
  | 'COMMUNICATION'
  | 'UTILITIES'
  | 'DEVELOPER_TOOLS'
  | 'AFRICA_SPECIFIC'
  | 'OTHER'

export interface User {
  id: string
  email: string | null
  walletAddress: string | null
  balanceMicroUsdc: string
  createdAt: string
}

export interface ApiKey {
  id: string
  label: string
  scopes: string[]
  createdAt: string
}

export interface NewApiKeyResponse extends ApiKey {
  key: string
}

export interface LedgerBalance {
  balanceMicroUsdc: string
  balanceUsdc: string
}

export interface LedgerEntry {
  id: string
  amount: string
  type: string
  referenceId: string
  createdAt: string
}

export interface Provider {
  id: string
  businessName: string
  description: string
  verified: boolean
  active: boolean
}

export interface ProviderRoute {
  id: string
  name: string
  description: string
  category: RouteCategory
  tags: string[]
  costMicroUsdc: string
  costUsdc: string
  avgLatencyMs: number | null
  uptimePct: number | null
  avgRating: number | null
  totalCalls: string
  isPublic: boolean
  isActive: boolean
  suspensionReason: string | null
  provider?: { name: string; verified: boolean }
  reviews?: Review[]
}

export interface ProviderEarnings {
  balance: string
  lifetime: string
  balanceUsdc: string
  lifetimeUsdc: string
}

export interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { email: string }
}

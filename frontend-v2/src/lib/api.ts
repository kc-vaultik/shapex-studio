/**
 * API client for ShapeX backend
 * Uses Axios with React Query for data fetching
 */

import axios, { AxiosError } from 'axios'
import type {
  Idea,
  IdeaFilters,
  IdeasResponse,
} from '@/types/idea'
import type {
  Trend,
  TrendFilters,
  TrendsResponse,
  TrendNetwork,
} from '@/types/trend'
import type {
  DashboardStats,
  OpportunitiesResponse,
  Scan,
  ScanProgress,
} from '@/types/stats'

// API base URL - defaults to proxy in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Create Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor for logging and authentication
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('auth_token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - please log in')
          break
        case 403:
          console.error('Forbidden - you do not have access')
          break
        case 404:
          console.error('Not found')
          break
        case 500:
          console.error('Server error - please try again later')
          break
      }
    } else if (error.request) {
      console.error('Network error - please check your connection')
    }
    return Promise.reject(error)
  }
)

// ============================================================================
// API Functions
// ============================================================================

/**
 * Dashboard Stats
 */
export const getStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<DashboardStats>('/api/stats')
  return data
}

/**
 * Ideas
 */
export const getIdeas = async (filters: IdeaFilters = {}): Promise<IdeasResponse> => {
  const { data } = await api.get<IdeasResponse>('/api/ideas', {
    params: filters,
  })
  return data
}

export const getIdea = async (id: number): Promise<Idea> => {
  const { data } = await api.get<Idea>(`/api/ideas/${id}`)
  return data
}

/**
 * Opportunities
 */
export const getOpportunities = async (): Promise<OpportunitiesResponse> => {
  const [strategic, quickWins] = await Promise.all([
    api.get<Idea[]>('/api/opportunities/strategic'),
    api.get<Idea[]>('/api/opportunities/quick-wins'),
  ])

  return {
    strategic: strategic.data,
    quick_wins: quickWins.data,
  }
}

/**
 * Trends
 */
export const getTrends = async (filters: TrendFilters = {}): Promise<TrendsResponse> => {
  const { data } = await api.get<TrendsResponse>('/api/trends', {
    params: filters,
  })
  return data
}

export const getTrendNetwork = async (): Promise<TrendNetwork> => {
  const { data } = await api.get<TrendNetwork>('/api/trends/network')
  return data
}

/**
 * Scans
 */
export const getScans = async (): Promise<Scan[]> => {
  const { data } = await api.get<Scan[]>('/api/scans')
  return data
}

export const getScan = async (id: number): Promise<Scan> => {
  const { data } = await api.get<Scan>(`/api/scans/${id}`)
  return data
}

export const triggerScan = async (): Promise<Scan> => {
  const { data } = await api.post<Scan>('/api/scan/now')
  return data
}

/**
 * Search
 */
export const searchIdeas = async (query: string): Promise<Idea[]> => {
  const { data } = await api.get<Idea[]>('/api/search/ideas', {
    params: { q: query },
  })
  return data
}

// ============================================================================
// React Query Keys
// ============================================================================

export const queryKeys = {
  stats: ['stats'] as const,
  ideas: (filters?: IdeaFilters) => ['ideas', filters] as const,
  idea: (id: number) => ['idea', id] as const,
  opportunities: ['opportunities'] as const,
  trends: (filters?: TrendFilters) => ['trends', filters] as const,
  trendNetwork: ['trend-network'] as const,
  scans: ['scans'] as const,
  scan: (id: number) => ['scan', id] as const,
}

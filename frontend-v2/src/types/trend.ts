/**
 * ShapeX Trend TypeScript interfaces
 */

export interface Trend {
  id: number
  keyword: string
  source: string
  momentum: number
  category: string
  related_keywords: string[]
  data_points?: TrendDataPoint[]
  created_at: string
  updated_at: string
}

export interface TrendDataPoint {
  timestamp: string
  value: number
}

export interface TrendFilters {
  source?: string
  category?: string
  min_momentum?: number
  search?: string
  sort_by?: 'momentum' | 'created_at'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface TrendsResponse {
  trends: Trend[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface TrendNetwork {
  nodes: TrendNode[]
  links: TrendLink[]
}

export interface TrendNode {
  id: string
  keyword: string
  momentum: number
  category: string
  size: number
}

export interface TrendLink {
  source: string
  target: string
  strength: number
}

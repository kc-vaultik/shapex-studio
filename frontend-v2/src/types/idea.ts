/**
 * ShapeX Idea TypeScript interfaces
 */

export interface Idea {
  id: number
  title: string
  description: string
  category: string
  channel: 'strategic' | 'quick-win'
  source: string

  // Scores (0-10 scale)
  overall_score: number
  feasibility: number
  market_demand: number
  monetization: number
  competition: number
  risk: number

  // Analysis
  market_analysis: string
  target_audience: string
  competitive_landscape: string
  monetization_strategy: string
  implementation_roadmap: string
  risk_mitigation: string

  // Metadata
  created_at: string
  updated_at: string
  scan_id?: number

  // Relationships
  trends?: Trend[]
  competitors?: Competitor[]
}

export interface Trend {
  id: number
  keyword: string
  source: string
  momentum: number
  category: string
  related_keywords: string[]
  created_at: string
}

export interface Competitor {
  name: string
  description: string
  url?: string
  strengths: string[]
  weaknesses: string[]
  market_position: string
}

export interface IdeaFilters {
  channel?: 'strategic' | 'quick-win' | 'all'
  min_score?: number
  category?: string
  search?: string
  sort_by?: 'overall_score' | 'created_at' | 'market_demand'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface IdeasResponse {
  ideas: Idea[]
  total: number
  page: number
  limit: number
  total_pages: number
}

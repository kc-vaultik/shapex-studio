/**
 * ShapeX Statistics TypeScript interfaces
 */

export interface DashboardStats {
  total_ideas: number
  total_scans: number
  total_trends: number
  opportunities_count: number

  // Recent activity
  recent_scans: number
  new_ideas_today: number
  trending_keywords: number

  // Scores
  avg_overall_score: number
  avg_feasibility: number
  avg_market_demand: number
  avg_monetization: number

  // Channel breakdown
  strategic_ideas: number
  quick_win_ideas: number

  // Timestamps
  last_scan_at?: string
  last_updated: string
}

export interface OpportunitiesResponse {
  strategic: Idea[]
  quick_wins: Idea[]
}

export interface Scan {
  id: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  duration_seconds?: number
  ideas_generated: number
  trends_discovered: number
  error_message?: string
}

export interface ScanProgress {
  scan_id: number
  status: 'running' | 'completed' | 'failed'
  progress: number // 0-100
  current_step: string
  ideas_generated: number
  logs: string[]
}

// Import Idea type for OpportunitiesResponse
import { Idea } from './idea'

import { Idea } from '../store/gameStore'

const API_BASE = 'http://localhost:8000'

export interface SessionResponse {
  session_id: string
  idea_id: number
  idea_title: string
  websocket_url: string
  status: string
  created_at: string
}

export interface BlueprintResponse {
  id: number
  session_id: string
  idea_id: number
  market_research?: string
  validation_analysis?: string
  strategic_plan?: string
  created_at: string
}

export interface AnalysisResponse {
  analysis_id: string
  status: 'processing' | 'completed' | 'failed'
  current_agent?: string
  progress: number
  results?: {
    feasibility: number
    market: number
    monetization: number
    competition: number
    risk: number
    recommendation: string
    reasoning: string
  }
}

export const gameApi = {
  /**
   * Create a new analysis session
   * Uses the real backend session creation endpoint
   */
  async createSession(ideaId: number): Promise<SessionResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/studio/sessions/create?idea_id=${ideaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Session created:', data)
      return data
    } catch (error) {
      console.error('❌ Error creating session:', error)
      throw error
    }
  },

  /**
   * Get blueprint by ID
   */
  async getBlueprint(blueprintId: number): Promise<BlueprintResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/studio/blueprints/${blueprintId}`)

      if (!response.ok) {
        throw new Error(`Failed to get blueprint: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Blueprint retrieved:', data)
      return data
    } catch (error) {
      console.error('❌ Error getting blueprint:', error)
      throw error
    }
  },

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/api/studio/sessions/${sessionId}`)

      if (!response.ok) {
        throw new Error(`Failed to get session: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Error getting session:', error)
      throw error
    }
  },

  /**
   * Check backend health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/studio/health`)
      return response.ok
    } catch (error) {
      console.error('❌ Backend not available:', error)
      return false
    }
  },

  /**
   * Parse blueprint sections into game results
   */
  parseBlueprint(blueprint: BlueprintResponse): AnalysisResponse['results'] {
    // Extract scores from blueprint sections
    // This is a simplified version - in production you'd parse the actual JSON/text

    return {
      feasibility: 7.5 + Math.random() * 2,
      market: 7.0 + Math.random() * 2,
      monetization: 8.0 + Math.random() * 1.5,
      competition: 7.0 + Math.random() * 2,
      risk: 6.5 + Math.random() * 2,
      recommendation: Math.random() > 0.3 ? 'BUILD' : 'PIVOT',
      reasoning: blueprint.strategic_plan || 'AI analysis complete. Review the blueprint for detailed insights.'
    }
  }
}

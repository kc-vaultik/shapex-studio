/**
 * WebSocket Service for Real-Time AI Agent Streaming
 * Connects to ShapeX Studio backend for live 3-agent analysis
 */

import { Analysis } from '../store/gameStore'

export interface WebSocketMessage {
  type: 'session_start' | 'agent_start' | 'agent_stream' | 'agent_complete' | 'session_complete' | 'session_error'
  agent_name?: string
  progress?: number
  content?: string
  duration?: number
  token_count?: number
  cost?: number
  blueprint_id?: number
  error?: string
  idea_title?: string
  idea_category?: string
}

export interface WebSocketCallbacks {
  onSessionStart?: (message: WebSocketMessage) => void
  onAgentStart?: (message: WebSocketMessage) => void
  onAgentStream?: (message: WebSocketMessage) => void
  onAgentComplete?: (message: WebSocketMessage) => void
  onSessionComplete?: (message: WebSocketMessage) => void
  onError?: (error: string) => void
  onClose?: () => void
}

export class StudioWebSocket {
  private ws: WebSocket | null = null
  private callbacks: WebSocketCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 2000

  constructor(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks
  }

  /**
   * Connect to WebSocket and start workflow
   */
  connect(sessionId: string, ideaId: number): void {
    const wsUrl = `ws://localhost:8000/api/studio/ws/${sessionId}`

    console.log('🔌 Connecting to WebSocket:', wsUrl)

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected')
        this.reconnectAttempts = 0

        // Start the workflow
        this.send({
          type: 'start_workflow',
          idea_id: ideaId
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('📨 WebSocket message:', message.type, message)

          this.handleMessage(message)
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        this.callbacks.onError?.('WebSocket connection error')
      }

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        this.callbacks.onClose?.()

        // Attempt reconnection if not intentional
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`🔄 Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

          setTimeout(() => {
            this.connect(sessionId, ideaId)
          }, this.reconnectDelay)
        }
      }
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error)
      this.callbacks.onError?.('Failed to establish WebSocket connection')
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'session_start':
        this.callbacks.onSessionStart?.(message)
        break

      case 'agent_start':
        this.callbacks.onAgentStart?.(message)
        break

      case 'agent_stream':
        this.callbacks.onAgentStream?.(message)
        break

      case 'agent_complete':
        this.callbacks.onAgentComplete?.(message)
        break

      case 'session_complete':
        this.callbacks.onSessionComplete?.(message)
        break

      case 'session_error':
        this.callbacks.onError?.(message.error || 'Unknown error')
        break

      default:
        console.warn('⚠️ Unknown message type:', message.type)
    }
  }

  /**
   * Send message through WebSocket
   */
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('❌ WebSocket not ready, state:', this.ws?.readyState)
    }
  }

  /**
   * Close WebSocket connection
   */
  close(): void {
    if (this.ws) {
      this.reconnectAttempts = this.maxReconnectAttempts // Prevent reconnection
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

/**
 * Map agent names from backend to game state
 */
export function mapAgentName(agentName?: string): 'researcher' | 'validator' | 'strategist' | undefined {
  if (!agentName) return undefined

  const lower = agentName.toLowerCase()
  if (lower.includes('research')) return 'researcher'
  if (lower.includes('validat')) return 'validator'
  if (lower.includes('strateg')) return 'strategist'

  return undefined
}

/**
 * Map agent name to analysis status
 */
export function mapAgentToStatus(agentName?: string): Analysis['status'] {
  const mapped = mapAgentName(agentName)

  switch (mapped) {
    case 'researcher':
      return 'researching'
    case 'validator':
      return 'validating'
    case 'strategist':
      return 'strategizing'
    default:
      return 'pending'
  }
}

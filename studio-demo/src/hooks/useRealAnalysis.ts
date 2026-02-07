/**
 * Real AI Analysis Hook - Connects to Backend WebSocket
 * Replaces the simulated useAnalysis with real 3-agent pipeline
 */

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { gameApi } from '../services/api'
import { StudioWebSocket, mapAgentToStatus, WebSocketMessage } from '../services/websocket'
import { mapIdeaIdToBackend } from '../utils/ideaMapping'

export function useRealAnalysis() {
  const {
    currentAnalysis,
    currentIdea,
    updateAnalysis,
    toggleDecisionModal
  } = useGameStore()

  const wsRef = useRef<StudioWebSocket | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const agentProgressRef = useRef<{ [key: string]: number }>({})

  useEffect(() => {
    // Only start if we have an analysis in pending state
    if (!currentAnalysis || currentAnalysis.status !== 'pending') {
      return
    }

    if (!currentIdea) {
      console.error('❌ No current idea selected')
      return
    }

    if (isConnecting) {
      console.log('⏳ Already connecting...')
      return
    }

    console.log('🚀 Starting real analysis for:', currentIdea.title)
    startRealAnalysis()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        console.log('🧹 Cleaning up WebSocket')
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [currentAnalysis?.id, currentAnalysis?.status])

  const startRealAnalysis = async () => {
    if (!currentIdea || !currentAnalysis) return

    setIsConnecting(true)
    agentProgressRef.current = {}

    try {
      // Step 1: Create session via REST API
      console.log('📝 Creating session...')
      const backendIdeaId = mapIdeaIdToBackend(currentIdea.id)
      console.log(`   Mapping game idea "${currentIdea.id}" -> backend idea ${backendIdeaId}`)
      const session = await gameApi.createSession(backendIdeaId)

      console.log('✅ Session created:', session.session_id)

      // Step 2: Connect WebSocket
      console.log('🔌 Connecting WebSocket...')

      wsRef.current = new StudioWebSocket({
        onSessionStart: (message) => {
          console.log('🎬 Session started:', message.idea_title)
          updateAnalysis({
            status: 'researching',
            currentAgent: 'researcher',
            progress: 0
          })
        },

        onAgentStart: (message) => {
          const agentName = message.agent_name?.toLowerCase()
          console.log('🔵 Agent started:', agentName)

          agentProgressRef.current[agentName || 'unknown'] = 0

          const status = mapAgentToStatus(message.agent_name)
          const mappedAgent = agentName?.includes('research') ? 'researcher' :
            agentName?.includes('validat') ? 'validator' :
              agentName?.includes('strateg') ? 'strategist' : undefined

          // Update progress based on which agent started
          let baseProgress = 0
          if (mappedAgent === 'researcher') baseProgress = 0
          else if (mappedAgent === 'validator') baseProgress = 33
          else if (mappedAgent === 'strategist') baseProgress = 66

          updateAnalysis({
            status,
            currentAgent: mappedAgent,
            progress: baseProgress
          })
        },

        onAgentStream: (message) => {
          // Real-time streaming content (optional to display)
          const agentName = message.agent_name?.toLowerCase()
          if (agentName && agentProgressRef.current[agentName] !== undefined) {
            // Gradually increase progress during streaming
            agentProgressRef.current[agentName] = Math.min(
              agentProgressRef.current[agentName] + 0.5,
              32
            )

            const currentAgent = agentName.includes('research') ? 'researcher' :
              agentName.includes('validat') ? 'validator' :
                agentName.includes('strateg') ? 'strategist' : undefined

            let baseProgress = 0
            if (currentAgent === 'researcher') baseProgress = 0
            else if (currentAgent === 'validator') baseProgress = 33
            else if (currentAgent === 'strategist') baseProgress = 66

            updateAnalysis({
              progress: Math.floor(baseProgress + agentProgressRef.current[agentName])
            })
          }
        },

        onAgentComplete: (message) => {
          const agentName = message.agent_name?.toLowerCase()
          console.log('✅ Agent completed:', agentName, `(${message.duration}s, $${message.cost?.toFixed(4)})`)

          const mappedAgent = agentName?.includes('research') ? 'researcher' :
            agentName?.includes('validat') ? 'validator' :
              agentName?.includes('strateg') ? 'strategist' : undefined

          // Set progress to end of agent's range
          let progress = 33
          if (mappedAgent === 'validator') progress = 66
          else if (mappedAgent === 'strategist') progress = 100

          updateAnalysis({
            progress
          })
        },

        onSessionComplete: async (message) => {
          console.log('🎉 Session complete! Blueprint ID:', message.blueprint_id)

          try {
            if (message.blueprint_id) {
              // Fetch the blueprint
              const blueprint = await gameApi.getBlueprint(message.blueprint_id)
              const results = gameApi.parseBlueprint(blueprint)

              updateAnalysis({
                status: 'complete',
                progress: 100,
                results
              })

              // Show decision modal
              setTimeout(() => {
                toggleDecisionModal()
              }, 500)
            }
          } catch (error) {
            console.error('❌ Error fetching blueprint:', error)
            updateAnalysis({
              status: 'failed'
            })
          }

          // Close WebSocket
          wsRef.current?.close()
          wsRef.current = null
          setIsConnecting(false)
        },

        onError: (error) => {
          console.error('❌ WebSocket error:', error)
          updateAnalysis({
            status: 'failed'
          })

          wsRef.current?.close()
          wsRef.current = null
          setIsConnecting(false)
        },

        onClose: () => {
          console.log('🔌 WebSocket closed')
          setIsConnecting(false)
        }
      })

      // Connect and start workflow
      wsRef.current.connect(session.session_id, backendIdeaId)

    } catch (error) {
      console.error('❌ Failed to start analysis:', error)
      updateAnalysis({
        status: 'failed'
      })
      setIsConnecting(false)
    }
  }

  return {
    currentAnalysis,
    isConnecting
  }
}

import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { gameApi } from '../services/api'

export function useAnalysis() {
  const {
    currentAnalysis,
    updateAnalysis,
    toggleDecisionModal
  } = useGameStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!currentAnalysis) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Simulate 3-agent workflow
    if (currentAnalysis.status === 'pending') {
      // Start with researcher
      updateAnalysis({
        status: 'researching',
        currentAgent: 'researcher',
        progress: 0
      })

      // Researcher phase: 0-33%
      let progress = 0
      intervalRef.current = setInterval(() => {
        progress += 2

        if (progress <= 33) {
          updateAnalysis({
            status: 'researching',
            currentAgent: 'researcher',
            progress
          })
        } else if (progress <= 66) {
          updateAnalysis({
            status: 'validating',
            currentAgent: 'validator',
            progress
          })
        } else if (progress < 100) {
          updateAnalysis({
            status: 'strategizing',
            currentAgent: 'strategist',
            progress
          })
        } else {
          // Complete
          gameApi.getBlueprint(currentAnalysis.id).then((response) => {
            updateAnalysis({
              status: 'complete',
              progress: 100,
              results: response.results
            })

            // Show decision modal after analysis
            setTimeout(() => {
              toggleDecisionModal()
            }, 500)
          })

          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }, 100) // Update every 100ms for smooth animation
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [currentAnalysis?.id, currentAnalysis?.status])

  return { currentAnalysis }
}

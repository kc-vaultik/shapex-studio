/**
 * Idea ID Mapping Utility
 * Maps game idea IDs to backend database idea IDs
 */

/**
 * Map game idea ID (string) to backend idea ID (number)
 *
 * For MVP, we use idea 52 which exists in the backend database
 * In production, you would:
 * 1. Sync game ideas with backend database
 * 2. Create ideas via API if they don't exist
 * 3. Store the mapping in localStorage or game state
 */
export function mapIdeaIdToBackend(gameIdeaId: string): number {
  // For now, all game ideas map to idea 52 (AI Code Review - tested and working)
  // This is the idea we used in successful tests

  // Future: Create a proper mapping or create ideas via API
  const idMap: { [key: string]: number } = {
    '1': 52, // AI-Powered Meal Planning -> AI Code Review (for testing)
    '2': 52, // Code Review Automation -> AI Code Review
    '3': 52, // Local Business Podcast -> AI Code Review
    '4': 52, // Solar Panel ROI -> AI Code Review
    '5': 52, // AI Tutor Platform -> AI Code Review
  }

  return idMap[gameIdeaId] || 52 // Default to 52 if not found
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8000/api/studio/health')
    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}

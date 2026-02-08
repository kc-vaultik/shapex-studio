/**
 * ShapeX Studio API Service
 *
 * Handles all REST API calls to the backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface CreateSessionResponse {
  session_id: string;
  idea_id: number;
  websocket_url: string;
}

interface SessionStatus {
  session_id: string;
  status: string;
  created_at: string;
  completed_at?: string;
  blueprint_id?: number;
}

interface Blueprint {
  id: number;
  session_id: string;
  market_research?: any;
  validation_report?: any;
  business_strategy?: any;
  created_at: string;
}

interface HealthCheck {
  status: string;
  version: string;
  timestamp: string;
}

/**
 * Create a new validation session
 * @param ideaId - The ID of an existing ShapeX idea (default: 52 for testing)
 * @param userId - User identifier (default: "test_user")
 */
export async function createSession(ideaId: number = 52, userId: string = 'test_user'): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/studio/sessions/create?idea_id=${ideaId}&user_id=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get session status
 */
export async function getSessionStatus(sessionId: string): Promise<SessionStatus> {
  const response = await fetch(`${API_BASE_URL}/api/studio/sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error(`Failed to get session status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get blueprint by ID
 */
export async function getBlueprint(blueprintId: number): Promise<Blueprint> {
  const response = await fetch(`${API_BASE_URL}/api/studio/blueprints/${blueprintId}`);

  if (!response.ok) {
    throw new Error(`Failed to get blueprint: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Health check
 */
export async function healthCheck(): Promise<HealthCheck> {
  const response = await fetch(`${API_BASE_URL}/api/studio/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get WebSocket URL for a session
 */
export function getWebSocketUrl(sessionId: string): string {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = API_BASE_URL.replace('http://', '').replace('https://', '');
  return `${wsProtocol}//${wsHost}/api/studio/ws/${sessionId}`;
}

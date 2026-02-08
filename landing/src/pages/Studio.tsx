import { useState } from 'react';
import AgentCanvas from '../components/studio/AgentCanvas';
import IdeaInput from '../components/studio/IdeaInput';
import { createSession } from '../services/studioApi';

type SessionPhase = 'input' | 'running' | 'complete';

export default function Studio() {
  const [phase, setPhase] = useState<SessionPhase>('input');
  const [idea, setIdea] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [ideaId, setIdeaId] = useState<number>(52);
  const [error, setError] = useState<string>('');

  const handleStartSession = async (userIdea: string) => {
    setIdea(userIdea);
    setError('');

    try {
      // Create session with backend (using test idea ID 52)
      const response = await createSession(52, 'test_user');
      setSessionId(response.session_id);
      setIdeaId(response.idea_id);
      setPhase('running');
    } catch (err) {
      setError(`Failed to start session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSessionComplete = () => {
    setPhase('complete');
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {phase === 'input' && (
        <>
          <IdeaInput onSubmit={handleStartSession} />
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-900 border border-red-500 text-white px-6 py-4 rounded-lg max-w-md">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </>
      )}

      {phase === 'running' && sessionId && (
        <AgentCanvas
          idea={idea}
          sessionId={sessionId}
          ideaId={ideaId}
          onComplete={handleSessionComplete}
        />
      )}

      {phase === 'complete' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-razer-green mb-4">
              🎉 Validation Complete! 🎉
            </h1>
            <p className="text-gray-400 mb-8">
              Your report is being generated...
            </p>
            <button
              onClick={() => setPhase('input')}
              className="px-6 py-3 bg-razer-green text-black font-semibold rounded-lg hover:bg-green-400 transition-colors"
            >
              Start New Validation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

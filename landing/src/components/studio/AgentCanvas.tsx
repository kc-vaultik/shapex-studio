import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AgentProgressBar from './AgentProgressBar';
import AgentPanel from './AgentPanel';
import LiveLog from './LiveLog';
import { getWebSocketUrl } from '../../services/studioApi';

interface AgentCanvasProps {
  idea: string;
  sessionId: string;
  ideaId: number;
  onComplete: () => void;
}

export type AgentStatus = 'queue' | 'active' | 'done' | 'error';

export interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: AgentStatus;
  duration: number;
  progress: number;
  outputs?: any[];
}

export interface LogMessage {
  timestamp: string;
  agentId: string;
  agentName: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  highlight: boolean;
}

export default function AgentCanvas({ idea, sessionId, ideaId, onComplete }: AgentCanvasProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'researcher',
      name: 'Market Researcher',
      icon: '🔍',
      color: 'blue',
      status: 'active',
      duration: 0,
      progress: 0,
    },
    {
      id: 'validator',
      name: 'Idea Validator',
      icon: '✅',
      color: 'green',
      status: 'queue',
      duration: 0,
      progress: 0,
    },
    {
      id: 'strategist',
      name: 'Business Strategist',
      icon: '💼',
      color: 'purple',
      status: 'queue',
      duration: 0,
      progress: 0,
    },
  ]);

  const [activeAgentId, setActiveAgentId] = useState<string>('');
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Helper function to add log messages
  const addLog = (agentId: string, agentName: string, content: string, type: LogMessage['type'] = 'info', highlight = false) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      { timestamp, agentId, agentName, content, type, highlight },
    ]);
  };

  // Real WebSocket integration
  useEffect(() => {
    // Start timer
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Connect to WebSocket
    const wsUrl = getWebSocketUrl(sessionId);
    console.log('Connecting to WebSocket:', wsUrl);
    addLog('system', 'System', 'Connecting to backend...', 'info');

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      addLog('system', 'System', 'Connected! Starting workflow...', 'success');

      // Send start_workflow command with the idea_id (backend requirement)
      ws.send(JSON.stringify({
        type: 'start_workflow',
        idea_id: ideaId,
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message:', message);

      switch (message.type) {
        case 'workflow_start':
          addLog('system', 'System', 'Workflow started! Initializing agents...', 'success', true);
          break;

        case 'agent_start':
          {
            const agentName = message.agent === 'researcher' ? '🔍 Market Researcher' :
                            message.agent === 'validator' ? '✅ Idea Validator' :
                            '💼 Business Strategist';
            addLog(message.agent, agentName, 'Starting...', 'info', true);
            setActiveAgentId(message.agent);
            setAgents((prev) =>
              prev.map((a) =>
                a.id === message.agent ? { ...a, status: 'active' as AgentStatus } : a
              )
            );
          }
          break;

        case 'agent_stream':
          {
            const agentName = message.agent === 'researcher' ? '🔍 Market Researcher' :
                            message.agent === 'validator' ? '✅ Idea Validator' :
                            '💼 Business Strategist';
            addLog(message.agent, agentName, message.content, 'info');
          }
          break;

        case 'agent_output':
          {
            const agentName = message.agent === 'researcher' ? '🔍 Market Researcher' :
                            message.agent === 'validator' ? '✅ Idea Validator' :
                            '💼 Business Strategist';
            addLog(message.agent, agentName, 'Processing output data...', 'success');
            // Store output data for AgentPanel
            setAgents((prev) =>
              prev.map((a) =>
                a.id === message.agent ? { ...a, outputs: message.data } : a
              )
            );
          }
          break;

        case 'agent_complete':
          {
            const agentName = message.agent === 'researcher' ? '🔍 Market Researcher' :
                            message.agent === 'validator' ? '✅ Idea Validator' :
                            '💼 Business Strategist';
            const duration = Math.round(message.duration);
            addLog(message.agent, agentName, `Complete ✓ (${duration}s)`, 'success', true);
            setAgents((prev) =>
              prev.map((a) =>
                a.id === message.agent ? { ...a, status: 'done' as AgentStatus, duration } : a
              )
            );
          }
          break;

        case 'workflow_complete':
          addLog('system', 'System', 'All agents complete! Generating blueprint...', 'success', true);
          setActiveAgentId('');
          setTimeout(() => onComplete(), 2000);
          break;

        case 'workflow_error':
          addLog('system', 'System', `Error: ${message.error}`, 'error', true);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      addLog('system', 'System', 'Connection error. Retrying...', 'error', true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      addLog('system', 'System', 'Disconnected from backend', 'warning');
    };

    return () => {
      clearInterval(timer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId, ideaId, onComplete]);

  // Update agent progress based on elapsed time (mock)
  useEffect(() => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.status === 'active') {
          return { ...a, duration: a.duration + 1, progress: Math.min(a.progress + 3, 95) };
        }
        return a;
      })
    );
  }, [elapsedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeAgent = agents.find((a) => a.id === activeAgentId);
  const completedAgents = agents.filter((a) => a.status === 'done').length;
  const totalAgents = agents.length;
  const overallProgress = Math.round((completedAgents / totalAgents) * 100);

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              ShapeX Studio - <span className="text-razer-green">Validate Mode</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">{idea}</p>
          </div>
          <div className="text-right">
            <div className="text-gray-400">
              ⏱ {formatTime(elapsedTime)} / ~8 min
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-400">Progress:</span>
            <div className="flex gap-1">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`w-3 h-3 rounded-full ${
                    agent.status === 'done'
                      ? 'bg-razer-green'
                      : agent.status === 'active'
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">{overallProgress}% Complete</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Agent Progress Bar */}
          <AgentProgressBar agents={agents} activeAgentId={activeAgentId} />

          {/* Active Agent Panel */}
          {activeAgent && (
            <motion.div
              key={activeAgent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AgentPanel agent={activeAgent} />
            </motion.div>
          )}

          {/* Live Log */}
          <LiveLog messages={logs} />
        </div>
      </div>
    </div>
  );
}

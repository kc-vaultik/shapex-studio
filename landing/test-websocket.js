/**
 * WebSocket Integration Test Script
 *
 * This simulates the frontend WebSocket client to test the backend integration.
 * Run with: node test-websocket.js
 */

import WebSocket from 'ws';
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:8000';
const TEST_IDEA = 'AI-powered code review tool for development teams';

console.log('🧪 ShapeX Studio WebSocket Integration Test\n');
console.log('=' .repeat(60));

async function runTest() {
  try {
    // Step 1: Health Check
    console.log('\n[1/5] Testing backend health...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/studio/health`);
    const health = await healthResponse.json();
    console.log('✅ Backend healthy:', health.status);
    console.log('   Agents available:', health.agents.join(', '));

    // Step 2: Create Session
    console.log('\n[2/5] Creating validation session...');
    const sessionResponse = await fetch(`${API_BASE_URL}/api/studio/sessions/create?idea_id=52&user_id=test_user_automated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!sessionResponse.ok) {
      throw new Error(`Session creation failed: ${sessionResponse.statusText}`);
    }

    const session = await sessionResponse.json();
    console.log('✅ Session created:', session.session_id);
    console.log('   WebSocket URL:', session.websocket_url);

    // Step 3: Connect WebSocket
    console.log('\n[3/5] Connecting to WebSocket...');
    const wsUrl = `ws://localhost:8000/api/studio/ws/${session.session_id}`;
    const ws = new WebSocket(wsUrl);

    const startTime = Date.now();
    let workflowStarted = false;
    let agentsStarted = [];
    let agentsCompleted = [];
    let messageCount = 0;
    let workflowComplete = false;

    ws.on('open', () => {
      console.log('✅ WebSocket connected');

      // Step 4: Send start_workflow command
      console.log('\n[4/5] Starting workflow...');
      ws.send(JSON.stringify({
        type: 'start_workflow',
        idea_id: 52  // Backend expects idea_id, not idea_text
      }));
      console.log('📤 Sent start_workflow command with idea_id: 52');
    });

    ws.on('message', (data) => {
      messageCount++;
      const message = JSON.parse(data.toString());
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      switch (message.type) {
        case 'session_start':
          console.log(`\n⏱️  [${elapsed}s] Session started`);
          console.log(`   Idea: ${message.idea?.title || 'Unknown'}`);
          break;

        case 'workflow_start':
          workflowStarted = true;
          console.log(`\n⏱️  [${elapsed}s] Workflow started!`);
          break;

        case 'agent_start':
          if (message.agent) {
            agentsStarted.push(message.agent);
            const agentIcon = message.agent === 'researcher' ? '🔍' :
                            message.agent === 'validator' ? '✅' : '💼';
            console.log(`\n⏱️  [${elapsed}s] ${agentIcon} ${message.agent.toUpperCase()} started`);
          } else {
            console.log(`\n⏱️  [${elapsed}s] Agent started (name not provided)`);
          }
          break;

        case 'agent_stream':
          // Only log important messages to avoid spam
          if (message.content && typeof message.content === 'string') {
            if (message.content.includes('competitor') ||
                message.content.includes('score') ||
                message.content.includes('TAM') ||
                message.content.includes('pricing')) {
              console.log(`   📝 ${message.content.substring(0, 80)}...`);
            }
          }
          break;

        case 'agent_output':
          console.log(`   💾 Output data received${message.agent ? ` for ${message.agent}` : ''}`);
          break;

        case 'agent_complete':
          if (message.agent) {
            agentsCompleted.push(message.agent);
          }
          const duration = message.duration ? message.duration.toFixed(1) : 'unknown';
          const agentName = message.agent ? message.agent.toUpperCase() : 'AGENT';
          console.log(`   ✓ ${agentName} complete (${duration}s)`);
          break;

        case 'workflow_complete':
          workflowComplete = true;
          console.log(`\n⏱️  [${elapsed}s] 🎉 Workflow complete!`);
          console.log(`   Blueprint ID: ${message.blueprint_id}`);

          // Print summary
          printSummary();

          ws.close();
          process.exit(0);
          break;

        case 'workflow_error':
        case 'error':
          console.error(`\n❌ Error: ${message.error || message.message || 'Unknown error'}`);
          console.error(`   Full message:`, JSON.stringify(message, null, 2));
          ws.close();
          process.exit(1);
          break;

        default:
          console.log(`   Unknown message type: ${message.type}`);
          console.log(`   Full message:`, JSON.stringify(message, null, 2));
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      process.exit(1);
    });

    ws.on('close', () => {
      console.log('\n🔌 WebSocket disconnected');
      if (!workflowComplete) {
        console.log('⚠️  Warning: Workflow did not complete successfully');
      }
    });

    function printSummary() {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log('\n' + '='.repeat(60));
      console.log('📊 TEST SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total Duration:     ${totalTime}s`);
      console.log(`Messages Received:  ${messageCount}`);
      console.log(`Workflow Started:   ${workflowStarted ? '✅' : '❌'}`);
      console.log(`Agents Started:     ${agentsStarted.length}/3 (${agentsStarted.join(', ')})`);
      console.log(`Agents Completed:   ${agentsCompleted.length}/3 (${agentsCompleted.join(', ')})`);
      console.log(`Workflow Complete:  ${workflowComplete ? '✅' : '❌'}`);
      console.log('='.repeat(60));

      if (workflowComplete && agentsCompleted.length === 3) {
        console.log('\n✅ TEST PASSED - Full integration working!');
      } else {
        console.log('\n⚠️  TEST INCOMPLETE - Check backend logs');
      }
    }

    // Timeout after 10 minutes
    setTimeout(() => {
      console.log('\n⏱️  Test timeout (10 minutes) - closing connection');
      printSummary();
      ws.close();
      process.exit(1);
    }, 600000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

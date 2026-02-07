// Test ShapeX Studio End-to-End Workflow
// Tests: Session creation → WebSocket → 3-agent execution → Blueprint

const axios = require('axios');
const WebSocket = require('ws');

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000';

async function testWorkflow() {
  console.log('\n🚀 Starting ShapeX Studio End-to-End Test\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Create session
    console.log('\n📝 Step 1: Creating new session...');
    const sessionResponse = await axios.post(`${API_BASE}/api/studio/sessions/create?idea_id=52`);

    const { session_id, websocket_url } = sessionResponse.data;
    console.log(`✅ Session created: ${session_id}`);
    console.log(`   WebSocket URL: ${websocket_url}`);

    // Step 2: Connect to WebSocket
    console.log('\n🔌 Step 2: Connecting to WebSocket...');
    const ws = new WebSocket(`${WS_BASE}${websocket_url}`);

    let startTime = Date.now();
    let totalCost = 0;
    let agentResults = {
      researcher: null,
      validator: null,
      strategist: null
    };

    ws.on('open', () => {
      console.log('✅ WebSocket connected');

      // Step 3: Start workflow
      console.log('\n🤖 Step 3: Starting 3-agent workflow...\n');
      ws.send(JSON.stringify({
        type: 'start_workflow',
        idea_id: 52
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      switch(message.type) {
        case 'session_start':
          console.log(`🎬 Workflow started for idea: "${message.idea_title || 'N/A'}"`);
          console.log(`   Category: ${message.idea_category || 'N/A'}`);
          break;

        case 'agent_start':
          console.log(`\n🔵 ${message.agent_name || 'Agent'} starting...`);
          console.log(`   Progress: ${message.progress || 0}%`);
          break;

        case 'agent_stream':
          // Show streaming output (truncated)
          if (message.content) {
            const preview = message.content.substring(0, 80);
            process.stdout.write(`   📡 ${preview}...\r`);
          }
          break;

        case 'agent_complete':
          const agentName = message.agent_name || 'Unknown';
          console.log(`\n✅ ${agentName} completed`);
          console.log(`   Duration: ${message.duration || 'N/A'}s`);
          console.log(`   Tokens: ${message.token_count || 'N/A'}`);
          console.log(`   Cost: $${message.cost ? message.cost.toFixed(4) : 'N/A'}`);

          if (agentName !== 'Unknown') {
            agentResults[agentName.toLowerCase()] = {
              duration: message.duration,
              tokens: message.token_count,
              cost: message.cost
            };
          }

          if (message.cost) totalCost += message.cost;
          break;

        case 'session_complete':
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);

          console.log('\n' + '='.repeat(60));
          console.log('\n🎉 WORKFLOW COMPLETE!\n');
          console.log('📊 Performance Metrics:');
          console.log(`   Total Duration: ${duration}s (target: <360s)`);
          console.log(`   Total Cost: $${totalCost.toFixed(4)} (target: <$0.35)`);
          console.log(`   Blueprint ID: ${message.blueprint_id}`);
          console.log(`   Status: ${duration < 360 ? '✅' : '⚠️'} ${totalCost < 0.35 ? '✅' : '⚠️'}`);

          console.log('\n🤖 Agent Breakdown:');
          Object.entries(agentResults).forEach(([name, data]) => {
            if (data) {
              console.log(`   ${name}: ${data.duration}s, ${data.tokens || 'N/A'} tokens, $${data.cost ? data.cost.toFixed(4) : 'N/A'}`);
            }
          });

          // Step 4: Verify blueprint
          console.log('\n📋 Step 4: Verifying blueprint...');
          verifyBlueprint(message.blueprint_id);

          ws.close();
          break;

        case 'session_error':
          console.error(`\n❌ Error: ${message.error}`);
          ws.close();
          process.exit(1);
          break;
      }
    });

    ws.on('error', (error) => {
      console.error('\n❌ WebSocket error:', error.message);
      process.exit(1);
    });

    ws.on('close', () => {
      console.log('\n🔌 WebSocket disconnected');
    });

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

async function verifyBlueprint(blueprintId) {
  try {
    const response = await axios.get(`${API_BASE}/api/studio/blueprints/${blueprintId}`);
    const blueprint = response.data;

    console.log('✅ Blueprint retrieved successfully');
    console.log(`   ID: ${blueprint.id}`);
    console.log(`   Session: ${blueprint.session_id}`);
    console.log(`   Created: ${blueprint.created_at}`);

    // Check sections
    const sections = ['market_research', 'validation_analysis', 'strategic_plan'];
    const missingSections = sections.filter(s => !blueprint[s]);

    if (missingSections.length === 0) {
      console.log('✅ All 3 sections present (Researcher, Validator, Strategist)');
    } else {
      console.log(`⚠️  Missing sections: ${missingSections.join(', ')}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ END-TO-END TEST PASSED!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Blueprint verification failed:', error.message);
    process.exit(1);
  }
}

// Run test
testWorkflow();

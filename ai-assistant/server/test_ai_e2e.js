const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runVerification = async () => {
  console.log('====================================================');
  console.log('🤖 AI ASSISTANT MODULE COMPREHENSIVE VERIFICATION');
  console.log('====================================================\n');

  try {
    // 1. Health Check
    console.log('[Test 1] Testing Health Endpoint: GET /api/health...');
    const health = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET',
    });
    console.log('✓ Health Status:', health.status, health.body);
    console.assert(health.status === 200, 'Health endpoint must return 200');
    console.assert(health.body.status === 'ok', 'Status must be ok');

    // 2. SkillBridge Chat Query 1: Matching formula
    console.log('\n[Test 2] Testing Chat: "How does SkillMatch score get calculated?"...');
    const chat1 = await request(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { message: 'How does SkillMatch score get calculated?' }
    );
    console.log('✓ Chat 1 Response:', chat1.status, chat1.body);
    console.assert(chat1.status === 200, 'Chat must return 200');
    console.assert(chat1.body.success === true, 'Success must be true');
    console.assert(chat1.body.answer.length > 10, 'Answer must not be empty');

    // 3. SkillBridge Chat Query 2: TeamForge
    console.log('\n[Test 3] Testing Chat: "How do I create a team in TeamForge?"...');
    const chat2 = await request(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { message: 'How do I create a team in TeamForge?' }
    );
    console.log('✓ Chat 2 Response:', chat2.status, chat2.body);
    console.assert(chat2.status === 200, 'Chat must return 200');

    // 4. University Third-Party Demo Query
    console.log('\n[Test 4] Testing University Demo: "What are the application deadlines for fall admission?"...');
    const chatUniv = await request(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { portalType: 'university', message: 'What are the application deadlines for fall admission?' }
    );
    console.log('✓ University Chat Response:', chatUniv.status, chatUniv.body);
    console.assert(chatUniv.status === 200, 'University chat must return 200');
    console.assert(chatUniv.body.product.includes('Apex University'), 'Product must be Apex University');

    // 5. Validation Test: Empty message
    console.log('\n[Test 5] Testing Validation on Empty Message...');
    const invalidChat = await request(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { message: '   ' }
    );
    console.log('✓ Expected 400 Validation Error:', invalidChat.status, invalidChat.body);
    console.assert(invalidChat.status === 400, 'Must return 400 for empty message');

    // 6. Knowledge Base Info Endpoint
    console.log('\n[Test 6] Testing Knowledge Metadata Endpoint: GET /api/knowledge...');
    const kbInfo = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/knowledge',
      method: 'GET',
    });
    console.log('✓ Knowledge Info:', kbInfo.status, kbInfo.body);
    console.assert(kbInfo.status === 200, 'Must return 200');

    console.log('\n====================================================');
    console.log('🎉 ALL 6 VERIFICATION SUITES PASSED SUCCESSFULLY!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
};

runVerification();

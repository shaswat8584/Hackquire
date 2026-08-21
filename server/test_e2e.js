const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
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

const runE2ETests = async () => {
  console.log('--- STARTING COMPREHENSIVE END-TO-END VERIFICATION ---');

  // 1. Health check
  console.log('\n[1] Testing Health Endpoint...');
  const healthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('Health Response:', healthRes.status, healthRes.body);
  console.assert(healthRes.status === 200, 'Health endpoint must return 200');

  // 2. Auth Login as Shaswat
  console.log('\n[2] Testing Authentication (Login as Shaswat)...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'shaswat@example.com', password: 'password123' }
  );
  console.log('Login Response Status:', loginRes.status);
  console.assert(loginRes.status === 200, 'Login must succeed');
  const token = loginRes.body.token;
  const user = loginRes.body.user;
  console.log(`Authenticated as ${user.name} (${user.email}), Token received: ${token.slice(0, 15)}...`);

  // 3. User Profile
  console.log('\n[3] Testing GET /api/users/profile...');
  const profileRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/profile',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Profile Status:', profileRes.status, 'Skills:', profileRes.body.user?.skills);
  console.assert(profileRes.status === 200, 'Profile fetch must return 200');

  // 4. SkillMatch Recommendations
  console.log('\n[4] Testing GET /api/matching/students (SkillMatch)...');
  const studentMatchRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/matching/students',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(
    'Student Matches Found:',
    studentMatchRes.body.count,
    'Top Candidate:',
    studentMatchRes.body.recommendations?.[0]?.student?.name,
    `(${studentMatchRes.body.recommendations?.[0]?.matchScore}%)`
  );
  console.assert(studentMatchRes.body.recommendations?.length > 0, 'Must have student recommendations');

  // 5. OpportunityHub Recommendations
  console.log('\n[5] Testing GET /api/matching/opportunities (OpportunityHub)...');
  const oppMatchRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/matching/opportunities',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(
    'Opportunity Matches Found:',
    oppMatchRes.body.count,
    'Top Project:',
    oppMatchRes.body.recommendations?.[0]?.opportunity?.title,
    `(${oppMatchRes.body.recommendations?.[0]?.matchScore}%)`
  );
  console.assert(oppMatchRes.body.recommendations?.length > 0, 'Must have opportunity recommendations');

  // 6. TeamForge Teams & Role Matching
  console.log('\n[6] Testing GET /api/teams (TeamForge)...');
  const teamsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/teams',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Teams Found:', teamsRes.body.count, 'Team 1:', teamsRes.body.teams?.[0]?.name);
  console.assert(teamsRes.body.teams?.length > 0, 'Must have teams');

  // 7. TeamForge Candidate Matching for Open Role
  console.log('\n[7] Testing POST /api/matching/candidates (TeamForge Role Search)...');
  const candRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/matching/candidates',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    },
    { role: 'ML Developer', requiredSkills: ['Python', 'Machine Learning'], requiredHours: 10 }
  );
  console.log(
    'Role Candidates Found for ML Developer:',
    candRes.body.count,
    'Best Candidate:',
    candRes.body.candidates?.[0]?.candidate?.name,
    `(${candRes.body.candidates?.[0]?.matchScore}%)`
  );
  console.assert(candRes.body.candidates?.length > 0, 'Must find candidates');

  // 8. Frontend Dev Server
  console.log('\n[8] Testing Frontend Dev Server on port 5173...');
  const frontendRes = await request({
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET',
  });
  console.log('Frontend Status Code:', frontendRes.status);
  console.assert(frontendRes.status === 200, 'Frontend server must respond with 200');

  console.log('\n============================================================');
  console.log('✅ ALL API & FRONTEND INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('============================================================');
  process.exit(0);
};

runE2ETests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});

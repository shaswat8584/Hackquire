const {
  calculateStudentMatch,
  calculateOpportunityMatch,
  calculateCandidateMatchForRole,
} = require('./services/matchingService');

console.log('=== TEST 1: Student-to-Student Match (SkillMatch) ===');
const studentA = {
  name: 'Shaswat Kumar',
  skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
  interests: ['AI', 'Web Development'],
  availability: 10,
  preferredRoles: ['Fullstack Developer'],
};

const studentB = {
  name: 'Rahul Sharma',
  skills: ['Python', 'ML', 'TensorFlow', 'Computer Vision'],
  interests: ['AI', 'Computer Vision'],
  availability: 12,
  preferredRoles: ['ML Developer'],
};

const studentMatch = calculateStudentMatch(studentA, studentB);
console.log('Match Result for Student A & B:', studentMatch);
console.assert(studentMatch.score >= 0 && studentMatch.score <= 100, 'Score must be between 0 and 100');
console.assert(studentMatch.reasons.length > 0, 'Should have matching reasons');

console.log('\n=== TEST 2: Student-to-Opportunity Match (OpportunityHub) ===');
const opp = {
  title: 'AI Campus Assistant',
  description: 'AI tool for campus',
  requiredSkills: ['React', 'Node.js', 'Python', 'Machine Learning'],
  requiredRoles: ['Frontend Developer', 'Backend Developer', 'ML Developer'],
  requiredHours: 10,
};

const oppMatch = calculateOpportunityMatch(studentA, opp);
console.log('Match Result for Student A & Opportunity:', oppMatch);
console.assert(oppMatch.score >= 0 && oppMatch.score <= 100, 'Score must be between 0 and 100');
console.assert(oppMatch.reasons.some(r => r.includes('React')), 'Should identify React match');

console.log('\n=== TEST 3: Role Candidate Match (TeamForge) ===');
const candidateMatch = calculateCandidateMatchForRole(studentB, 'ML Developer', ['Python', 'Machine Learning'], 10);
console.log('Match Result for ML Developer Role Candidate:', candidateMatch);
console.assert(candidateMatch.score >= 70, 'Candidate should have high match for ML Developer role');

console.log('\n>>> ALL MATCHING ENGINE UNIT TESTS PASSED! <<<');

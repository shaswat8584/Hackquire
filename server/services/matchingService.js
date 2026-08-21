/**
 * SkillBridge Intelligent Matching Engine
 * Pure JavaScript matching algorithm implementing the 60/20/20 compatibility model
 * 
 * Formula:
 * - Skill Match: 60%
 * - Interest Match: 20%
 * - Availability Match: 20%
 * - Total Match Score: 0 to 100%
 * 
 * Reusable across:
 * 1. SkillMatch (Student-to-Student matching)
 * 2. OpportunityHub (Student-to-Opportunity matching)
 * 3. TeamForge (Student-to-Team/Role candidate matching)
 */

// Helper to normalize strings for robust comparison (e.g. "react.js" vs "React")
const normalize = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[\s\-_.]/g, '');
};

/**
 * 1. Student to Student Matching (SkillMatch)
 */
const calculateStudentMatch = (currentStudent, targetStudent) => {
  if (!currentStudent || !targetStudent) {
    return { score: 0, breakdown: { skill: 0, interest: 0, availability: 0 }, reasons: [] };
  }

  const reasons = [];

  // --- A. SKILL MATCH (60% Weight) ---
  const currentSkillsNorm = (currentStudent.skills || []).map(normalize);
  const targetSkillsNorm = (targetStudent.skills || []).map(normalize);

  // Check matching skills and complementary skills
  const matchingSkills = [];
  const complementarySkills = [];

  (targetStudent.skills || []).forEach((skill) => {
    const norm = normalize(skill);
    if (currentSkillsNorm.includes(norm)) {
      matchingSkills.push(skill);
    } else {
      complementarySkills.push(skill);
    }
  });

  let skillScore = 0;
  if (targetSkillsNorm.length > 0) {
    // Both common skills and complementary diverse skills add value
    const matchRatio = matchingSkills.length / Math.max(1, Math.min(targetSkillsNorm.length, 5));
    const compRatio = Math.min(complementarySkills.length, 3) / 3;
    
    // Balanced blend of common grounding + complementary skillset
    const totalSkillRatio = Math.min(1, matchRatio * 0.6 + compRatio * 0.4);
    skillScore = Math.round(totalSkillRatio * 60);
  } else {
    skillScore = 20; // baseline if no skills listed yet
  }

  if (matchingSkills.length > 0) {
    reasons.push(`✓ Shared technical skills: ${matchingSkills.slice(0, 3).join(', ')}`);
  }
  if (complementarySkills.length > 0) {
    reasons.push(`✓ Complementary skills: ${complementarySkills.slice(0, 3).join(', ')}`);
  }

  // --- B. INTEREST MATCH (20% Weight) ---
  const currentInterestsNorm = (currentStudent.interests || []).map(normalize);
  const targetInterestsNorm = (targetStudent.interests || []).map(normalize);

  const sharedInterests = [];
  (targetStudent.interests || []).forEach((interest) => {
    if (currentInterestsNorm.includes(normalize(interest))) {
      sharedInterests.push(interest);
    }
  });

  let interestScore = 0;
  if (targetInterestsNorm.length > 0 && currentInterestsNorm.length > 0) {
    const interestRatio = Math.min(1, sharedInterests.length / Math.max(1, currentInterestsNorm.length));
    interestScore = Math.round(interestRatio * 20);
  } else {
    interestScore = 10; // Neutral baseline
  }

  if (sharedInterests.length > 0) {
    reasons.push(`✓ Shared interest in ${sharedInterests.join(', ')}`);
  } else {
    reasons.push(`• Diverse project interest domains`);
  }

  // --- C. AVAILABILITY MATCH (20% Weight) ---
  const currentAvail = Number(currentStudent.availability) || 10;
  const targetAvail = Number(targetStudent.availability) || 10;

  // Measure hours compatibility (closer hours = higher score)
  const diff = Math.abs(currentAvail - targetAvail);
  let availRatio = 1 - Math.min(diff / 20, 1);
  const availScore = Math.round(availRatio * 20);

  if (diff <= 5) {
    reasons.push(`✓ Compatible availability (~${targetAvail} hrs/week)`);
  } else {
    reasons.push(`• Availability is ${targetAvail} hrs/week (vs your ${currentAvail} hrs/week)`);
  }

  // Role compatibility bonus/reason
  const targetRoles = targetStudent.preferredRoles || [];
  if (targetRoles.length > 0) {
    reasons.push(`✓ Suitable for roles: ${targetRoles.slice(0, 2).join(', ')}`);
  }

  const totalScore = Math.min(100, Math.max(0, skillScore + interestScore + availScore));

  return {
    score: totalScore,
    breakdown: {
      skill: skillScore,
      interest: interestScore,
      availability: availScore,
      maxSkill: 60,
      maxInterest: 20,
      maxAvailability: 20,
    },
    reasons,
  };
};

/**
 * 2. Student to Opportunity Matching (OpportunityHub)
 */
const calculateOpportunityMatch = (student, opportunity) => {
  if (!student || !opportunity) {
    return { score: 0, breakdown: { skill: 0, interest: 0, availability: 0 }, reasons: [] };
  }

  const reasons = [];

  // --- A. SKILL MATCH (60% Weight) ---
  const studentSkillsNorm = (student.skills || []).map(normalize);
  const requiredSkills = opportunity.requiredSkills || [];

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((reqSkill) => {
    if (studentSkillsNorm.includes(normalize(reqSkill))) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  let skillRatio = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) : 1;
  const skillScore = Math.round(skillRatio * 60);

  matchedSkills.forEach((s) => reasons.push(`✓ ${s} matches`));
  missingSkills.slice(0, 2).forEach((s) => reasons.push(`✗ ${s} missing`));

  // --- B. INTEREST & ROLE MATCH (20% Weight) ---
  const studentInterestsNorm = (student.interests || []).map(normalize);
  const studentRolesNorm = (student.preferredRoles || []).map(normalize);
  const reqRolesNorm = (opportunity.requiredRoles || []).map(normalize);

  let interestHit = false;
  (student.interests || []).forEach((interest) => {
    const norm = normalize(interest);
    if (
      normalize(opportunity.title).includes(norm) ||
      normalize(opportunity.description).includes(norm) ||
      studentInterestsNorm.includes(norm)
    ) {
      if (!interestHit) {
        reasons.push(`✓ ${interest} interest matches`);
        interestHit = true;
      }
    }
  });

  let roleHit = false;
  (opportunity.requiredRoles || []).forEach((role) => {
    if (studentRolesNorm.includes(normalize(role))) {
      if (!roleHit) {
        reasons.push(`✓ Suitable for required role: ${role}`);
        roleHit = true;
      }
    }
  });

  let interestScore = 0;
  if (interestHit && roleHit) {
    interestScore = 20;
  } else if (interestHit || roleHit) {
    interestScore = 15;
  } else {
    interestScore = 10;
  }

  // --- C. AVAILABILITY MATCH (20% Weight) ---
  const studentHours = Number(student.availability) || 10;
  const reqHours = Number(opportunity.requiredHours) || 10;

  let availScore = 0;
  if (studentHours >= reqHours) {
    availScore = 20;
    reasons.push(`✓ Meets required commitment (${reqHours} hrs/week)`);
  } else {
    const diff = reqHours - studentHours;
    const ratio = Math.max(0, 1 - (diff / reqHours));
    availScore = Math.round(ratio * 20);
    reasons.push(`• Requires ${reqHours} hrs/week (you indicated ${studentHours} hrs/week)`);
  }

  const totalScore = Math.min(100, Math.max(0, skillScore + interestScore + availScore));

  return {
    score: totalScore,
    breakdown: {
      skill: skillScore,
      interest: interestScore,
      availability: availScore,
      maxSkill: 60,
      maxInterest: 20,
      maxAvailability: 20,
    },
    reasons,
    matchedSkills,
    missingSkills,
  };
};

/**
 * 3. Role Candidate Matching for TeamForge
 * Evaluates candidate fit for a specific open role in a team
 */
const calculateCandidateMatchForRole = (candidate, targetRole, requiredSkills = [], requiredHours = 10) => {
  if (!candidate) {
    return { score: 0, breakdown: { skill: 0, interest: 0, availability: 0 }, reasons: [] };
  }

  const reasons = [];

  // 1. Role fit
  const candidateRolesNorm = (candidate.preferredRoles || []).map(normalize);
  const targetRoleNorm = normalize(targetRole);
  const roleExactMatch = candidateRolesNorm.some(r => r.includes(targetRoleNorm) || targetRoleNorm.includes(r));

  // 2. Skill match
  const candidateSkillsNorm = (candidate.skills || []).map(normalize);
  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((req) => {
    if (candidateSkillsNorm.includes(normalize(req))) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  let skillRatio = 0.5;
  if (requiredSkills.length > 0) {
    skillRatio = matchedSkills.length / requiredSkills.length;
  } else if (candidate.skills && candidate.skills.length > 0) {
    skillRatio = 0.8;
  }

  // Weight skill (60%)
  const skillScore = Math.round(skillRatio * 60);

  if (matchedSkills.length > 0) {
    reasons.push(`✓ Skills match: ${matchedSkills.join(', ')}`);
  }
  if (missingSkills.length > 0) {
    reasons.push(`✗ Missing: ${missingSkills.slice(0, 2).join(', ')}`);
  }

  // 3. Interest / Role alignment (20%)
  let interestScore = roleExactMatch ? 20 : 12;
  if (roleExactMatch) {
    reasons.push(`✓ Actively seeking ${targetRole} positions`);
  }

  // 4. Availability (20%)
  const candHours = Number(candidate.availability) || 10;
  const availRatio = candHours >= requiredHours ? 1 : Math.max(0.4, candHours / requiredHours);
  const availScore = Math.round(availRatio * 20);

  if (candHours >= requiredHours) {
    reasons.push(`✓ Has required availability (${candHours} hrs/wk)`);
  } else {
    reasons.push(`• Available ${candHours} hrs/wk`);
  }

  const totalScore = Math.min(100, Math.max(0, skillScore + interestScore + availScore));

  return {
    score: totalScore,
    breakdown: {
      skill: skillScore,
      interest: interestScore,
      availability: availScore,
    },
    reasons,
  };
};

module.exports = {
  calculateStudentMatch,
  calculateOpportunityMatch,
  calculateCandidateMatchForRole,
};

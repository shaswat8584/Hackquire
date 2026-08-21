const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const {
  calculateStudentMatch,
  calculateOpportunityMatch,
  calculateCandidateMatchForRole,
} = require('../services/matchingService');

// @desc    Get recommended students for collaboration (SkillMatch)
// @route   GET /api/matching/students
// @access  Private
const getRecommendedStudents = async (req, res) => {
  try {
    const currentStudent = await User.findById(req.user._id);
    if (!currentStudent) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { skill, interest, role, minAvailability } = req.query;

    const query = { _id: { $ne: currentStudent._id } };

    if (skill) {
      query.skills = { $regex: new RegExp(skill, 'i') };
    }
    if (interest) {
      query.interests = { $regex: new RegExp(interest, 'i') };
    }
    if (role) {
      query.preferredRoles = { $regex: new RegExp(role, 'i') };
    }
    if (minAvailability) {
      query.availability = { $gte: Number(minAvailability) };
    }

    const otherStudents = await User.find(query).select('-password');

    // Calculate match scores for all candidates
    const recommendations = otherStudents.map((target) => {
      const matchResult = calculateStudentMatch(currentStudent, target);
      return {
        student: target,
        matchScore: matchResult.score,
        breakdown: matchResult.breakdown,
        reasons: matchResult.reasons,
      };
    });

    // Sort by highest match score first
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('[SkillMatch Controller Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error computing student matches' });
  }
};

// @desc    Get recommended opportunities for current student (OpportunityHub)
// @route   GET /api/matching/opportunities
// @access  Private
const getRecommendedOpportunities = async (req, res) => {
  try {
    const currentStudent = await User.findById(req.user._id);
    if (!currentStudent) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { type, skill, role } = req.query;
    const query = {};

    if (type && type !== 'All') {
      query.type = type;
    }
    if (skill) {
      query.requiredSkills = { $regex: new RegExp(skill, 'i') };
    }
    if (role) {
      query.requiredRoles = { $regex: new RegExp(role, 'i') };
    }

    const opportunities = await Opportunity.find(query).populate('createdBy', 'name email profileImage');

    const recommendations = opportunities.map((opp) => {
      const matchResult = calculateOpportunityMatch(currentStudent, opp);
      const hasApplied = (opp.applicants || []).some(
        (app) => app.user && app.user.toString() === currentStudent._id.toString()
      );

      return {
        opportunity: opp,
        matchScore: matchResult.score,
        breakdown: matchResult.breakdown,
        reasons: matchResult.reasons,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        hasApplied,
      };
    });

    // Sort by highest match score first
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('[Opportunity Matching Controller Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error computing opportunity matches' });
  }
};

// @desc    Find suitable student candidates for a specific team role (TeamForge)
// @route   POST /api/matching/candidates
// @access  Private
const getCandidatesForRole = async (req, res) => {
  try {
    const { role, requiredSkills, requiredHours, excludeUserIds = [] } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Please specify the role to match for' });
    }

    // Exclude current user and existing team members
    const excludeList = [req.user._id, ...excludeUserIds];
    const candidatePool = await User.find({ _id: { $nin: excludeList } }).select('-password');

    const candidates = candidatePool.map((cand) => {
      const matchResult = calculateCandidateMatchForRole(
        cand,
        role,
        requiredSkills || [],
        requiredHours || 10
      );

      return {
        candidate: cand,
        matchScore: matchResult.score,
        breakdown: matchResult.breakdown,
        reasons: matchResult.reasons,
      };
    });

    // Sort candidates by match score
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      role,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error('[Candidate Matching Controller Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error finding role candidates' });
  }
};

module.exports = {
  getRecommendedStudents,
  getRecommendedOpportunities,
  getCandidatesForRole,
};

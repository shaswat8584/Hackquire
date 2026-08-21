const Opportunity = require('../models/Opportunity');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
const getAllOpportunities = async (req, res) => {
  try {
    const { type, skill, role, search } = req.query;
    const filter = {};

    if (type && type !== 'All') {
      filter.type = type;
    }
    if (skill) {
      filter.requiredSkills = { $regex: new RegExp(skill, 'i') };
    }
    if (role) {
      filter.requiredRoles = { $regex: new RegExp(role, 'i') };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $regex: search, $options: 'i' } },
        { requiredRoles: { $regex: search, $options: 'i' } },
      ];
    }

    const opportunities = await Opportunity.find(filter)
      .populate('createdBy', 'name email profileImage bio')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: opportunities.length, opportunities });
  } catch (error) {
    console.error('[Get Opportunities Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching opportunities' });
  }
};

// @desc    Get single opportunity by ID
// @route   GET /api/opportunities/:id
// @access  Public
const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('createdBy', 'name email profileImage bio availability skills')
      .populate('applicants.user', 'name email profileImage skills availability preferredRoles');

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    res.json({ success: true, opportunity });
  } catch (error) {
    console.error('[Get Opportunity By ID Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching opportunity' });
  }
};

// @desc    Create a new opportunity
// @route   POST /api/opportunities
// @access  Private
const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      requiredSkills,
      requiredRoles,
      duration,
      requiredHours,
      deadline,
    } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ success: false, message: 'Please provide title, description and type' });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      type: type || 'Project',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      requiredRoles: Array.isArray(requiredRoles) ? requiredRoles : (requiredRoles ? requiredRoles.split(',').map(r => r.trim()) : []),
      duration: duration || '4 weeks',
      requiredHours: requiredHours ? Number(requiredHours) : 10,
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: req.user._id,
    });

    const populated = await Opportunity.findById(opportunity._id).populate('createdBy', 'name email profileImage');

    res.status(201).json({ success: true, opportunity: populated });
  } catch (error) {
    console.error('[Create Opportunity Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating opportunity' });
  }
};

// @desc    Apply to an opportunity
// @route   POST /api/opportunities/:id/apply
// @access  Private
const applyToOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    if (opportunity.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own opportunity' });
    }

    const alreadyApplied = opportunity.applicants.some(
      (app) => app.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied to this opportunity' });
    }

    const { role, message } = req.body;

    opportunity.applicants.push({
      user: req.user._id,
      role: role || (opportunity.requiredRoles && opportunity.requiredRoles[0]) || 'Contributor',
      message: message || '',
      status: 'pending',
      appliedAt: new Date(),
    });

    await opportunity.save();

    res.json({ success: true, message: 'Application submitted successfully', opportunity });
  } catch (error) {
    console.error('[Apply Opportunity Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error applying to opportunity' });
  }
};

// @desc    Get current user's submitted applications
// @route   GET /api/opportunities/my/applications
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      'applicants.user': req.user._id,
    }).populate('createdBy', 'name email profileImage');

    const myApplications = [];
    opportunities.forEach((opp) => {
      const app = opp.applicants.find((a) => a.user.toString() === req.user._id.toString());
      if (app) {
        myApplications.push({
          opportunityId: opp._id,
          title: opp.title,
          type: opp.type,
          creator: opp.createdBy,
          role: app.role,
          status: app.status,
          appliedAt: app.appliedAt,
          duration: opp.duration,
        });
      }
    });

    res.json({ success: true, count: myApplications.length, applications: myApplications });
  } catch (error) {
    console.error('[Get My Applications Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching applications' });
  }
};

module.exports = {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  applyToOpportunity,
  getMyApplications,
};

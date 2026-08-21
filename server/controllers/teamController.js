const Team = require('../models/Team');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// @desc    Get all teams for user (owned or member) + explore public teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res) => {
  try {
    const userId = req.user._id;
    const { filter } = req.query; // 'my' or 'all'

    let query = {};
    if (filter === 'my') {
      query = {
        $or: [
          { owner: userId },
          { 'members.user': userId },
        ],
      };
    }

    const teams = await Team.find(query)
      .populate('owner', 'name email profileImage bio')
      .populate('opportunity', 'title type requiredSkills requiredRoles duration requiredHours')
      .populate('members.user', 'name email profileImage skills availability preferredRoles')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: teams.length, teams });
  } catch (error) {
    console.error('[Get Teams Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching teams' });
  }
};

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email profileImage bio skills')
      .populate('opportunity', 'title description type requiredSkills requiredRoles duration requiredHours')
      .populate('members.user', 'name email profileImage skills availability preferredRoles');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.json({ success: true, team });
  } catch (error) {
    console.error('[Get Team By ID Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error fetching team' });
  }
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  try {
    const { name, description, opportunityId, requiredRoles, ownerRole } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a team name' });
    }

    let rolesList = requiredRoles || [];
    if (typeof rolesList === 'string') {
      rolesList = rolesList.split(',').map(r => r.trim()).filter(Boolean);
    }

    // Default required roles if none specified
    if (rolesList.length === 0) {
      rolesList = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'];
    }

    const initialOwnerRole = ownerRole || 'Team Lead';

    const team = await Team.create({
      name,
      description: description || '',
      opportunity: opportunityId || null,
      owner: req.user._id,
      requiredRoles: rolesList,
      members: [
        {
          user: req.user._id,
          role: initialOwnerRole,
          status: 'accepted',
          joinedAt: new Date(),
        },
      ],
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email profileImage bio')
      .populate('opportunity', 'title type requiredSkills')
      .populate('members.user', 'name email profileImage skills availability preferredRoles');

    res.status(201).json({ success: true, team: populatedTeam });
  } catch (error) {
    console.error('[Create Team Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating team' });
  }
};

// @desc    Invite student to team
// @route   POST /api/teams/:id/invite
// @access  Private
const inviteMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Only owner can invite
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only team owner can invite members' });
    }

    // Check if user exists
    const candidate = await User.findById(userId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Student to invite not found' });
    }

    // Check if already in members
    const existingMember = team.members.find((m) => m.user.toString() === userId.toString());
    if (existingMember) {
      if (existingMember.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Student is already an active member of this team' });
      } else if (existingMember.status === 'pending') {
        return res.status(400).json({ success: false, message: 'An invitation is already pending for this student' });
      } else {
        // Re-invite if previously rejected
        existingMember.status = 'pending';
        existingMember.role = role || existingMember.role;
      }
    } else {
      team.members.push({
        user: userId,
        role: role || 'Contributor',
        status: 'pending',
        joinedAt: new Date(),
      });
    }

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email profileImage bio')
      .populate('opportunity', 'title type requiredSkills')
      .populate('members.user', 'name email profileImage skills availability preferredRoles');

    res.json({ success: true, message: `Invitation sent to ${candidate.name}`, team: populatedTeam });
  } catch (error) {
    console.error('[Invite Member Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error inviting student' });
  }
};

// @desc    Update team member status (accept/reject invite, update role, remove member)
// @route   PUT /api/teams/:id/members
// @access  Private
const updateTeamMember = async (req, res) => {
  try {
    const { userId, action, role } = req.body; // action: 'accept' | 'reject' | 'remove' | 'update_role'
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const currentUserId = req.user._id.toString();
    const targetUserId = (userId || req.user._id).toString();
    const isOwner = team.owner.toString() === currentUserId;

    const memberIndex = team.members.findIndex((m) => m.user.toString() === targetUserId);
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: 'Member not found in team' });
    }

    if (action === 'accept') {
      if (targetUserId !== currentUserId && !isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to accept this invitation' });
      }
      team.members[memberIndex].status = 'accepted';
    } else if (action === 'reject') {
      if (targetUserId !== currentUserId && !isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to reject this invitation' });
      }
      team.members[memberIndex].status = 'rejected';
    } else if (action === 'remove') {
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Only the team owner can remove members' });
      }
      if (targetUserId === team.owner.toString()) {
        return res.status(400).json({ success: false, message: 'Team owner cannot be removed' });
      }
      team.members.splice(memberIndex, 1);
    } else if (action === 'update_role') {
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Only the team owner can assign roles' });
      }
      if (role) {
        team.members[memberIndex].role = role;
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid member action' });
    }

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email profileImage bio')
      .populate('opportunity', 'title type requiredSkills')
      .populate('members.user', 'name email profileImage skills availability preferredRoles');

    res.json({ success: true, message: `Team member updated successfully`, team: populatedTeam });
  } catch (error) {
    console.error('[Update Member Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating team member' });
  }
};

// @desc    Leave a team
// @route   POST /api/teams/:id/leave
// @access  Private
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const currentUserId = req.user._id.toString();
    if (team.owner.toString() === currentUserId) {
      return res.status(400).json({ success: false, message: 'Team owner cannot leave. Transfer ownership or delete team.' });
    }

    const memberIndex = team.members.findIndex((m) => m.user.toString() === currentUserId);
    if (memberIndex === -1) {
      return res.status(400).json({ success: false, message: 'You are not a member of this team' });
    }

    team.members.splice(memberIndex, 1);
    await team.save();

    res.json({ success: true, message: 'Successfully left the team' });
  } catch (error) {
    console.error('[Leave Team Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server error leaving team' });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  inviteMember,
  updateTeamMember,
  leaveTeam,
};

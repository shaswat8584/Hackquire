const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  inviteMember,
  updateTeamMember,
  leaveTeam,
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTeams)
  .post(protect, createTeam);

router.route('/:id')
  .get(protect, getTeamById);

router.post('/:id/invite', protect, inviteMember);
router.put('/:id/members', protect, updateTeamMember);
router.post('/:id/leave', protect, leaveTeam);

module.exports = router;

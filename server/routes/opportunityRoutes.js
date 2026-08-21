const express = require('express');
const router = express.Router();
const {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  applyToOpportunity,
  getMyApplications,
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllOpportunities)
  .post(protect, createOpportunity);

router.get('/my/applications', protect, getMyApplications);

router.route('/:id')
  .get(getOpportunityById);

router.post('/:id/apply', protect, applyToOpportunity);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getRecommendedStudents,
  getRecommendedOpportunities,
  getCandidatesForRole,
} = require('../controllers/matchingController');
const { protect } = require('../middleware/authMiddleware');

// Protected matching endpoints
router.get('/students', protect, getRecommendedStudents);
router.get('/opportunities', protect, getRecommendedOpportunities);
router.post('/candidates', protect, getCandidatesForRole);

module.exports = router;

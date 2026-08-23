const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getMyConnections,
  getConnectionStatuses,
} = require('../controllers/connectionController');

// All connection routes are protected
router.use(protect);

router.get('/', getMyConnections);
router.get('/statuses', getConnectionStatuses);
router.post('/request/:recipientId', sendConnectionRequest);
router.put('/:id/accept', acceptConnectionRequest);
router.put('/:id/reject', rejectConnectionRequest);
router.delete('/:id/cancel', cancelConnectionRequest);
router.delete('/:id', removeConnection);

module.exports = router;

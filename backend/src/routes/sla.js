const express = require('express');
const router = express.Router();
const { getSLAPolicies, getSLAPolicy, createSLAPolicy, updateSLAPolicy, deleteSLAPolicy } = require('../controllers/slaController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.route('/')
  .get(getSLAPolicies)
  .post(createSLAPolicy);

router.route('/:id')
  .get(getSLAPolicy)
  .put(updateSLAPolicy)
  .delete(deleteSLAPolicy);

module.exports = router;

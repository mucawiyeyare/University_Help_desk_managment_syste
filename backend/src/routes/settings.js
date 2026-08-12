const express = require('express');
const router = express.Router();
const { getSettings, getSetting, updateSetting, getPublicSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/public', getPublicSettings);

router.use(protect, authorize('admin'));

router.get('/', getSettings);
router.get('/:key', getSetting);
router.put('/:key', updateSetting);

module.exports = router;

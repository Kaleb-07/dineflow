const router = require('express').Router();
const { getSettings, updateSettings, updateTheme, updateMedia } = require('../controllers/settingsController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getSettings);
router.patch('/', auth, updateSettings);
router.patch('/theme', auth, updateTheme);
router.patch('/media', auth, updateMedia);

module.exports = router;

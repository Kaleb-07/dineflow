const router = require('express').Router();
const {
  getSettings, updateSettings, updateTheme,
  updateMedia, updateAccount, deleteVenue
} = require('../controllers/settingsController');
const { auth } = require('../middleware/auth');

router.get('/',          auth, getSettings);
router.patch('/',        auth, updateSettings);
router.patch('/theme',   auth, updateTheme);
router.patch('/media',   auth, updateMedia);
router.patch('/account', auth, updateAccount);
router.delete('/venue',  auth, deleteVenue);

module.exports = router;

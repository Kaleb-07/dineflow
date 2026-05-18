const router = require('express').Router();
const { bulkUploadMenu } = require('../controllers/bulkController');
const { auth } = require('../middleware/auth');

router.post('/menu', auth, bulkUploadMenu);

module.exports = router;

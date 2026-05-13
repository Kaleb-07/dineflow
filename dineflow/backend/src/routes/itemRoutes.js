const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/itemController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getAll);
router.post('/', auth, create);
router.patch('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;

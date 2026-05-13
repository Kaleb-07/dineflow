const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity
} = require('../controllers/amenityController');

// All routes require auth + admin
router.use(auth, adminAuth);

router.get('/', getAmenities);
router.post('/', createAmenity);
router.patch('/:id', updateAmenity);
router.delete('/:id', deleteAmenity);

module.exports = router;

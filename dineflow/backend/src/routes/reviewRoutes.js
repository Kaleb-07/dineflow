const router = require('express').Router();
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

// GET all reviews for this venue
router.get('/', auth, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { venueId: req.user.venueId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// PATCH — the toggle visibility
router.patch('/:id', auth, async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: Number(req.params.id) },
      data:  { isVisible: req.body.isVisible }
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;

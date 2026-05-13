const router = require('express').Router();
const prisma = require('../lib/prisma');

// GET /api/public/:slug — everything the guest menu needs in one call
router.get('/:slug', async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { slug: req.params.slug },
      include: {
        theme: true,
        amenities: { orderBy: { sortOrder: 'asc' } },
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                variants: {
                  where: { isAvailable: true },
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        },
        reviews: {
          where: { isVisible: true },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

// POST /api/public/:slug/review — guest submits review
router.post('/:slug/review', async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({ where: { slug: req.params.slug } });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });

    const { type, rating, guestName, comment } = req.body;
    const review = await prisma.review.create({
      data: { type, rating, guestName, comment, venueId: venue.id }
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// PATCH /api/public/qr/:id/scan — increment scan count
router.patch('/qr/:id/scan', async (req, res) => {
  try {
    await prisma.qRCode.update({
      where: { id: Number(req.params.id) },
      data: { scanCount: { increment: 1 } }
    });
    res.json({ ok: true });
  } catch {
    res.json({ ok: true }); // silent fail — never block guest menu
  }
});

module.exports = router;

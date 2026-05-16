const router = require('express').Router();
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

// Sync — delete all and recreate (simplest for drag-drop lists)
router.post('/sync', auth, async (req, res) => {
  try {
    const amenities = req.body; // array of { name, icon }
    await prisma.amenity.deleteMany({ where: { venueId: req.user.venueId } });
    
    if (amenities.length > 0) {
      await prisma.amenity.createMany({
        data: amenities.map((a, i) => ({
          name: a.name,
          icon: a.icon,
          sortOrder: i,
          venueId: req.user.venueId
        }))
      });
    }
    
    const created = await prisma.amenity.findMany({
      where: { venueId: req.user.venueId },
      orderBy: { sortOrder: 'asc' }
    });
    
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

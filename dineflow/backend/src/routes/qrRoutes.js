const router = require('express').Router();
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const qrCodes = await prisma.qRCode.findMany({
      where: { venueId: req.user.venueId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { label, type, url } = req.body;
    const qr = await prisma.qRCode.create({
      data: { label, type, url, venueId: req.user.venueId }
    });
    res.status(201).json(qr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.qRCode.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

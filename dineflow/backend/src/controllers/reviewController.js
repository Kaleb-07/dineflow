const prisma = require('../lib/prisma');

const getReviews = async (req, res) => {
  try {
    const { menuItemId } = req.query;
    const where = menuItemId ? { menuItemId: parseInt(menuItemId) } : {};
    
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        menuItem: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { rating, comment, menuItemId } = req.body;
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        userId: req.user.id,
        menuItemId: parseInt(menuItemId)
      },
      include: {
        user: { select: { name: true } },
        menuItem: { select: { name: true } }
      }
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getReviews, createReview, deleteReview };

const prisma = require('../lib/prisma');

const getAll = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { venueId: req.user.venueId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const create = async (req, res) => {
  try {
    const { name, type, icon, sortOrder } = req.body;
    const category = await prisma.category.create({
      data: { name, type, icon, sortOrder, venueId: req.user.venueId }
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const update = async (req, res) => {
  try {
    const { name, type, icon, sortOrder, isActive } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name, type, icon, sortOrder, isActive }
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

module.exports = { getAll, create, update, remove };

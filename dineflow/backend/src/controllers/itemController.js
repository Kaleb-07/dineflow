const prisma = require('../lib/prisma');

const getAll = async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { venueId: req.user.venueId },
      orderBy: { sortOrder: 'asc' },
      include: { variants: { orderBy: { sortOrder: 'asc' } }, category: true }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

const create = async (req, res) => {
  try {
    const {
      name, description, image, categoryId,
      ingredients, allergens, tags,
      isFeatured, sortOrder, variants
    } = req.body;

    const item = await prisma.menuItem.create({
      data: {
        name, description, image, categoryId,
        ingredients, allergens, tags,
        isFeatured, sortOrder,
        venueId: req.user.venueId,
        variants: {
          create: variants?.map((v, i) => ({
            label: v.label,
            price: v.price,
            isDefault: i === 0,
            sortOrder: i
          })) || []
        }
      },
      include: { variants: true }
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' });
  }
};

const update = async (req, res) => {
  try {
    const {
      name, description, image, categoryId,
      ingredients, allergens, tags,
      isFeatured, isAvailable, sortOrder, variants
    } = req.body;

    // Delete old variants and recreate — simplest approach
    await prisma.variant.deleteMany({ where: { menuItemId: Number(req.params.id) } });

    const item = await prisma.menuItem.update({
      where: { id: Number(req.params.id) },
      data: {
        name, description, image, categoryId,
        ingredients, allergens, tags,
        isFeatured, isAvailable, sortOrder,
        variants: {
          create: variants?.map((v, i) => ({
            label: v.label,
            price: v.price,
            isDefault: i === 0,
            sortOrder: i
          })) || []
        }
      },
      include: { variants: true, category: true }
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.menuItem.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

module.exports = { getAll, create, update, remove };

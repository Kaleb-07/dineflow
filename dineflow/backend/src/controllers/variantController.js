const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createVariant = async (req, res) => {
  try {
    const { name, price, menuItemId } = req.body;
    const variant = await prisma.variant.create({
      data: {
        name,
        price: parseFloat(price),
        menuItemId: parseInt(menuItemId)
      }
    });
    res.status(201).json(variant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const variant = await prisma.variant.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: price ? parseFloat(price) : undefined
      }
    });
    res.json(variant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.variant.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Variant deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createVariant, updateVariant, deleteVariant };

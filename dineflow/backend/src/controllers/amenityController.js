const prisma = require('../lib/prisma');

const getAmenities = async (req, res) => {
  try {
    const amenities = await prisma.amenity.findMany();
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAmenity = async (req, res) => {
  try {
    const { name, icon, description, available } = req.body;
    const amenity = await prisma.amenity.create({
      data: { name, icon, description, available }
    });
    res.status(201).json(amenity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description, available } = req.body;
    const amenity = await prisma.amenity.update({
      where: { id: parseInt(id) },
      data: { name, icon, description, available }
    });
    res.json(amenity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.amenity.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Amenity deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAmenities, createAmenity, updateAmenity, deleteAmenity };

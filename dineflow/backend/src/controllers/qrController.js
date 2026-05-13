const prisma = require('../lib/prisma');

const getQRCodes = async (req, res) => {
  try {
    const qrCodes = await prisma.qRCode.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createQRCode = async (req, res) => {
  try {
    const { tableId, qrData } = req.body;
    const qrCode = await prisma.qRCode.create({
      data: { tableId, qrData, active: true }
    });
    res.status(201).json(qrCode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const qrCode = await prisma.qRCode.update({
      where: { id: parseInt(id) },
      data: { active }
    });
    res.json(qrCode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.qRCode.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'QR Code deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getQRCodes, createQRCode, updateQRCode, deleteQRCode };

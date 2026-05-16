const prisma = require('../lib/prisma');

// GET /api/settings — public, guest menu calls this
const getSettings = async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: req.user.venueId },
      include: { theme: true, amenities: true }
    });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// PATCH /api/settings — update venue info
const updateSettings = async (req, res) => {
  try {
    const {
      name, tagline, description, phone, email,
      address, city, country, currency,
      facebook, instagram, twitter, tiktok, website,
      businessHours, latitude, longitude
    } = req.body;

    const venue = await prisma.venue.update({
      where: { id: req.user.venueId },
      data: {
        name, tagline, description, phone, email,
        address, city, country, currency,
        facebook, instagram, twitter, tiktok, website,
        businessHours, latitude, longitude
      }
    });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// PATCH /api/settings/theme — update theme/branding
const updateTheme = async (req, res) => {
  try {
    const {
      bgColor, accentColor, cardColor, textColor,
      fontDisplay, fontBody,
      borderRadius, cardPadding, itemGap,
      showImages, showPrice, showMealTabs, showDesc
    } = req.body;

    const theme = await prisma.theme.upsert({
      where: { venueId: req.user.venueId },
      update: {
        bgColor, accentColor, cardColor, textColor,
        fontDisplay, fontBody,
        borderRadius, cardPadding, itemGap,
        showImages, showPrice, showMealTabs, showDesc
      },
      create: {
        venueId: req.user.venueId,
        bgColor, accentColor, cardColor, textColor,
        fontDisplay, fontBody,
        borderRadius, cardPadding, itemGap,
        showImages, showPrice, showMealTabs, showDesc
      }
    });
    res.json(theme);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update theme' });
  }
};

// PATCH /api/settings/media — update logo/cover
const updateMedia = async (req, res) => {
  try {
    const { logo, coverPhoto } = req.body;
    const venue = await prisma.venue.update({
      where: { id: req.user.venueId },
      data: { logo, coverPhoto }
    });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update media' });
  }
};

// PATCH /api/settings/account — update user account
const updateAccount = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    // If changing password, verify current one first
    if (newPassword) {
      const bcrypt = require('bcryptjs');
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name, email, password: hashed }
      });
    } else {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name, email }
      });
    }
    res.json({ message: 'Account updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account' });
  }
};

// DELETE /api/settings/venue — delete entire venue
const deleteVenue = async (req, res) => {
  try {
    await prisma.venue.delete({ where: { id: req.user.venueId } });
    res.json({ message: 'Venue deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete venue' });
  }
};

module.exports = {
  getSettings, updateSettings, updateTheme,
  updateMedia, updateAccount, deleteVenue
};

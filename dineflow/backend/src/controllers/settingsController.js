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

module.exports = { getSettings, updateSettings, updateTheme, updateMedia };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, venueName, venueSlug } = req.body;

    // Check email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    // Check slug already exists
    const slugTaken = await prisma.venue.findUnique({ where: { slug: venueSlug } });
    if (slugTaken) return res.status(400).json({ error: 'Venue URL already taken' });

    // Create venue + default theme + user in one transaction
    const hashed = await bcrypt.hash(password, 10);

    const venue = await prisma.venue.create({
      data: {
        name: venueName,
        slug: venueSlug,
        theme: {
          create: {} // all theme defaults from schema
        },
        users: {
          create: {
            name,
            email,
            password: hashed,
            role: 'ADMIN'
          }
        }
      },
      include: { users: true, theme: true }
    });

    const user = venue.users[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, venueId: venue.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      venue: { id: venue.id, name: venue.name, slug: venue.slug }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { venue: true }
    });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, venueId: user.venueId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      venue: { id: user.venue.id, name: user.venue.name, slug: user.venue.slug }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { venue: { include: { theme: true } } }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

module.exports = { register, login, me };

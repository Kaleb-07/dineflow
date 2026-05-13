const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const amenityRoutes = require('./src/routes/amenityRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const { upload, uploadImage } = require('./src/controllers/uploadController');
const { auth, adminAuth } = require('./src/middleware/auth');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DineFlow API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/public', publicRoutes);
app.post('/api/upload', auth, adminAuth, upload.single('image'), uploadImage);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

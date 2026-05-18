const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth',       require('./src/routes/authRoutes'));
app.use('/api/settings',   require('./src/routes/settingsRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/items',      require('./src/routes/itemRoutes'));
app.use('/api/reviews',    require('./src/routes/reviewRoutes'));
app.use('/api/qr',         require('./src/routes/qrRoutes'));
app.use('/api/amenities',  require('./src/routes/amenityRoutes'));
app.use('/api/public',     require('./src/routes/publicRoutes'));
app.use('/api/bulk',       require('./src/routes/bulkRoutes'));

// Upload — protected
const { upload, uploadImage } = require('./src/controllers/uploadController');
const { auth, adminAuth }     = require('./src/middleware/auth');
app.post('/api/upload', auth, upload.single('image'), uploadImage);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/settings',   require('./routes/settingsRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/items',      require('./routes/itemRoutes'));
app.use('/api/reviews',    require('./routes/reviewRoutes'));
app.use('/api/qr',         require('./routes/qrRoutes'));
app.use('/api/amenities',  require('./routes/amenityRoutes'));
app.use('/api/public',     require('./routes/publicRoutes'));
app.use('/api/bulk',       require('./routes/bulkRoutes'));

// Upload — protected
const { upload, uploadImage } = require('./controllers/uploadController');
const { auth, adminAuth }     = require('./middleware/auth');
app.post('/api/upload', auth, upload.single('image'), uploadImage);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

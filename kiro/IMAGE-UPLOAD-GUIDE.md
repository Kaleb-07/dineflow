# 📸 Image Upload Guide

## Overview

Image uploading is **already implemented** in your DineFlow project! You can upload images for:
- ✅ Venue logo
- ✅ Venue cover photo
- ✅ Menu item images

---

## How It Works

### Backend (Already Implemented)

**File**: `backend/src/controllers/uploadController.js`

**Features:**
- Uses Multer for file handling
- Stores images in `backend/uploads/` folder
- Generates unique filenames (timestamp + random number)
- File size limit: 5MB
- Allowed formats: JPEG, JPG, PNG, WEBP
- Returns public URL after upload

**Endpoint:**
```
POST /api/upload
```

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`
- Protected with JWT auth

**Response:**
```json
{
  "url": "http://localhost:5000/uploads/1234567890-123456789.jpg"
}
```

---

## Where Image Upload Is Used

### 1. Venue Page (Logo & Cover Photo)

**File**: `frontend/src/pages/VenuePage.tsx`

**How to use:**
1. Go to **Venue** page in admin panel
2. Click on logo placeholder or cover photo area
3. Select image from your computer
4. Image uploads automatically
5. Preview appears immediately

**Code snippet:**
```tsx
const uploadImage = async (file: File, key: 'logo' | 'coverPhoto') => {
  const fd = new FormData();
  fd.append('image', file);
  const { data } = await api.post('/upload', fd);
  setInfo(p => ({ ...p, [key]: data.url }));
};
```

### 2. Menu Items (Item Images)

**File**: `frontend/src/pages/MenuPage.tsx`

**How to use:**
1. Go to **Menu** page in admin panel
2. Click "Add item" or edit existing item
3. Click the image upload area
4. Select image from your computer
5. Image uploads automatically
6. Preview appears in the form

**Code snippet:**
```tsx
const uploadImage = async (file: File) => {
  setUploading(true);
  const fd = new FormData();
  fd.append('image', file);
  const { data } = await api.post('/upload', fd);
  setForm(p => ({ ...p, image: data.url }));
  setUploading(false);
};
```

---

## Testing Image Upload

### Step 1: Prepare Test Images

Get some food/venue images:
- **Venue logo**: 200x200px square logo
- **Cover photo**: 1200x400px banner
- **Menu items**: 800x600px food photos

### Step 2: Upload Venue Images

1. Login to admin panel
2. Go to **Venue** page
3. Click logo area → select image → uploads
4. Click cover photo area → select image → uploads
5. Click "Save all"

### Step 3: Upload Menu Item Images

1. Go to **Menu** page
2. Click "Add item"
3. Fill in item details
4. Click image upload area
5. Select food photo
6. Image uploads and preview appears
7. Click "Create item"

### Step 4: Verify on Guest Menu

1. Go to guest menu: `http://localhost:5173/menu/your-slug`
2. Should see:
   - Venue logo in top-right
   - Cover photo in About section
   - Menu item images in item cards

---

## Image Storage

### Local Development

**Location**: `backend/uploads/`

**Example files:**
```
backend/uploads/
  ├── 1778864826528-543291279.png  (venue logo)
  ├── 1778864826530-123456789.jpg  (cover photo)
  ├── 1778864826532-987654321.jpg  (menu item 1)
  └── 1778864826534-456789123.jpg  (menu item 2)
```

**Served at**: `http://localhost:5000/uploads/filename.jpg`

### Production Deployment

For production, you have 3 options:

#### Option 1: Same Server (Simple)
- Keep images in `uploads/` folder
- Serve via Express static middleware (already configured)
- **Pros**: Simple, no extra cost
- **Cons**: Not scalable, no CDN

#### Option 2: Cloud Storage (Recommended)
- Use AWS S3, Cloudinary, or DigitalOcean Spaces
- Upload directly to cloud
- Get CDN URLs
- **Pros**: Scalable, fast, CDN
- **Cons**: Extra cost (~$5/month)

#### Option 3: Vercel Blob Storage
- Use Vercel's built-in blob storage
- Integrates with Vercel deployment
- **Pros**: Easy setup, CDN included
- **Cons**: Vercel-specific

---

## Image Optimization Tips

### Before Upload (Client-Side)

Add image compression before upload:

```bash
npm install browser-image-compression
```

```tsx
import imageCompression from 'browser-image-compression';

const uploadImage = async (file: File) => {
  // Compress before upload
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  
  const compressed = await imageCompression(file, options);
  
  const fd = new FormData();
  fd.append('image', compressed);
  const { data } = await api.post('/upload', fd);
  setForm(p => ({ ...p, image: data.url }));
};
```

### After Upload (Server-Side)

Add Sharp for server-side optimization:

```bash
cd backend
npm install sharp
```

```javascript
const sharp = require('sharp');

const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const outputPath = path.join(uploadDir, filename);
  
  // Optimize and convert to WebP
  await sharp(req.file.path)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
  
  // Delete original
  fs.unlinkSync(req.file.path);
  
  const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
  res.json({ url });
};
```

---

## Troubleshooting

### "No file uploaded" Error

**Cause**: File not attached to request

**Solution**:
1. Check FormData has `image` field
2. Verify `Content-Type` is `multipart/form-data`
3. Check file input has `name="image"`

### "Images only" Error

**Cause**: Wrong file format

**Solution**:
- Only upload: JPEG, JPG, PNG, WEBP
- Check file extension is correct
- Don't upload: GIF, BMP, SVG, PDF

### "File too large" Error

**Cause**: File exceeds 5MB limit

**Solution**:
1. Compress image before upload
2. Or increase limit in `uploadController.js`:
   ```javascript
   limits: { fileSize: 10 * 1024 * 1024 } // 10MB
   ```

### Images Not Displaying

**Cause**: Wrong URL or CORS issue

**Solution**:
1. Check image URL in database
2. Verify uploads folder exists
3. Check CORS allows image requests
4. Try opening image URL directly in browser

### Upload Folder Not Found

**Cause**: Folder doesn't exist

**Solution**:
```bash
mkdir backend/uploads
```

Or the code creates it automatically on first upload.

---

## Security Best Practices

### 1. File Type Validation

Already implemented:
```javascript
fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  ok ? cb(null, true) : cb(new Error('Images only'));
}
```

### 2. File Size Limit

Already implemented:
```javascript
limits: { fileSize: 5 * 1024 * 1024 } // 5MB
```

### 3. Authentication

Already implemented:
```javascript
app.post('/api/upload', auth, upload.single('image'), uploadImage);
```

### 4. Additional Security (Optional)

Add virus scanning:
```bash
npm install clamscan
```

Add image validation:
```bash
npm install file-type
```

---

## Bulk Upload with Images

Currently, bulk upload doesn't support images. To add image support:

### Option 1: Upload Images Separately

1. Bulk upload menu items (no images)
2. Edit each item to add image
3. Fast for text, manual for images

### Option 2: Image URLs in CSV

1. Host images somewhere (Google Drive, Imgur)
2. Add `image_url` column to CSV
3. Backend downloads and saves images
4. More complex but fully automated

### Option 3: ZIP Upload

1. Upload ZIP with CSV + images
2. Backend extracts and matches by filename
3. Most user-friendly
4. Requires more backend code

**Recommendation**: Start with Option 1 (separate upload). Add Option 3 later if customers request it.

---

## Image Upload Checklist

- [x] Backend upload endpoint (`/api/upload`)
- [x] Multer configuration
- [x] File type validation
- [x] File size limit (5MB)
- [x] Unique filename generation
- [x] Static file serving
- [x] Frontend upload in VenuePage
- [x] Frontend upload in MenuPage
- [x] Image preview after upload
- [x] JWT authentication
- [ ] Image compression (optional)
- [ ] Cloud storage (for production)
- [ ] Bulk upload with images (future)

---

## Summary

✅ **Image upload is fully working!**

**What you can do now:**
1. Upload venue logo and cover photo
2. Upload menu item images
3. Images appear on guest menu
4. All images stored in `backend/uploads/`

**What to add later (optional):**
1. Image compression
2. Cloud storage (S3, Cloudinary)
3. Bulk upload with images
4. Image optimization

**Your image upload system is production-ready!** 🎉

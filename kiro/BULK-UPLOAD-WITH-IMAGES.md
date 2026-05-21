# 📸 Bulk Upload with Images

## Overview

You can now include images in your bulk upload! Just add image URLs to the CSV, and the system will automatically download and save them.

---

## How It Works

### Step 1: Add image_url Column

The CSV template now has an `image_url` column where you can paste image URLs.

**Supported sources:**
- ✅ Unsplash (https://images.unsplash.com/...)
- ✅ Imgur (https://i.imgur.com/...)
- ✅ Google Drive (public links)
- ✅ Dropbox (public links)
- ✅ Any direct image URL (ends in .jpg, .png, .webp)

### Step 2: Fill in Image URLs

**Example CSV row:**
```csv
Breakfast,FOOD,Timatim Eggs,Scrambled eggs...,https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400,Eggs...,Eggs,Spicy,TRUE,TRUE,Full Plate,120,Half Plate,80
```

**Tips:**
- Use `?w=400` or `?w=800` at the end of Unsplash URLs to get optimized sizes
- Leave `image_url` empty if you don't have an image (item will be created without image)
- You can add images later by editing the item manually

### Step 3: Upload

1. Click "Bulk upload" in Menu page
2. Upload your CSV with image URLs
3. Backend automatically:
   - Downloads each image
   - Saves to `uploads/` folder
   - Links to menu item
4. Done! Items appear with images

---

## Where to Get Images

### Option 1: Unsplash (Free, High Quality)

1. Go to https://unsplash.com
2. Search for food type (e.g., "ethiopian food", "coffee", "salad")
3. Click image → Right-click → "Copy image address"
4. Paste into CSV `image_url` column
5. Add `?w=400` at the end for smaller size

**Example:**
```
https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400
```

### Option 2: Take Your Own Photos

1. Take photos with your phone
2. Upload to Imgur or Google Drive
3. Get public link
4. Paste into CSV

**Imgur:**
1. Go to https://imgur.com
2. Upload image
3. Right-click → "Copy image address"
4. Use the direct link (ends in .jpg)

**Google Drive:**
1. Upload to Google Drive
2. Right-click → "Get link" → "Anyone with the link"
3. Change URL format:
   - From: `https://drive.google.com/file/d/FILE_ID/view`
   - To: `https://drive.google.com/uc?export=view&id=FILE_ID`

### Option 3: Client's Existing Images

If the client has a website or social media:
1. Right-click their food photos
2. "Copy image address"
3. Paste into CSV

---

## Example CSV with Images

```csv
category_name,category_type,item_name,description,image_url,ingredients,allergens,tags,is_featured,is_available,variant_1_label,variant_1_price,variant_2_label,variant_2_price
Breakfast,FOOD,Timatim Eggs,Scrambled eggs with tomatoes,https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400,"Eggs, Tomato",Eggs,"Spicy",TRUE,TRUE,Full,120,Half,80
Starters,FOOD,Sambusa,Crispy pastry,https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400,"Flour, Lentils",Gluten,"Crispy",TRUE,TRUE,3 Pieces,60,6 Pieces,110
Main Course,FOOD,Doro Wat,Spicy chicken stew,https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400,"Chicken, Eggs",Eggs,"Signature",TRUE,TRUE,Full,250,Half,150
Desserts,FOOD,Baklava,Honey and nuts pastry,https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400,"Phyllo, Honey","Gluten, Nuts","Sweet",FALSE,TRUE,Slice,65,Box,240
Hot Drinks,DRINK,Ethiopian Coffee,Traditional coffee,https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400,"Coffee Beans",,"Signature",TRUE,TRUE,Cup,40,Jebena,100
```

---

## What Happens During Upload

### Backend Process:

1. **Parse CSV**: Extract image URLs from each row
2. **Download Images**: For each URL:
   - Download image to temporary location
   - Generate unique filename (timestamp + random)
   - Save to `backend/uploads/` folder
   - Create relative URL (`/uploads/filename.jpg`)
3. **Create Menu Item**: Link image URL to item
4. **Error Handling**: If download fails, item is created without image (not skipped)

### Frontend Preview:

- Preview shows items with placeholder if image URL provided
- After upload, images appear in menu immediately
- No need to refresh page

---

## Troubleshooting

### "Failed to download image"

**Causes:**
- URL is not accessible (404, 403)
- URL requires authentication
- URL is not a direct image link
- Network timeout

**Solutions:**
1. Test URL in browser first (should show image directly)
2. Use direct image URLs (ends in .jpg, .png, .webp)
3. Make sure URL is public (no login required)
4. Try a different image source

**Note:** If image download fails, the item is still created without the image. You can add the image later by editing the item.

### Images Not Showing on Guest Menu

**Causes:**
- Image URL is relative but server URL is wrong
- CORS blocking image requests

**Solutions:**
1. Check image URL in database (should be `/uploads/filename.jpg`)
2. Verify uploads folder exists: `backend/uploads/`
3. Test image URL directly: `http://localhost:5000/uploads/filename.jpg`
4. Check backend serves static files (already configured)

### Slow Upload

**Cause:** Downloading many images takes time

**Solutions:**
1. Use smaller images (add `?w=400` to Unsplash URLs)
2. Upload in batches (10-20 items at a time)
3. Use CDN URLs (already optimized)
4. Be patient - 50 items with images takes ~30 seconds

---

## Best Practices

### Image Sizes

**Recommended:**
- Menu item images: 800x600px or 400x300px
- File size: < 200KB per image
- Format: JPEG or WebP

**Why:**
- Faster page load
- Less storage space
- Better mobile experience

### Image Quality

**Good:**
- Professional food photography
- Good lighting
- Clean background
- Focused on the dish

**Avoid:**
- Blurry photos
- Dark/poorly lit
- Cluttered background
- Stock photos that don't match

### Bulk Upload Strategy

**For new clients:**

1. **First pass - No images** (5 minutes)
   - Upload CSV with all items
   - Leave `image_url` empty
   - Get menu structure in place

2. **Second pass - Add images** (20 minutes)
   - Find images on Unsplash
   - Update CSV with image URLs
   - Re-upload (duplicates are skipped, only images are added)

**OR**

1. **One pass - With images** (25 minutes)
   - Find all images first
   - Fill CSV with URLs
   - Upload once
   - Everything done!

---

## Advanced: Batch Image Processing

If you have many local images to upload:

### Option 1: Upload to Imgur First

```bash
# Use Imgur API or web interface
# Get all image URLs
# Paste into CSV
```

### Option 2: Use Cloud Storage

```bash
# Upload to AWS S3, Cloudinary, or DigitalOcean Spaces
# Get public URLs
# Paste into CSV
```

### Option 3: Local Upload Script

Create a script to upload images to your backend first:

```javascript
// upload-images.js
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const uploadImage = async (filepath) => {
  const form = new FormData();
  form.append('image', fs.createReadStream(filepath));
  
  const { data } = await axios.post('http://localhost:5000/api/upload', form, {
    headers: {
      ...form.getHeaders(),
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
  });
  
  return data.url;
};

// Upload all images in a folder
const folder = './client-images/';
const files = fs.readdirSync(folder);

for (const file of files) {
  const url = await uploadImage(folder + file);
  console.log(`${file} -> ${url}`);
}
```

Then use the returned URLs in your CSV.

---

## Performance Tips

### For 50+ Items with Images:

1. **Use CDN URLs** (Unsplash, Imgur) - Already optimized
2. **Compress images** before uploading to Imgur
3. **Upload in batches** - 20 items at a time
4. **Use smaller images** - 400px width is enough for menu items
5. **Be patient** - First upload with images takes longer

### For Production:

Consider using a dedicated image service:
- **Cloudinary**: Auto-optimization, CDN, transformations
- **AWS S3 + CloudFront**: Scalable, fast
- **Imgix**: Real-time image processing

---

## Example Workflow

### Onboarding "Skyline Hotel Restaurant"

**Step 1: Get their menu** (5 min)
- PDF or photo from client
- Type into Excel

**Step 2: Find images** (15 min)
- Search Unsplash for each dish
- Copy image URLs
- Paste into `image_url` column

**Step 3: Upload** (30 seconds)
- Drag CSV into bulk upload
- Preview shows all items with images
- Click "Upload 25 items"
- Done!

**Step 4: Show client** (2 min)
- Open guest menu on phone
- Scroll through items with images
- Client sees their actual menu
- Close the deal!

**Total time: 22 minutes** (vs 2 hours manual entry)

---

## Summary

✅ **Image URLs in CSV** - Just paste URLs
✅ **Auto-download** - Backend handles everything
✅ **Error handling** - Failed downloads don't stop upload
✅ **Fast onboarding** - 50 items with images in 25 minutes
✅ **Professional look** - High-quality food photos

**Your bulk upload now supports images!** 🎉

---

## Template Updated

The CSV template now includes:
- `image_url` column
- Sample Unsplash URLs
- Mix of items with and without images

**Download the updated template from the bulk upload modal!**

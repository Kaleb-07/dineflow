const prisma = require('../lib/prisma');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper function to download image from URL
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
};

// POST /api/bulk/menu
// Accepts parsed rows from frontend (already validated)
const bulkUploadMenu = async (req, res) => {
  const { rows } = req.body; // array of parsed menu rows
  const venueId = req.user.venueId;

  if (!rows || !Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'No rows provided' });

  const results = { created: 0, skipped: 0, errors: [] };
  const catCache = {}; // cache category lookups

  for (const row of rows) {
    try {
      const {
        category_name, category_type,
        item_name, description, image_url,
        ingredients, allergens, tags,
        is_featured, is_available,
        variants,
      } = row;

      if (!item_name?.trim()) { results.skipped++; continue; }
      if (!category_name?.trim()) { 
        results.errors.push(`Row "${item_name}": missing category_name`); 
        continue; 
      }
      if (!variants || variants.length === 0) { 
        results.errors.push(`Row "${item_name}": needs at least 1 variant with label + price`); 
        continue; 
      }

      // Find or create category
      const catKey = `${category_name.trim()}_${(category_type || 'FOOD').toUpperCase()}`;
      if (!catCache[catKey]) {
        const existing = await prisma.category.findFirst({
          where: { venueId, name: category_name.trim() }
        });
        
        if (existing) {
          catCache[catKey] = existing.id;
        } else {
          const cat = await prisma.category.create({
            data: {
              name: category_name.trim(),
              type: category_type?.toUpperCase() === 'DRINK' ? 'DRINK' : 'FOOD',
              venueId,
              sortOrder: 99,
            }
          });
          catCache[catKey] = cat.id;
        }
      }
      const categoryId = catCache[catKey];

      // Check for duplicate item name in this venue
      const existing = await prisma.menuItem.findFirst({
        where: { venueId, name: item_name.trim() }
      });
      if (existing) {
        results.skipped++;
        results.errors.push(`Skipped duplicate: "${item_name}"`);
        continue;
      }

      // Download image if URL provided
      let imageUrl = null;
      if (image_url?.trim()) {
        try {
          const uploadDir = path.join(__dirname, '../../uploads');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          
          const ext = path.extname(new URL(image_url).pathname) || '.jpg';
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          const filepath = path.join(uploadDir, filename);
          
          await downloadImage(image_url, filepath);
          imageUrl = `/uploads/${filename}`;
        } catch (err) {
          results.errors.push(`Row "${item_name}": failed to download image - ${err.message}`);
          // Continue without image
        }
      }

      // Parse arrays
      const parseList = (val) =>
        val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];

      const parseBool = (val, def = true) => {
        if (val === undefined || val === null || val === '') return def;
        return String(val).toUpperCase() === 'TRUE';
      };

      // Create item + variants
      await prisma.menuItem.create({
        data: {
          venueId,
          categoryId,
          name: item_name.trim(),
          description: description?.trim() || null,
          image: imageUrl,
          ingredients: parseList(ingredients),
          allergens: parseList(allergens),
          tags: parseList(tags),
          isFeatured: parseBool(is_featured, false),
          isAvailable: parseBool(is_available, true),
          variants: {
            create: variants.map((v, i) => ({
              label: v.label.trim(),
              price: parseFloat(v.price) || 0,
              isDefault: i === 0,
              isAvailable: true,
              sortOrder: i,
            }))
          }
        }
      });
      results.created++;
    } catch (err) {
      results.errors.push(`Row "${row.item_name}": ${err.message}`);
    }
  }

  res.json({
    message: `Done. ${results.created} items created, ${results.skipped} skipped.`,
    ...results
  });
};

module.exports = { bulkUploadMenu };

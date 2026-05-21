# 📊 Bulk Upload Guide

## Overview

The bulk upload feature lets you add 50+ menu items in seconds using Excel or CSV files. Perfect for onboarding new clients quickly.

---

## How It Works

### Step 1: Download Template
1. Go to **Menu** page in admin panel
2. Click **"Bulk upload"** button
3. Click **"Download template"** in the modal
4. Opens a CSV file with sample data

### Step 2: Fill in Your Data
Open the template in Excel, Google Sheets, or any spreadsheet app.

**Required Columns:**
- `category_name` - e.g., "Breakfast", "Main Course"
- `category_type` - Either "FOOD" or "DRINK"
- `item_name` - e.g., "Timatim Eggs"
- `variant_1_label` - e.g., "Full Plate", "Regular"
- `variant_1_price` - e.g., 120

**Optional Columns:**
- `description` - Item description
- `ingredients` - Comma-separated list
- `allergens` - Comma-separated list
- `tags` - Comma-separated list
- `is_featured` - TRUE or FALSE
- `is_available` - TRUE or FALSE
- `variant_2_label`, `variant_2_price` - Second pricing option
- `variant_3_label`, `variant_3_price` - Third pricing option
- `variant_4_label`, `variant_4_price` - Fourth pricing option

**Example Row:**
```
Breakfast,FOOD,Timatim Eggs,Scrambled eggs with tomatoes,"Eggs, Tomato, Berbere",Eggs,"Spicy, Traditional",TRUE,TRUE,Full Plate,120,Half Plate,80
```

### Step 3: Upload
1. Save your file as `.xlsx` or `.csv`
2. Drag and drop into the upload zone (or click to browse)
3. Review the preview - shows all items grouped by category
4. Click **"Upload X items"**
5. Done! Items appear in your menu instantly

---

## Features

### ✅ Auto-Create Categories
If a category doesn't exist, it's created automatically. No need to create categories first.

### ✅ Duplicate Detection
Items with the same name are skipped automatically. You'll see a report of what was skipped.

### ✅ Validation
- Missing required fields are flagged before upload
- Invalid prices are caught
- Empty rows are skipped silently

### ✅ Preview Before Upload
See exactly what will be created, grouped by category with all variants visible.

### ✅ Detailed Results
After upload, see:
- How many items were created
- How many were skipped (duplicates)
- Any errors with specific row numbers

---

## Tips for Fast Onboarding

### 1. Use the Sample Data
The template comes with 15 real Ethiopian menu items. Just edit the names and prices instead of starting from scratch.

### 2. Copy from Existing Menus
If the client has a PDF or Word menu:
1. Copy the text
2. Paste into Excel
3. Use "Text to Columns" to split into fields
4. Clean up and upload

### 3. Batch Similar Items
Group items by category in your spreadsheet. Makes it easier to review and edit.

### 4. Start Small
Upload 5-10 items first to test. Once you're comfortable, upload the full menu.

---

## Common Issues

### "Missing category_name"
Every item needs a category. Make sure the `category_name` column is filled for all rows.

### "Needs at least 1 variant"
Every item needs at least one pricing option. Fill in `variant_1_label` and `variant_1_price`.

### "Skipped duplicate"
An item with that name already exists. Either:
- Delete the existing item first
- Rename the new item
- Skip it (it's already in your menu)

### "Could not read file"
Make sure you're uploading a `.xlsx` or `.csv` file. If using Google Sheets, download as Excel or CSV first.

---

## Time Savings

**Manual entry:**
- 50 items × 2 minutes each = 100 minutes (1 hour 40 minutes)

**Bulk upload:**
- Fill spreadsheet: 20 minutes
- Upload: 2 seconds
- **Total: 20 minutes**

**Saves 80 minutes per client!**

---

## Example Workflow

### Onboarding a New Hotel

**Before the meeting:**
1. Download their menu (PDF, photo, or website)
2. Type it into the Excel template (20 minutes)
3. Save the file

**During the meeting:**
1. Show them the admin panel
2. Click "Bulk upload"
3. Upload the file you prepared
4. 2 seconds later, their full menu is live
5. Show them the guest menu on your phone
6. Close the deal

**They see their actual menu, not a demo. That's powerful.**

---

## Advanced: Multiple Venues

If you're onboarding multiple venues with similar menus (e.g., a hotel chain):

1. Create one master template with all items
2. For each venue:
   - Make a copy of the template
   - Adjust prices and descriptions
   - Upload
3. Each venue gets a customized menu in seconds

---

## Template Columns Reference

| Column | Required | Type | Example |
|--------|----------|------|---------|
| category_name | ✅ Yes | Text | Breakfast |
| category_type | ✅ Yes | FOOD/DRINK | FOOD |
| item_name | ✅ Yes | Text | Timatim Eggs |
| description | No | Text | Scrambled eggs with tomatoes |
| ingredients | No | Comma-separated | Eggs, Tomato, Berbere |
| allergens | No | Comma-separated | Eggs |
| tags | No | Comma-separated | Spicy, Traditional |
| is_featured | No | TRUE/FALSE | TRUE |
| is_available | No | TRUE/FALSE | TRUE |
| variant_1_label | ✅ Yes | Text | Full Plate |
| variant_1_price | ✅ Yes | Number | 120 |
| variant_2_label | No | Text | Half Plate |
| variant_2_price | No | Number | 80 |
| variant_3_label | No | Text | Small |
| variant_3_price | No | Number | 60 |
| variant_4_label | No | Text | Large |
| variant_4_price | No | Number | 150 |

---

## Support

If you encounter issues:
1. Check the error messages - they tell you exactly what's wrong
2. Verify your file format (.xlsx or .csv)
3. Make sure required columns are filled
4. Try uploading just 1-2 rows first to test

---

## 🎉 Success Story

**Before bulk upload:**
- Onboarding a 50-item menu: 2 hours
- Client gets bored waiting
- Risk of typos from manual entry

**After bulk upload:**
- Onboarding a 50-item menu: 20 minutes
- Client is impressed by speed
- No typos (copy-paste from their menu)
- Close deals faster

**This feature alone can 5x your onboarding speed!**

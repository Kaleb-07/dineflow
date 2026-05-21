# Fix 404 Error for CSV Template

## Problem
Getting 404 error when trying to download the bulk upload template.

## Solution

### Step 1: Restart Frontend Dev Server

The CSV template file exists in `frontend/public/dineflow-menu-template.csv`, but Vite needs to be restarted to serve it.

**In your frontend terminal:**

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it:
cd dineflow/frontend
npm run dev
```

### Step 2: Clear Browser Cache (Optional)

If the issue persists after restart:

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 3: Verify File is Accessible

After restarting, open this URL in your browser:
```
http://localhost:5173/dineflow-menu-template.csv
```

You should see the CSV file content.

---

## Alternative: Use Direct File Path

If the issue still persists, you can temporarily use a direct file path instead of serving through Vite:

### Option A: Move to src/assets

1. Create `frontend/src/assets` folder if it doesn't exist
2. Move the CSV there
3. Update the import in `BulkUploadModal.tsx`:

```tsx
import templateFile from '../assets/dineflow-menu-template.csv?url';

// Then use it:
<a href={templateFile} download>
  Download template
</a>
```

### Option B: Use External Link

Host the template on Google Drive or Dropbox and use that URL temporarily.

---

## Why This Happens

Vite's dev server caches the public folder contents. When you add a new file to the public folder while the dev server is running, it doesn't automatically pick it up. A restart is needed.

---

## Verification

After fixing, test the bulk upload flow:

1. ✅ Click "Bulk upload" button
2. ✅ Click "Download template"
3. ✅ CSV file downloads
4. ✅ Open in Excel/Google Sheets
5. ✅ Edit and save
6. ✅ Upload back to the modal
7. ✅ See preview
8. ✅ Upload successfully

---

## Still Not Working?

Check these:

1. **File exists?**
   ```bash
   ls dineflow/frontend/public/dineflow-menu-template.csv
   ```

2. **Correct path in code?**
   Should be: `/dineflow-menu-template.csv` (starts with `/`)

3. **Dev server running?**
   Should see: `Local: http://localhost:5173/`

4. **Port correct?**
   Make sure you're accessing `localhost:5173`, not `localhost:5000`

---

## Quick Test

Run this in your browser console:
```javascript
fetch('/dineflow-menu-template.csv')
  .then(r => r.text())
  .then(console.log)
```

If you see CSV content, the file is accessible!

# 🔄 Restart Servers to Load New Features

## Problem
Getting 404 errors for new API endpoints after adding new features.

## Solution: Restart Both Servers

### Step 1: Restart Backend Server

**In your backend terminal:**

1. Stop the server: Press `Ctrl+C`
2. Restart:
   ```bash
   cd dineflow/backend
   npm run dev
   ```
3. Wait for: `Server running on port 5000`

### Step 2: Restart Frontend Server

**In your frontend terminal:**

1. Stop the server: Press `Ctrl+C`
2. Restart:
   ```bash
   cd dineflow/frontend
   npm run dev
   ```
3. Wait for: `Local: http://localhost:5173/`

### Step 3: Test Bulk Upload

1. Login to admin panel
2. Go to Menu page
3. Click "Bulk upload"
4. Click "Download template" (should work now)
5. Upload the template back
6. Should see preview and upload successfully

---

## Why This Is Needed

When you add new files while the servers are running:
- **Backend**: Doesn't automatically load new route files
- **Frontend**: Doesn't automatically serve new public files

**Solution**: Restart both servers after adding new features.

---

## Quick Verification

### Test Backend Route
Open in browser or use curl:
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok"}`

### Test Frontend
Open in browser:
```
http://localhost:5173
```
Should load the login page.

### Test Template Download
Open in browser:
```
http://localhost:5173/dineflow-menu-template.csv
```
Should download the CSV file.

---

## Common Issues After Restart

### Backend won't start
**Error: "Port 5000 already in use"**

Solution:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Frontend won't start
**Error: "Port 5173 already in use"**

Solution:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Database connection error
**Error: "Can't connect to MySQL"**

Solution:
1. Make sure MySQL is running
2. Check `.env` file has correct `DATABASE_URL`
3. Run: `npx prisma db push`

---

## After Restart Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login to admin panel
- [ ] Can access Menu page
- [ ] Bulk upload button appears
- [ ] Template downloads successfully
- [ ] Can upload CSV file
- [ ] Items are created

---

## Pro Tip: Use Nodemon

Backend already uses nodemon (auto-restart on file changes).

But it only watches `.js` files in the current directory.

If you add a new route file, you still need to manually restart once.

After that, changes to existing files will auto-reload!

---

## Still Getting 404?

Check these:

1. **Backend logs**: Look for errors when starting
2. **Route registered**: Check `backend/index.js` has `app.use('/api/bulk', ...)`
3. **File exists**: Check `backend/src/routes/bulkRoutes.js` exists
4. **Controller exists**: Check `backend/src/controllers/bulkController.js` exists
5. **Network tab**: Check the exact URL being called (should be `/api/bulk/menu`)

---

## Success!

After restarting both servers, the bulk upload feature should work perfectly! 🎉

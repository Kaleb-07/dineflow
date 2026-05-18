const http = require('http');

console.log('🔍 Checking DineFlow status...\n');

// Check backend
const checkBackend = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Backend (port 5000): Running');
        console.log('   Response:', data);
        resolve(true);
      });
    });
    req.on('error', () => {
      console.log('❌ Backend (port 5000): NOT running');
      console.log('   → Run: cd backend && npm start');
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      console.log('❌ Backend (port 5000): Timeout');
      resolve(false);
    });
  });
};

// Check venue data
const checkVenue = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/public/bella-vista', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('\n✅ Venue data: Found');
          console.log('   Name:', json.name);
          console.log('   Categories:', json.categories?.length || 0);
          console.log('   Total items:', json.categories?.reduce((sum, cat) => sum + (cat.items?.length || 0), 0) || 0);
          
          if (json.categories?.length === 0) {
            console.log('\n⚠️  WARNING: No categories found!');
            console.log('   → Run: cd backend && node src/seed.js');
          }
        } catch (e) {
          console.log('❌ Venue data: Invalid JSON');
        }
        resolve(true);
      });
    });
    req.on('error', () => {
      console.log('\n❌ Venue data: Cannot fetch');
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      console.log('\n❌ Venue data: Timeout');
      resolve(false);
    });
  });
};

// Check frontend
const checkFrontend = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      console.log('\n✅ Frontend (port 5173): Running');
      console.log('   → Guest menu: http://localhost:5173/menu/bella-vista');
      console.log('   → Admin panel: http://localhost:5173/admin/menu');
      resolve(true);
    });
    req.on('error', () => {
      console.log('\n❌ Frontend (port 5173): NOT running');
      console.log('   → Run: cd frontend && npm run dev');
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      console.log('\n❌ Frontend (port 5173): Timeout');
      resolve(false);
    });
  });
};

(async () => {
  const backendOk = await checkBackend();
  if (backendOk) {
    await checkVenue();
  }
  await checkFrontend();
  console.log('\n' + '─'.repeat(50));
})();

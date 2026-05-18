const http = require('http');

const checkVenue = (slug) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000/api/public/${slug}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('\n✅ Venue:', json.name);
          console.log('   ID:', json.id);
          console.log('   Slug:', json.slug);
          console.log('   Categories:', json.categories?.length || 0);
          
          json.categories?.forEach(cat => {
            console.log(`\n   📁 ${cat.icon} ${cat.name} (${cat.type})`);
            console.log(`      Items: ${cat.items?.length || 0}`);
            if (cat.items?.length > 0) {
              cat.items.slice(0, 3).forEach(item => {
                console.log(`      - ${item.name} (${item.variants?.length || 0} variants)`);
              });
              if (cat.items.length > 3) {
                console.log(`      ... and ${cat.items.length - 3} more`);
              }
            }
          });
          
          console.log('\n   Total items across all categories:', 
            json.categories?.reduce((sum, cat) => sum + (cat.items?.length || 0), 0) || 0
          );
        } catch (e) {
          console.log('❌ Error parsing JSON:', e.message);
          console.log('Response:', data.substring(0, 200));
        }
        resolve();
      });
    });
    req.on('error', (e) => {
      console.log('❌ Cannot fetch venue:', e.message);
      resolve();
    });
  });
};

checkVenue('bella-vista');

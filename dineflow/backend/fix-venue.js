const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking venues...\n');
  
  const venues = await prisma.venue.findMany({
    include: {
      categories: {
        include: {
          items: true
        }
      }
    }
  });
  
  console.log(`Found ${venues.length} venue(s):\n`);
  
  venues.forEach(v => {
    const itemCount = v.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    console.log(`ID: ${v.id} | Slug: ${v.slug} | Name: ${v.name}`);
    console.log(`   Categories: ${v.categories.length} | Items: ${itemCount}\n`);
  });
  
  // Find the venue with items
  const venueWithItems = venues.find(v => 
    v.categories.some(cat => cat.items.length > 0)
  );
  
  if (venueWithItems && venueWithItems.slug !== 'bella-vista') {
    console.log('⚠️  Found venue with items but wrong slug!');
    console.log(`   Current slug: ${venueWithItems.slug}`);
    console.log(`   Updating to: bella-vista\n`);
    
    // Delete old bella-vista venue if exists
    await prisma.venue.deleteMany({ where: { slug: 'bella-vista' } });
    
    // Update the venue with items
    await prisma.venue.update({
      where: { id: venueWithItems.id },
      data: { slug: 'bella-vista' }
    });
    
    console.log('✅ Fixed! Venue slug updated to bella-vista');
  } else if (venueWithItems && venueWithItems.slug === 'bella-vista') {
    console.log('✅ Venue is correct! bella-vista has all the items.');
  } else {
    console.log('❌ No venue found with items. Run: node src/seed.js');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

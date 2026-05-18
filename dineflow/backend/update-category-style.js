const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating category styles from "sidebar" to "dropdown"...\n');
  
  const result = await prisma.theme.updateMany({
    where: {
      categoryStyle: 'sidebar'
    },
    data: {
      categoryStyle: 'dropdown'
    }
  });
  
  console.log(`✅ Updated ${result.count} theme(s)`);
  
  // Show all themes
  const themes = await prisma.theme.findMany({
    select: {
      id: true,
      venueId: true,
      categoryStyle: true
    }
  });
  
  console.log('\nCurrent themes:');
  themes.forEach(t => {
    console.log(`  Theme ${t.id} (venue ${t.venueId}): categoryStyle = "${t.categoryStyle}"`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

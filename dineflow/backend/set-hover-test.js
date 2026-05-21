const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setHover() {
  const theme = await prisma.theme.updateMany({
    data: {
      hoverStyle: 'lift',
      hoverSpeed: 5
    }
  });
  
  console.log('✅ Updated theme with hover settings');
  console.log('hoverStyle: lift');
  console.log('hoverSpeed: 5');
  
  // Verify
  const check = await prisma.theme.findFirst();
  console.log('\n📊 Current settings:');
  console.log('hoverStyle:', check?.hoverStyle);
  console.log('hoverSpeed:', check?.hoverSpeed);
  
  await prisma.$disconnect();
}

setHover();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTheme() {
  const theme = await prisma.theme.findFirst();
  console.log('\n=== Current Theme Hover Settings ===');
  console.log('hoverStyle:', theme?.hoverStyle);
  console.log('hoverSpeed:', theme?.hoverSpeed);
  console.log('animateHover:', theme?.animateHover);
  console.log('\n=== All Animation Settings ===');
  console.log('animateItems:', theme?.animateItems);
  console.log('animatePrice:', theme?.animatePrice);
  console.log('animateCategories:', theme?.animateCategories);
  console.log('animationSpeed:', theme?.animationSpeed);
  await prisma.$disconnect();
}

checkTheme();

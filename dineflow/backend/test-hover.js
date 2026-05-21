const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const theme = await prisma.theme.findFirst();
  console.log('Theme hoverSpeed:', theme?.hoverSpeed);
  console.log('Theme hoverStyle:', theme?.hoverStyle);
  await prisma.$disconnect();
}

test();

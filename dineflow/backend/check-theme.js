const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking theme settings...\n')
  
  const themes = await prisma.theme.findMany({
    select: {
      id: true,
      venueId: true,
      animateItems: true,
      animateHover: true,
      animatePrice: true,
      animateCategories: true,
      animationSpeed: true
    }
  })
  
  console.log('Theme records:', JSON.stringify(themes, null, 2))
}

main()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

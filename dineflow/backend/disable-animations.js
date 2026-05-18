const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Disabling all animations by default...')
  
  // Update all themes - set all animation flags to false
  const result = await prisma.theme.updateMany({
    data: {
      animateItems: false,
      animateHover: false,
      animatePrice: false,
      animateCategories: false,
      animationSpeed: 5
    }
  })
  
  console.log(`✅ Updated ${result.count} theme records - all animations disabled`)
}

main()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

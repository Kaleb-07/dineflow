const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating animationSpeed from string to number...')
  
  // Update all themes - convert 'normal' to 5
  const result = await prisma.$executeRaw`
    UPDATE theme 
    SET animationSpeed = CASE 
      WHEN animationSpeed = 'slow' THEN '3'
      WHEN animationSpeed = 'normal' THEN '5'
      WHEN animationSpeed = 'fast' THEN '7'
      ELSE '5'
    END
  `
  
  console.log(`✅ Updated ${result} theme records`)
}

main()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

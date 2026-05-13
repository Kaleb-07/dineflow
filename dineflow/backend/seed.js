const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // First, create a venue
  const venue = await prisma.venue.create({
    data: {
      slug: 'demo-restaurant',
      name: 'Demo Restaurant',
      tagline: 'Delicious food, great service',
      currency: 'USD',
      language: 'en',
      isActive: true,
    },
  });

  console.log('✅ Created venue:', venue.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@dineflow.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      venueId: venue.id,
    },
  });

  console.log('✅ Created admin user:', user.email);
  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@dineflow.com');
  console.log('   Password: admin123');
  console.log('\n🚀 You can now login at http://localhost:5173/login');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

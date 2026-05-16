const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Bella Vista Cafe…');

  // ── Venue + User + Theme ──────────────────────────
  const hashed = await bcrypt.hash('admin123', 10);

  const venue = await prisma.venue.upsert({
    where: { slug: 'bella-vista' },
    update: {},
    create: {
      slug:        'bella-vista',
      name:        'Bella Vista Café',
      tagline:     'Fine Dining · Addis Ababa',
      description: 'Nestled in the heart of Addis Ababa, Bella Vista Café blends traditional Ethiopian warmth with modern culinary artistry. Every dish tells a story of heritage, spice, and passion. Whether you are joining us for a quiet breakfast or a celebratory dinner, we promise an experience that lingers long after the last bite.',
      phone:       '+251 911 234 567',
      email:       'hello@bellavista.et',
      address:     '47 Bole Road, Bole Sub-City',
      city:        'Addis Ababa',
      country:     'Ethiopia',
      currency:    'ETB',
      facebook:    'https://facebook.com/bellavistacafe',
      instagram:   'https://instagram.com/bellavistacafe',
      website:     'https://bellavista.et',
      businessHours: {
        mon: { open: '07:00', close: '22:00', closed: false },
        tue: { open: '07:00', close: '22:00', closed: false },
        wed: { open: '07:00', close: '22:00', closed: false },
        thu: { open: '07:00', close: '22:00', closed: false },
        fri: { open: '07:00', close: '23:00', closed: false },
        sat: { open: '08:00', close: '23:00', closed: false },
        sun: { open: '09:00', close: '21:00', closed: false },
      },
      users: {
        create: {
          name:     'Kaleb Admin',
          email:    'admin@bellavista.et',
          password: hashed,
          role:     'ADMIN',
        }
      },
      theme: {
        create: {
          bgColor:      '#0d1f1a',
          accentColor:  '#c9a84c',
          cardColor:    '#122219',
          textColor:    '#e8e0d0',
          fontDisplay:  "'Cormorant Garamond', serif",
          fontBody:     "'DM Sans', sans-serif",
          borderRadius: 10,
          cardPadding:  10,
          itemGap:      8,
          showImages:   true,
          showPrice:    true,
          showMealTabs: true,
          showDesc:     true,
        }
      },
      amenities: {
        create: [
          { name: 'Free WiFi',      icon: 'wifi',       sortOrder: 0 },
          { name: 'Valet Parking',  icon: 'car',        sortOrder: 1 },
          { name: 'Air Conditioning', icon: 'wind',     sortOrder: 2 },
          { name: 'Rooftop Lounge', icon: 'building-2', sortOrder: 3 },
          { name: 'Fine Dining',    icon: 'chef-hat',   sortOrder: 4 },
          { name: 'Private Events', icon: 'sparkles',   sortOrder: 5 },
          { name: 'Live Music',     icon: 'music',      sortOrder: 6 },
          { name: 'Pet Friendly',   icon: 'paw-print',  sortOrder: 7 },
        ]
      }
    },
    include: { users: true }
  });

  const venueId = venue.id;
  console.log('✓ Venue created — id:', venueId);

  // ── Categories ────────────────────────────────────
  const cats = await Promise.all([
    // FOOD
    prisma.category.upsert({ where: { id: 1 }, update: {}, create: { venueId, name: 'Breakfast',    type: 'FOOD',  icon: '🌅', sortOrder: 0, isActive: true } }),
    prisma.category.upsert({ where: { id: 2 }, update: {}, create: { venueId, name: 'Starters',     type: 'FOOD',  icon: '🥗', sortOrder: 1, isActive: true } }),
    prisma.category.upsert({ where: { id: 3 }, update: {}, create: { venueId, name: 'Main Course',  type: 'FOOD',  icon: '🍽', sortOrder: 2, isActive: true } }),
    prisma.category.upsert({ where: { id: 4 }, update: {}, create: { venueId, name: 'Traditional',  type: 'FOOD',  icon: '🇪🇹', sortOrder: 3, isActive: true } }),
    prisma.category.upsert({ where: { id: 5 }, update: {}, create: { venueId, name: 'Desserts',     type: 'FOOD',  icon: '🍰', sortOrder: 4, isActive: true } }),
    // DRINK
    prisma.category.upsert({ where: { id: 6 }, update: {}, create: { venueId, name: 'Hot Drinks',   type: 'DRINK', icon: '☕', sortOrder: 5, isActive: true } }),
    prisma.category.upsert({ where: { id: 7 }, update: {}, create: { venueId, name: 'Cold Drinks',  type: 'DRINK', icon: '🧃', sortOrder: 6, isActive: true } }),
    prisma.category.upsert({ where: { id: 8 }, update: {}, create: { venueId, name: 'Fresh Juice',  type: 'DRINK', icon: '🍊', sortOrder: 7, isActive: true } }),
    prisma.category.upsert({ where: { id: 9 }, update: {}, create: { venueId, name: 'Cocktails',    type: 'DRINK', icon: '🍹', sortOrder: 8, isActive: true } }),
  ]);
  console.log('✓ Categories created:', cats.length);

  // ── Menu Items ────────────────────────────────────
  const items = [
    // BREAKFAST
    {
      categoryId: cats[0].id, name: 'Timatim Firfir Eggs',
      description: 'Fried eggs nestled over a slow-cooked spiced tomato and roasted pepper sauce, finished with a drizzle of niter kibbeh.',
      ingredients: ['Eggs', 'Roma tomato', 'Berbere', 'Roasted pepper', 'Niter kibbeh', 'Onion', 'Garlic'],
      allergens: ['Eggs', 'Dairy'], tags: ["Chef's Pick"],
      isFeatured: true, isAvailable: true, sortOrder: 0,
      variants: [
        { label: 'Single (1 egg)',  price: 85,  isDefault: false, isAvailable: true, sortOrder: 0 },
        { label: 'Double (2 eggs)', price: 130, isDefault: true,  isAvailable: true, sortOrder: 1 },
        { label: 'Special platter', price: 175, isDefault: false, isAvailable: true, sortOrder: 2 },
      ]
    },
    {
      categoryId: cats[0].id, name: 'Genfo (Barley Porridge)',
      description: 'Thick traditional barley porridge served warm with a well of spiced niter kibbeh in the centre and cool yogurt on the side.',
      ingredients: ['Barley flour', 'Niter kibbeh', 'Yogurt', 'Salt', 'Fenugreek'],
      allergens: ['Dairy', 'Gluten'], tags: ['Vegetarian'],
      isFeatured: false, isAvailable: true, sortOrder: 1,
      variants: [
        { label: 'Regular bowl', price: 70,  isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Large bowl',   price: 100, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[0].id, name: 'Scrambled Eggs & Spiced Butter',
      description: 'Fluffy eggs gently scrambled with Ethiopian niter kibbeh, fresh tomato, and green pepper. Served with toasted injera on the side.',
      ingredients: ['Eggs', 'Niter kibbeh', 'Tomato', 'Green pepper', 'Onion'],
      allergens: ['Eggs', 'Dairy'], tags: [],
      isFeatured: false, isAvailable: true, sortOrder: 2,
      variants: [
        { label: 'Small (2 eggs)',   price: 80,  isDefault: false, isAvailable: true, sortOrder: 0 },
        { label: 'Regular (3 eggs)', price: 105, isDefault: true,  isAvailable: true, sortOrder: 1 },
        { label: 'Large (4 eggs)',   price: 130, isDefault: false, isAvailable: true, sortOrder: 2 },
      ]
    },
    // STARTERS
    {
      categoryId: cats[1].id, name: 'Avocado Toast',
      description: 'Creamy Ethiopian avocado on sourdough toast with chilli flakes, lime, and microgreens.',
      ingredients: ['Avocado', 'Sourdough bread', 'Lime', 'Chilli flakes', 'Microgreens', 'Olive oil'],
      allergens: ['Gluten'], tags: ['Vegan'],
      isFeatured: true, isAvailable: true, sortOrder: 0,
      variants: [
        { label: 'Single slice', price: 110, isDefault: false, isAvailable: true, sortOrder: 0 },
        { label: 'Double slice', price: 180, isDefault: true,  isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[1].id, name: 'Sambusa Platter',
      description: 'Crispy fried pastry triangles stuffed with spiced lentils or minced beef, served with green jalapeño sauce.',
      ingredients: ['Pastry dough', 'Lentils', 'Onion', 'Cumin', 'Jalapeño', 'Coriander'],
      allergens: ['Gluten'], tags: [],
      isFeatured: false, isAvailable: true, sortOrder: 1,
      variants: [
        { label: 'Lentil (4 pcs)',    price: 95,  isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Beef (4 pcs)',      price: 115, isDefault: false, isAvailable: true, sortOrder: 1 },
        { label: 'Mixed platter (8)', price: 195, isDefault: false, isAvailable: true, sortOrder: 2 },
      ]
    },
    // MAIN COURSE
    {
      categoryId: cats[2].id, name: 'Grilled Tilapia',
      description: 'Whole fresh tilapia marinated in garlic, lemon, and herbs, grilled over charcoal and served with sautéed vegetables and rice.',
      ingredients: ['Tilapia', 'Garlic', 'Lemon', 'Rosemary', 'Thyme', 'Mixed vegetables', 'Basmati rice'],
      allergens: ['Fish'], tags: [],
      isFeatured: true, isAvailable: true, sortOrder: 0,
      variants: [
        { label: 'Half fish',  price: 280, isDefault: false, isAvailable: true, sortOrder: 0 },
        { label: 'Whole fish', price: 420, isDefault: true,  isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[2].id, name: 'Lamb Chops',
      description: 'Tender Ethiopian highland lamb chops marinated in berbere and grilled to perfection. Served with roasted potatoes and chimichurri.',
      ingredients: ['Lamb chops', 'Berbere', 'Garlic', 'Rosemary', 'Olive oil', 'Potatoes'],
      allergens: [], tags: ["Chef's Pick", 'Signature'],
      isFeatured: true, isAvailable: true, sortOrder: 1,
      variants: [
        { label: '2 chops', price: 350, isDefault: false, isAvailable: true, sortOrder: 0 },
        { label: '3 chops', price: 490, isDefault: true,  isAvailable: true, sortOrder: 1 },
        { label: '4 chops', price: 620, isDefault: false, isAvailable: true, sortOrder: 2 },
      ]
    },
    {
      categoryId: cats[2].id, name: 'Chicken Tikka Masala',
      description: 'Tender chicken pieces in a rich, creamy tomato-based sauce with aromatic spices. Served with saffron basmati rice and naan bread.',
      ingredients: ['Chicken breast', 'Tomato', 'Cream', 'Garam masala', 'Ginger', 'Garlic', 'Naan'],
      allergens: ['Dairy', 'Gluten'], tags: [],
      isFeatured: false, isAvailable: true, sortOrder: 2,
      variants: [
        { label: 'Regular',    price: 220, isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Extra rich', price: 265, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    // TRADITIONAL
    {
      categoryId: cats[3].id, name: 'Kitfo (Ethiopian Beef Tartare)',
      description: 'Premium minced raw or lightly cooked lean beef mixed with mitmita spice and spiced butter, served with ayib cheese and gomen.',
      ingredients: ['Lean beef', 'Mitmita', 'Niter kibbeh', 'Ayib cheese', 'Gomen', 'Injera'],
      allergens: ['Dairy'], tags: ['Signature', 'Traditional'],
      isFeatured: true, isAvailable: true, sortOrder: 0,
      variants: [
        { label: 'Lebleb (rare)',    price: 260, isDefault: false, isAvailable: true, sortOrder: 0 },
        { label: 'Tibs (cooked)',    price: 260, isDefault: true,  isAvailable: true, sortOrder: 1 },
        { label: 'Special (double)', price: 420, isDefault: false, isAvailable: true, sortOrder: 2 },
      ]
    },
    {
      categoryId: cats[3].id, name: 'Doro Wat',
      description: 'The queen of Ethiopian stews — chicken slow-cooked in a rich berbere sauce with hard-boiled eggs, niter kibbeh, and caramelised onions. Served with injera.',
      ingredients: ['Whole chicken', 'Berbere', 'Onion', 'Niter kibbeh', 'Eggs', 'Garlic', 'Ginger', 'Injera'],
      allergens: ['Eggs', 'Dairy'], tags: ['Traditional', 'Spicy'],
      isFeatured: true, isAvailable: true, sortOrder: 1,
      variants: [
        { label: 'Single portion', price: 195, isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Family platter', price: 580, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[3].id, name: 'Shiro Wat',
      description: 'Velvety spiced chickpea flour stew simmered with berbere, garlic, and onions. A beloved Ethiopian classic served with injera.',
      ingredients: ['Chickpea flour', 'Berbere', 'Garlic', 'Onion', 'Niter kibbeh', 'Injera'],
      allergens: ['Dairy'], tags: ['Vegan', 'Traditional'],
      isFeatured: false, isAvailable: true, sortOrder: 2,
      variants: [
        { label: 'Regular', price: 130, isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Large',   price: 185, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    // DESSERTS
    {
      categoryId: cats[4].id, name: 'Tiramisu',
      description: 'Classic Italian tiramisu made with espresso-soaked ladyfingers, rich mascarpone cream, and a dusting of premium cocoa.',
      ingredients: ['Mascarpone', 'Espresso', 'Ladyfingers', 'Cocoa powder', 'Eggs', 'Marsala wine'],
      allergens: ['Eggs', 'Dairy', 'Gluten'], tags: [],
      isFeatured: false, isAvailable: true, sortOrder: 0,
      variants: [
        { label: 'Single slice', price: 120, isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Double slice', price: 210, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[4].id, name: 'Avocado Ice Cream',
      description: 'Smooth, creamy house-made ice cream crafted from fresh Ethiopian avocados. A local favourite — silky, rich, and refreshing.',
      ingredients: ['Avocado', 'Cream', 'Sugar', 'Lime', 'Vanilla'],
      allergens: ['Dairy'], tags: ['Signature'],
      isFeatured: true, isAvailable: true, sortOrder: 1,
      variants: [
        { label: '1 scoop', price: 85,  isDefault: false, isAvailable: true, sortOrder: 0 },
        { label: '2 scoops', price: 140, isDefault: true,  isAvailable: true, sortOrder: 1 },
        { label: '3 scoops', price: 190, isDefault: false, isAvailable: true, sortOrder: 2 },
      ]
    },
    // HOT DRINKS
    {
      categoryId: cats[5].id, name: 'Ethiopian Coffee Ceremony',
      description: 'The full traditional coffee experience — freshly roasted and ground Yirgacheffe beans brewed in a jebena clay pot, served three rounds with popcorn.',
      ingredients: ['Yirgacheffe coffee', 'Popcorn', 'Incense'],
      allergens: [], tags: ['Traditional', 'Signature'],
      isFeatured: true, isAvailable: true, sortOrder: 0,
      variants: [
        { label: 'For one',  price: 95,  isDefault: false, isAvailable: true, sortOrder: 0 },
        { label: 'For two',  price: 160, isDefault: true,  isAvailable: true, sortOrder: 1 },
        { label: 'For four', price: 290, isDefault: false, isAvailable: true, sortOrder: 2 },
      ]
    },
    {
      categoryId: cats[5].id, name: 'Macchiato',
      description: 'Ethiopian macchiato — bold espresso topped with a generous cloud of steamed milk foam. The national coffee of Addis Ababa.',
      ingredients: ['Espresso', 'Steamed milk', 'Milk foam'],
      allergens: ['Dairy'], tags: [],
      isFeatured: false, isAvailable: true, sortOrder: 1,
      variants: [
        { label: 'Single', price: 45, isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Double', price: 70, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[5].id, name: 'Spiced Chai Latte',
      description: 'House-blended chai with cinnamon, cardamom, ginger, and cloves, steamed with creamy whole milk and a touch of honey.',
      ingredients: ['Black tea', 'Milk', 'Cinnamon', 'Cardamom', 'Ginger', 'Cloves', 'Honey'],
      allergens: ['Dairy'], tags: [],
      isFeatured: false, isAvailable: true, sortOrder: 2,
      variants: [
        { label: 'Regular', price: 65, isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Large',   price: 90, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    // COLD DRINKS
    {
      categoryId: cats[6].id, name: 'Fresh Mint Lemonade',
      description: 'Freshly squeezed lemons blended with garden mint, a hint of sugar, and sparkling water. Light, tangy, and utterly refreshing.',
      ingredients: ['Lemon', 'Fresh mint', 'Sugar', 'Sparkling water', 'Ice'],
      allergens: [], tags: ['Vegan'],
      isFeatured: false, isAvailable: true, sortOrder: 0,
      variants: [
        { label: 'Regular', price: 65, isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Large',   price: 90, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[6].id, name: 'Cold Brew Coffee',
      description: 'Single-origin Ethiopian Sidama beans steeped cold for 18 hours. Smooth, chocolatey, and naturally sweet — no bitterness.',
      ingredients: ['Sidama coffee', 'Cold water', 'Ice'],
      allergens: [], tags: [],
      isFeatured: true, isAvailable: true, sortOrder: 1,
      variants: [
        { label: 'Regular', price: 85,  isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Large',   price: 120, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    // FRESH JUICE
    {
      categoryId: cats[7].id, name: 'Layered Fruit Juice',
      description: 'The iconic Ethiopian juice glass — layers of avocado, mango, papaya, and guava juice stacked in a tall glass. A feast for the eyes and the palate.',
      ingredients: ['Avocado', 'Mango', 'Papaya', 'Guava', 'Sugar'],
      allergens: [], tags: ['Signature'],
      isFeatured: true, isAvailable: true, sortOrder: 0,
      variants: [
        { label: '3 layers', price: 95,  isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: '5 layers', price: 145, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[7].id, name: 'Mango Smoothie',
      description: 'Ripe Harar mangoes blended with yogurt and a touch of honey. Thick, creamy, and naturally sweet.',
      ingredients: ['Mango', 'Yogurt', 'Honey', 'Ice'],
      allergens: ['Dairy'], tags: [],
      isFeatured: false, isAvailable: true, sortOrder: 1,
      variants: [
        { label: 'Regular', price: 80,  isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Large',   price: 110, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    // COCKTAILS
    {
      categoryId: cats[8].id, name: 'Tej Spritz',
      description: 'House-made Ethiopian honey wine (tej) mixed with prosecco, fresh citrus, and a sprig of rue. A sophisticated twist on a ancient tradition.',
      ingredients: ['Tej (honey wine)', 'Prosecco', 'Orange juice', 'Rue', 'Ice'],
      allergens: ['Sulphites'], tags: ['Signature', 'Alcoholic'],
      isFeatured: true, isAvailable: true, sortOrder: 0,
      variants: [
        { label: 'Single glass', price: 180, isDefault: true,  isAvailable: true, sortOrder: 0 },
        { label: 'Bottle (4)',   price: 620, isDefault: false, isAvailable: true, sortOrder: 1 },
      ]
    },
    {
      categoryId: cats[8].id, name: 'Mocktail Sunrise',
      description: 'A vibrant non-alcoholic cocktail with layers of orange juice, grenadine, and sparkling water. As beautiful as an Addis sunrise.',
      ingredients: ['Orange juice', 'Grenadine', 'Sparkling water', 'Lime', 'Ice', 'Mint'],
      allergens: [], tags: ['Non-alcoholic'],
      isFeatured: false, isAvailable: true, sortOrder: 1,
      variants: [
        { label: 'Glass', price: 95, isDefault: true, isAvailable: true, sortOrder: 0 },
      ]
    },
  ];

  for (const item of items) {
    const { variants, ...data } = item;
    const created = await prisma.menuItem.create({
      data: {
        ...data,
        venueId,
        variants: {
          create: variants.map((v, i) => ({ ...v, sortOrder: i }))
        }
      }
    });
    console.log('  ✓ Item:', created.name);
  }

  // ── Reviews ───────────────────────────────────────
  await prisma.review.createMany({
    data: [
      { venueId, type: 'HOTEL',   rating: 5, guestName: 'Selam T.', comment: 'Absolutely stunning ambience. The warm lighting and the traditional décor made us feel so welcome. Will be our go-to spot.', isVisible: true },
      { venueId, type: 'FOOD',    rating: 5, guestName: 'Dawit M.', comment: 'The Kitfo was extraordinary — perfectly seasoned and the ayib was so fresh. Best traditional food in Bole by far.', isVisible: true },
      { venueId, type: 'SERVICE', rating: 5, guestName: 'Hanna B.', comment: 'The staff remembered our names on our second visit. That kind of personal touch is rare and truly appreciated.', isVisible: true },
      { venueId, type: 'FOOD',    rating: 4, guestName: 'Abel K.',  comment: 'Doro Wat was rich and deeply flavoured. The injera was perfectly fermented. Highly recommend the lamb chops too.', isVisible: true },
      { venueId, type: 'HOTEL',   rating: 5, guestName: 'Sara G.',  comment: 'The digital menu is such a nice touch — makes the whole experience feel premium before the food even arrives.', isVisible: true },
      { venueId, type: 'SERVICE', rating: 4, guestName: 'Yonas F.', comment: 'Quick, attentive service. Our waiter knew every dish on the menu and gave great recommendations.', isVisible: true },
      { venueId, type: 'FOOD',    rating: 5, guestName: 'Meron A.', comment: 'The layered juice is a must-order. And the avocado ice cream is unlike anything I have tasted in the city.', isVisible: true },
    ]
  });
  console.log('✓ Reviews seeded');

  // ── QR Codes ──────────────────────────────────────
  const baseUrl = 'http://localhost:5173/menu/bella-vista';
  await prisma.qRCode.createMany({
    data: [
      { venueId, label: 'Table 1',  type: 'TABLE',    url: baseUrl, scanCount: 24, isActive: true },
      { venueId, label: 'Table 2',  type: 'TABLE',    url: baseUrl, scanCount: 18, isActive: true },
      { venueId, label: 'Table 3',  type: 'TABLE',    url: baseUrl, scanCount: 31, isActive: true },
      { venueId, label: 'Table 4',  type: 'TABLE',    url: baseUrl, scanCount: 12, isActive: true },
      { venueId, label: 'Table 5',  type: 'TABLE',    url: baseUrl, scanCount: 9,  isActive: true },
      { venueId, label: 'Bar',      type: 'BAR',      url: baseUrl, scanCount: 47, isActive: true },
      { venueId, label: 'Rooftop',  type: 'OTHER',    url: baseUrl, scanCount: 38, isActive: true },
      { venueId, label: 'Room 101', type: 'ROOM',     url: baseUrl, scanCount: 5,  isActive: true },
    ]
  });
  console.log('✓ QR codes seeded');

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────');
  console.log('Login:    admin@bellavista.et');
  console.log('Password: admin123');
  console.log('Menu URL: http://localhost:5173/menu/bella-vista');
  console.log('─────────────────────────────');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

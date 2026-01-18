// Test loading each route file individually
console.log('Testing route files...\n');

const routes = [
  './src/routes/authRoutes',
  './src/routes/adminRoutes',
  './src/routes/userRoutes',
  './src/routes/equipmentRoutes',
  './src/routes/bookingRoutes',
  './src/routes/paymentRoutes',
  './src/routes/disputeRoutes',
  './src/routes/reviewRoutes'
];

routes.forEach(route => {
  try {
    console.log(`Loading ${route}...`);
    require(route);
    console.log(`✓ ${route} loaded successfully\n`);
  } catch (error) {
    console.error(`❌ Error loading ${route}:`);
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
});

console.log('✅ All routes loaded successfully!');

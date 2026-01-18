// Test loading authController
console.log('Testing authController...\n');

try {
  console.log('Loading authController...');
  const authController = require('./src/controllers/authController');
  console.log('✓ authController loaded successfully');
  console.log('Exported functions:', Object.keys(authController));
} catch (error) {
  console.error('❌ Error loading authController:');
  console.error(error.message);
  console.error('\nFull error:');
  console.error(error);
  process.exit(1);
}

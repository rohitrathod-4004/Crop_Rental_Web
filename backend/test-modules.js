// Test file to check which module is causing the error
console.log('Testing modules...');

try {
  console.log('1. Loading express...');
  require('express');
  console.log('✓ Express loaded');

  console.log('2. Loading dotenv...');
  require('dotenv').config();
  console.log('✓ Dotenv loaded');

  console.log('3. Loading app...');
  const app = require('./src/app');
  console.log('✓ App loaded');

  console.log('4. Loading database...');
  const connectDB = require('./src/config/database');
  console.log('✓ Database module loaded');

  console.log('\n✅ All modules loaded successfully!');
} catch (error) {
  console.error('\n❌ Error loading modules:');
  console.error(error);
  process.exit(1);
}

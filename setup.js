#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 PersonaPilot - Complete Auth Setup\n');
console.log('This script will help you configure your environment.\n');

// Generate secure random string
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      setupEnvironment();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setupEnvironment();
}

function setupEnvironment() {
  console.log('\n📝 Generating secure secrets...\n');

  const jwtSecret = generateSecret();
  const jwtRefreshSecret = generateSecret();
  const sessionSecret = generateSecret();

  console.log('✅ JWT Secret generated');
  console.log('✅ JWT Refresh Secret generated');
  console.log('✅ Session Secret generated\n');

  // Read .env.example
  let envContent = fs.readFileSync(envExamplePath, 'utf8');

  // Replace secrets
  envContent = envContent.replace(
    'JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars',
    `JWT_SECRET=${jwtSecret}`
  );
  envContent = envContent.replace(
    'JWT_REFRESH_SECRET=your-super-secret-refresh-token-change-this-in-production-min-32-chars',
    `JWT_REFRESH_SECRET=${jwtRefreshSecret}`
  );
  envContent = envContent.replace(
    'SESSION_SECRET=your-session-secret-change-this-in-production-min-32-chars',
    `SESSION_SECRET=${sessionSecret}`
  );

  // Write .env file
  fs.writeFileSync(envPath, envContent);

  console.log('✅ .env file created successfully!\n');
  console.log('📋 Next steps:\n');
  console.log('1. Edit .env file and add your credentials:');
  console.log('   - MongoDB URI');
  console.log('   - Google OAuth credentials');
  console.log('   - LinkedIn OAuth credentials');
  console.log('   - Gmail SMTP credentials');
  console.log('   - Other API keys as needed\n');
  console.log('2. Install dependencies:');
  console.log('   cd backend && npm install');
  console.log('   cd frontend && npm install\n');
  console.log('3. Start the application:');
  console.log('   Backend: cd backend && npm run dev');
  console.log('   Frontend: cd frontend && npm run dev\n');
  console.log('📖 See README.md for detailed setup instructions.\n');

  rl.close();
}

/**
 * Test Data Generator
 * 
 * This script creates a test user and sample data for API testing.
 * Run this script before running completeApiTests.js
 */

const axios = require('axios');

// API Base URLs
const BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_REGISTER_URL = `${BASE_URL}/auth/register`;

// Test user credentials - Update these as needed
const TEST_USER = {
  name: 'API Test User',
  email: 'test@example.com',
  password: 'testpassword123',
  passwordConfirm: 'testpassword123'
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

function colorText(text, color) {
  return `${color}${text}${colors.reset}`;
}

/**
 * Register a test user
 */
async function registerTestUser() {
  try {
    console.log(colorText('\nRegistering test user...', colors.blue));
    
    const response = await axios.post(AUTH_REGISTER_URL, TEST_USER);
    
    if (response.status === 201) {
      console.log(colorText('✓ Test user registered successfully', colors.green));
      console.log(colorText(`  Email: ${TEST_USER.email}`, colors.yellow));
      console.log(colorText(`  Password: ${TEST_USER.password}`, colors.yellow));
      return true;
    } else {
      console.log(colorText('✗ Unexpected response when registering test user', colors.red));
      return false;
    }
  } catch (error) {
    // Check if error is because user already exists
    if (error.response && 
        error.response.status === 400 && 
        error.response.data && 
        error.response.data.message && 
        error.response.data.message.includes('already exists')) {
      console.log(colorText('ℹ Test user already exists', colors.yellow));
      console.log(colorText(`  Email: ${TEST_USER.email}`, colors.yellow));
      console.log(colorText(`  Password: ${TEST_USER.password}`, colors.yellow));
      return true;
    } else {
      console.log(colorText('✗ Failed to register test user', colors.red));
      console.log(colorText(`  Error: ${error.message}`, colors.red));
      if (error.response) {
        console.log(colorText(`  Status: ${error.response.status}`, colors.red));
        console.log(colorText(`  Response: ${JSON.stringify(error.response.data, null, 2)}`, colors.red));
      }
      return false;
    }
  }
}

/**
 * Check if API server is running
 */
async function checkServerHealth() {
  try {
    console.log(colorText('\nChecking API server health...', colors.blue));
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.status === 200) {
      console.log(colorText('✓ API server is running', colors.green));
      return true;
    } else {
      console.log(colorText('✗ API server returned unexpected status code', colors.red));
      return false;
    }
  } catch (error) {
    console.log(colorText('✗ API server is not running or accessible', colors.red));
    console.log(colorText('  Make sure the server is running with "npm run dev"', colors.yellow));
    console.log(colorText(`  Error: ${error.message}`, colors.red));
    return false;
  }
}

/**
 * Run the data generation
 */
async function generateTestData() {
  console.log(colorText('================================', colors.blue));
  console.log(colorText('GENERATING TEST DATA', colors.blue));
  console.log(colorText('================================', colors.blue));
  
  // Check if server is running
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    return;
  }
  
  // Register test user
  const userRegistered = await registerTestUser();
  if (!userRegistered) {
    console.log(colorText('\n⚠️ Failed to set up test user. The API tests may fail.', colors.red));
    return;
  }
  
  console.log(colorText('\n✅ Test data setup is complete. You can now run the API tests.', colors.green));
  console.log(colorText('To run tests: node test/completeApiTests.js', colors.blue));
}

// Run the generator
generateTestData()
  .then(() => {
    console.log(colorText('\nData generation process completed.', colors.blue));
  })
  .catch((error) => {
    console.error(colorText('Unexpected error during data generation:', colors.red), error);
  });
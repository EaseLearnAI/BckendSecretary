/**
 * API Availability Tests
 * 
 * This script tests if the API endpoints are available and responding, without testing full functionality.
 * It's useful to check if the server structure matches what we expect.
 */

const axios = require('axios');

// API URLs
const BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_URL = `${BASE_URL}/auth/login`;
const HABITS_URL = `${BASE_URL}/habits`;
const CALENDAR_URL = `${BASE_URL}/calendar`;
const ASSISTANT_URL = `${BASE_URL}/assistant`;

// Check if server is running
async function checkServerHealth() {
  try {
    console.log('Checking server health...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log(`✓ Server is running (${response.status})`);
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error(`❌ Server health check failed: ${error.message}`);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Test if an endpoint is available (without testing full functionality)
async function checkEndpoint(name, url, method = 'get') {
  try {
    console.log(`Checking ${name} endpoint (${method.toUpperCase()} ${url})...`);
    const response = await axios({
      method,
      url,
      validateStatus: () => true // Accept any status code
    });
    
    // A 401 Unauthorized is actually good - it means the endpoint exists but needs auth
    if (response.status === 401) {
      console.log(`✓ ${name} endpoint exists (requires authentication)`);
      return true;
    } else if (response.status === 404) {
      console.log(`❌ ${name} endpoint not found (404)`);
      return false;
    } else {
      console.log(`✓ ${name} endpoint exists (status ${response.status})`);
      return true;
    }
  } catch (error) {
    console.error(`❌ ${name} endpoint check failed: ${error.message}`);
    return false;
  }
}

// Main test function
async function testApiAvailability() {
  try {
    console.log('Starting API availability tests...');
    console.log('================================\n');
    
    // Check if server is running
    const serverOk = await checkServerHealth();
    if (!serverOk) {
      console.error('❌ Cannot connect to server. Please make sure it is running.');
      process.exit(1);
    }
    
    console.log('\nChecking authentication endpoints...');
    await checkEndpoint('Login', AUTH_URL, 'post');
    
    console.log('\nChecking Habit API endpoints...');
    await checkEndpoint('Get habits', HABITS_URL);
    await checkEndpoint('Create habit', HABITS_URL, 'post');
    
    console.log('\nChecking Calendar API endpoints...');
    await checkEndpoint('Get calendar tasks', `${CALENDAR_URL}/tasks`);
    await checkEndpoint('Create calendar task', `${CALENDAR_URL}/tasks`, 'post');
    
    console.log('\nChecking Assistant API endpoints...');
    await checkEndpoint('Assistant status', `${ASSISTANT_URL}/status`);
    await checkEndpoint('Save conversation', `${ASSISTANT_URL}/conversations`, 'post');
    
    console.log('\n================================');
    console.log('✅ API availability check completed');
    console.log('Note: This only checks if endpoints exist, not their full functionality.');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testApiAvailability();
}

module.exports = {
  testApiAvailability,
  checkServerHealth,
  checkEndpoint
}; 
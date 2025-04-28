/**
 * Comprehensive API Integration Tests
 * 
 * This script tests all API endpoints for the backend service including:
 * - Authentication
 * - Habit API
 * - Calendar API
 * - Assistant API
 * 
 * Run with: node test/completeApiTests.js
 */

const axios = require('axios');

// Handle optional dependencies with fallbacks
let faker, chalk;
try {
  faker = require('@faker-js/faker').faker;
} catch (e) {
  // Create simple faker fallback
  faker = {
    string: {
      alphanumeric: (length) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }
    },
    lorem: {
      sentence: () => `Test sentence ${Math.floor(Math.random() * 1000)}`
    }
  };
  console.log('Warning: @faker-js/faker not found, using fallback random generator');
}

try {
  chalk = require('chalk');
} catch (e) {
  // Create simple chalk fallback
  chalk = {
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`
  };
  console.log('Warning: chalk not found, using fallback color formatter');
}

// API Base URLs
const BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_URL = `${BASE_URL}/auth/login`;
const HABITS_URL = `${BASE_URL}/habits`;
const CALENDAR_URL = `${BASE_URL}/calendar`;
const ASSISTANT_URL = `${BASE_URL}/assistant`;

// Test credentials - Replace with actual test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Global test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

// Global storage for created entities to use in subsequent tests
let authToken = '';
let userId = '';
let createdHabitId = '';
let createdCalendarTaskId = '';
let createdConversationId = '';

// Axios instance with auth token
const authAxios = axios.create();

// Test tracking functions
function logSuccess(message) {
  console.log(chalk.green(`✓ ${message}`));
  passedTests++;
  totalTests++;
}

function logFailure(message, error = null) {
  console.log(chalk.red(`✗ ${message}`));
  if (error) {
    if (error.response) {
      console.log(chalk.yellow(`  Status: ${error.response.status}`));
      console.log(chalk.yellow(`  Response: ${JSON.stringify(error.response.data, null, 2)}`));
    } else {
      console.log(chalk.yellow(`  Error: ${error.message}`));
    }
  }
  failedTests++;
  totalTests++;
}

function logSkipped(message) {
  console.log(chalk.yellow(`○ SKIPPED: ${message}`));
  skippedTests++;
  totalTests++;
}

function printTestSummary() {
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total Tests: ${totalTests}`);
  console.log(chalk.green(`Passed: ${passedTests}`));
  console.log(chalk.red(`Failed: ${failedTests}`));
  console.log(chalk.yellow(`Skipped: ${skippedTests}`));
  console.log('====================\n');
}

// ========================
// ENDPOINT TESTING FUNCTIONS
// ========================

// Authentication
async function testLogin() {
  try {
    console.log('\nTesting Login...');
    const response = await axios.post(AUTH_URL, TEST_USER);
    
    console.log('Login response status:', response.status);
    console.log('Login response data:', JSON.stringify(response.data, null, 2));
    
    // Check different possible response formats
    if (response.status === 200 || response.status === 201) {
      // Format 1: { token: '...', user: { id: '...' } }
      if (response.data.token && response.data.user && response.data.user.id) {
        authToken = response.data.token;
        userId = response.data.user.id;
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        logSuccess('Login successful (format: token + user object)');
        return true;
      }
      // Format 2: { token: '...', data: { id: '...' } }
      else if (response.data.token && response.data.data && response.data.data.id) {
        authToken = response.data.token;
        userId = response.data.data.id;
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        logSuccess('Login successful (format: token + data object)');
        return true;
      }
      // Format 3: { success: true, token: '...', user: { _id: '...' } }
      else if (response.data.token && response.data.user && response.data.user._id) {
        authToken = response.data.token;
        userId = response.data.user._id;
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        logSuccess('Login successful (format: token + user with _id)');
        return true;
      }
      // Format 4: { success: true, token: '...', userId: '...' }
      else if (response.data.token && response.data.userId) {
        authToken = response.data.token;
        userId = response.data.userId;
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        logSuccess('Login successful (format: token + userId field)');
        return true;
      }
      // Format 5: Chinese API format { success: true, data: { token: '...', user: { _id: '...' } } }
      else if (response.data.success === true && response.data.data && response.data.data.token && response.data.data.user && response.data.data.user._id) {
        authToken = response.data.data.token;
        userId = response.data.data.user._id;
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        logSuccess('Login successful (Chinese API format)');
        return true;
      }
      // No recognized format
      else {
        logFailure('Login response has unexpected format - cannot extract token or user ID');
        console.log('If you know the format, please update the testLogin function in completeApiTests.js');
        return false;
      }
    } else {
      logFailure(`Login failed - Unexpected status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    // Special handling for 401 error with Chinese message
    if (error.response && error.response.status === 401 && 
        error.response.data.error && 
        error.response.data.error.message && 
        error.response.data.error.message.includes('邮箱或密码不正确')) {
      logFailure('Login failed - Invalid email or password. Please update TEST_USER credentials.');
    } else {
      logFailure('Login failed', error);
    }
    return false;
  }
}

// Health Check
async function testAPIHealth() {
  try {
    console.log('\nChecking API Health...');
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.status === 200) {
      logSuccess('API Health check successful');
      return true;
    } else {
      logFailure('API Health check failed - Unexpected status code');
      return false;
    }
  } catch (error) {
    logFailure('API Health check failed', error);
    return false;
  }
}

// ========================
// HABIT API TESTS
// ========================

async function testCreateHabit() {
  try {
    console.log('\nTesting Create Habit...');
    
    const habitData = {
      name: `Test Habit ${faker.string.alphanumeric(5)}`,
      description: faker.lorem.sentence(),
      frequency: ['Monday', 'Wednesday', 'Friday'],
      reminder: true,
      reminderTime: '08:00',
      tags: ['test', 'api-test']
    };
    
    const response = await authAxios.post(HABITS_URL, habitData);
    
    if (response.status === 201 && response.data.data && response.data.data._id) {
      createdHabitId = response.data.data._id;
      console.log('Set createdHabitId to:', createdHabitId); // Debug log
      logSuccess(`Created habit with ID: ${createdHabitId}`);
      return true;
    } else {
      logFailure('Create habit failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Create habit failed', error);
    return false;
  }
}

async function testGetAllHabits() {
  try {
    console.log('\nTesting Get All Habits...');
    const response = await authAxios.get(HABITS_URL);
    
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} habits`);
      return true;
    } else {
      logFailure('Get all habits failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Get all habits failed', error);
    return false;
  }
}

async function testGetHabitTags() {
  try {
    console.log('\nTesting Get Habit Tags...');
    const response = await authAxios.get(`${HABITS_URL}/tags`);
    
    if (response.status === 200) {
      logSuccess('Retrieved habit tags');
      return true;
    } else {
      logFailure('Get habit tags failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Get habit tags failed', error);
    return false;
  }
}

async function testGetHabitById() {
  console.log('Current habitId:', createdHabitId); // Debug log
  
  if (!createdHabitId) {
    logSkipped('Get habit by ID - No habit created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Get Habit By ID...');
    const response = await authAxios.get(`${HABITS_URL}/${createdHabitId}`);
    
    if (response.status === 200 && response.data.data && response.data.data._id === createdHabitId) {
      logSuccess(`Retrieved habit with ID: ${createdHabitId}`);
      return true;
    } else {
      logFailure('Get habit by ID failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Get habit by ID failed', error);
    return false;
  }
}

async function testUpdateHabit() {
  if (!createdHabitId) {
    logSkipped('Update habit - No habit created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Update Habit...');
    const updateData = {
      name: `Updated Habit ${faker.string.alphanumeric(5)}`,
      description: faker.lorem.sentence()
    };
    
    const response = await authAxios.put(`${HABITS_URL}/${createdHabitId}`, updateData);
    
    if (response.status === 200 && response.data.data && response.data.data.name === updateData.name) {
      logSuccess(`Updated habit with ID: ${createdHabitId}`);
      return true;
    } else {
      logFailure('Update habit failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Update habit failed', error);
    return false;
  }
}

async function testCompleteHabit() {
  if (!createdHabitId) {
    logSkipped('Complete habit - No habit created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Complete Habit...');
    const completeData = {
      date: new Date().toISOString()
    };
    
    const response = await authAxios.post(`${HABITS_URL}/${createdHabitId}/complete`, completeData);
    
    if (response.status === 200) {
      logSuccess(`Completed habit with ID: ${createdHabitId}`);
      return true;
    } else {
      logFailure('Complete habit failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Complete habit failed', error);
    return false;
  }
}

async function testUncompleteHabit() {
  if (!createdHabitId) {
    logSkipped('Uncomplete habit - No habit created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Uncomplete Habit...');
    const uncompleteData = {
      date: new Date().toISOString()
    };
    
    const response = await authAxios.post(`${HABITS_URL}/${createdHabitId}/uncomplete`, uncompleteData);
    
    if (response.status === 200) {
      logSuccess(`Uncompleted habit with ID: ${createdHabitId}`);
      return true;
    } else {
      logFailure('Uncomplete habit failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Uncomplete habit failed', error);
    return false;
  }
}

async function testDeleteHabit() {
  if (!createdHabitId) {
    logSkipped('Delete habit - No habit created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Delete Habit...');
    const response = await authAxios.delete(`${HABITS_URL}/${createdHabitId}`);
    
    if (response.status === 200) {
      logSuccess(`Deleted habit with ID: ${createdHabitId}`);
      return true;
    } else {
      logFailure('Delete habit failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Delete habit failed', error);
    return false;
  }
}

// ========================
// CALENDAR API TESTS
// ========================

async function testCreateCalendarTask() {
  try {
    console.log('\nTesting Create Calendar Task...');
    
    // Create a task for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(11, 0, 0, 0);
    
    const taskData = {
      title: `Test Meeting ${faker.string.alphanumeric(5)}`,
      description: faker.lorem.sentence(),
      startDate: tomorrow.toISOString(),
      endDate: tomorrowEnd.toISOString(),
      isAllDay: false,
      isRecurring: false,
      priority: 'medium',
      tags: ['test', 'api-test']
    };
    
    const response = await authAxios.post(`${CALENDAR_URL}/tasks`, taskData);
    
    if (response.status === 201 && response.data.data && response.data.data._id) {
      createdCalendarTaskId = response.data.data._id;
      logSuccess(`Created calendar task with ID: ${createdCalendarTaskId}`);
      return true;
    } else {
      logFailure('Create calendar task failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Create calendar task failed', error);
    return false;
  }
}

async function testGetAllCalendarTasks() {
  try {
    console.log('\nTesting Get All Calendar Tasks...');
    const response = await authAxios.get(`${CALENDAR_URL}/tasks`);
    
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} calendar tasks`);
      return true;
    } else {
      logFailure('Get all calendar tasks failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Get all calendar tasks failed', error);
    return false;
  }
}

async function testGetCalendarTaskById() {
  if (!createdCalendarTaskId) {
    logSkipped('Get calendar task by ID - No task created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Get Calendar Task By ID...');
    const response = await authAxios.get(`${CALENDAR_URL}/tasks/${createdCalendarTaskId}`);
    
    if (response.status === 200 && response.data.data && response.data.data._id === createdCalendarTaskId) {
      logSuccess(`Retrieved calendar task with ID: ${createdCalendarTaskId}`);
      return true;
    } else {
      logFailure('Get calendar task by ID failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Get calendar task by ID failed', error);
    return false;
  }
}

async function testUpdateCalendarTask() {
  if (!createdCalendarTaskId) {
    logSkipped('Update calendar task - No task created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Update Calendar Task...');
    const updateData = {
      title: `Updated Meeting ${faker.string.alphanumeric(5)}`,
      description: faker.lorem.sentence()
    };
    
    const response = await authAxios.put(`${CALENDAR_URL}/tasks/${createdCalendarTaskId}`, updateData);
    
    if (response.status === 200 && response.data.data && response.data.data.title === updateData.title) {
      logSuccess(`Updated calendar task with ID: ${createdCalendarTaskId}`);
      return true;
    } else {
      logFailure('Update calendar task failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Update calendar task failed', error);
    return false;
  }
}

async function testDeleteCalendarTask() {
  if (!createdCalendarTaskId) {
    logSkipped('Delete calendar task - No task created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Delete Calendar Task...');
    const response = await authAxios.delete(`${CALENDAR_URL}/tasks/${createdCalendarTaskId}`);
    
    if (response.status === 200) {
      logSuccess(`Deleted calendar task with ID: ${createdCalendarTaskId}`);
      return true;
    } else {
      logFailure('Delete calendar task failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Delete calendar task failed', error);
    return false;
  }
}

// ========================
// ASSISTANT API TESTS
// ========================

async function testSaveConversation() {
  if (!userId) {
    logSkipped('Save conversation - No user ID available');
    return false;
  }
  
  try {
    console.log('\nTesting Save Conversation...');
    const conversationData = {
      userId: userId,
      message: `Test message ${faker.string.alphanumeric(10)}`,
      timestamp: new Date().toISOString()
    };
    
    const response = await authAxios.post(`${ASSISTANT_URL}/conversations`, conversationData);
    
    if (response.status === 201 && response.data.data && response.data.data._id) {
      createdConversationId = response.data.data._id;
      logSuccess(`Saved conversation with ID: ${createdConversationId}`);
      return true;
    } else {
      logFailure('Save conversation failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Save conversation failed', error);
    return false;
  }
}

async function testSaveResponse() {
  if (!userId) {
    logSkipped('Save response - No user ID available');
    return false;
  }
  
  try {
    console.log('\nTesting Save Assistant Response...');
    const responseData = {
      userId: userId,
      message: `Test response ${faker.string.alphanumeric(10)}`,
      timestamp: new Date().toISOString(),
      isResponse: true
    };
    
    const response = await authAxios.post(`${ASSISTANT_URL}/responses`, responseData);
    
    if (response.status === 201 && response.data.data && response.data.data._id) {
      logSuccess('Saved assistant response');
      return true;
    } else {
      logFailure('Save assistant response failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Save assistant response failed', error);
    return false;
  }
}

async function testGetConversations() {
  if (!userId) {
    logSkipped('Get conversations - No user ID available');
    return false;
  }
  
  try {
    console.log('\nTesting Get Conversations...');
    const response = await authAxios.get(`${ASSISTANT_URL}/conversations/${userId}`);
    
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} conversations`);
      return true;
    } else {
      logFailure('Get conversations failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Get conversations failed', error);
    return false;
  }
}

async function testAnalyzeInput() {
  if (!userId) {
    logSkipped('Analyze input - No user ID available');
    return false;
  }
  
  try {
    console.log('\nTesting Analyze Input...');
    const analyzeData = {
      userId: userId,
      message: 'Schedule a meeting tomorrow at 3pm with the marketing team'
    };
    
    const response = await authAxios.post(`${ASSISTANT_URL}/analyze`, analyzeData);
    
    if (response.status === 200 && response.data.data) {
      logSuccess('Analyzed input successfully');
      return true;
    } else {
      logFailure('Analyze input failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Analyze input failed', error);
    return false;
  }
}

async function testDeleteConversation() {
  if (!createdConversationId) {
    logSkipped('Delete conversation - No conversation created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Delete Conversation...');
    const response = await authAxios.delete(`${ASSISTANT_URL}/conversations/${createdConversationId}`);
    
    if (response.status === 200) {
      logSuccess(`Deleted conversation with ID: ${createdConversationId}`);
      return true;
    } else {
      logFailure('Delete conversation failed - Unexpected response format');
      return false;
    }
  } catch (error) {
    logFailure('Delete conversation failed', error);
    return false;
  }
}

// ========================
// RUN TESTS
// ========================

async function runTests() {
  console.log(chalk.blue('================================='));
  console.log(chalk.blue('STARTING COMPREHENSIVE API TESTS'));
  console.log(chalk.blue('================================='));
  
  // First check if the API is available
  const apiAvailable = await testAPIHealth();
  
  if (!apiAvailable) {
    console.log(chalk.red('\n⚠️ API is not available. Make sure the server is running.'));
    return;
  }
  
  // Try to authenticate
  const authenticated = await testLogin();
  
  if (!authenticated) {
    console.log(chalk.red('\n⚠️ Authentication failed. Cannot proceed with tests that require auth.'));
    console.log(chalk.yellow('Check if TEST_USER credentials are correct or register a test user.'));
    console.log(chalk.yellow('You might need to run "npm run dev" to start the server first.'));
    return;
  }
  
  // Habit API Tests
  console.log(chalk.blue('\n=== HABIT API TESTS ==='));
  await testCreateHabit();
  await testGetAllHabits();
  await testGetHabitTags();
  await testGetHabitById();
  await testUpdateHabit();
  await testCompleteHabit();
  await testUncompleteHabit();
  
  // Calendar API Tests
  console.log(chalk.blue('\n=== CALENDAR API TESTS ==='));
  await testCreateCalendarTask();
  await testGetAllCalendarTasks();
  await testGetCalendarTaskById();
  await testUpdateCalendarTask();
  
  // Assistant API Tests
  console.log(chalk.blue('\n=== ASSISTANT API TESTS ==='));
  await testSaveConversation();
  await testSaveResponse();
  await testGetConversations();
  await testAnalyzeInput();
  
  // Cleanup Tests
  console.log(chalk.blue('\n=== CLEANUP TESTS ==='));
  await testDeleteHabit();
  await testDeleteCalendarTask();
  await testDeleteConversation();
  
  // Print summary
  printTestSummary();
}

// Start the tests
runTests()
  .then(() => {
    console.log(chalk.blue('Tests completed.'));
  })
  .catch((error) => {
    console.error(chalk.red('Test execution error:'), error);
  }); 
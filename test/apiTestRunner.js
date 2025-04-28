/**
 * API Test Runner
 * 
 * This script tests the main API endpoints based on the API documentation
 * including Authentication, Habit API, Calendar API, and Assistant API
 * 
 * Run with: node test/apiTestRunner.js
 */

const axios = require('axios');

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
  console.log(`✓ ${message}`);
}

function logFailure(message, error = null) {
  console.log(`✗ ${message}`);
  if (error) {
    if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
  }
}

function logSkipped(message) {
  console.log(`○ SKIPPED: ${message}`);
}

// ========================
// AUTHENTICATION TESTS
// ========================

async function testLogin() {
  try {
    console.log('\nTesting Login...');
    const response = await axios.post(AUTH_URL, TEST_USER);
    
    console.log('Login response status:', response.status);
    
    if (response.status === 200 || response.status === 201) {
      // Common format: { token: '...', user: { ... } }
      if (response.data.token) {
        authToken = response.data.token;
        
        // Extract userId from various possible formats
        if (response.data.user?.id) {
          userId = response.data.user.id;
        } else if (response.data.user?._id) {
          userId = response.data.user._id;
        } else if (response.data.data?.id) {
          userId = response.data.data.id;
        } else if (response.data.userId) {
          userId = response.data.userId;
        } else if (response.data.data?.user?._id) {
          userId = response.data.data.user._id;
        }
        
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        logSuccess(`Login successful. User ID: ${userId}`);
        return true;
      } else {
        logFailure('Login response has unexpected format - cannot extract token');
        return false;
      }
    } else {
      logFailure(`Login failed - Unexpected status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    logFailure('Login failed', error);
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
      title: `Test Habit ${Math.random().toString(36).substring(7)}`,
      description: `This is a test habit created at ${new Date().toISOString()}`,
      frequency: 'daily',
      startDate: new Date().toISOString(),
      reminderTime: '08:00',
      priority: 'medium',
      tags: ['test', 'api-test'],
      color: '#FF5733'
    };
    
    const response = await authAxios.post(HABITS_URL, habitData);
    
    if (response.status === 201 && response.data.data && response.data.data._id) {
      createdHabitId = response.data.data._id;
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

async function testGetHabitById() {
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
      title: `Updated Habit ${Math.random().toString(36).substring(7)}`,
      description: `This habit was updated at ${new Date().toISOString()}`
    };
    
    const response = await authAxios.put(`${HABITS_URL}/${createdHabitId}`, updateData);
    
    if (response.status === 200 && response.data.data && response.data.data.title === updateData.title) {
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
    const response = await authAxios.post(`${HABITS_URL}/${createdHabitId}/complete`);
    
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
      title: `Test Meeting ${Math.random().toString(36).substring(7)}`,
      description: `Test calendar task created at ${new Date().toISOString()}`,
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

async function testUpdateCalendarTask() {
  if (!createdCalendarTaskId) {
    logSkipped('Update calendar task - No task created yet');
    return false;
  }
  
  try {
    console.log('\nTesting Update Calendar Task...');
    const updateData = {
      title: `Updated Meeting ${Math.random().toString(36).substring(7)}`,
      description: `This task was updated at ${new Date().toISOString()}`
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
      message: `Test message ${Math.random().toString(36).substring(7)}`,
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
  console.log('=================================');
  console.log('STARTING API TESTS');
  console.log('=================================');
  
  // Try to authenticate
  const authenticated = await testLogin();
  
  if (!authenticated) {
    console.log('\n⚠️ Authentication failed. Cannot proceed with tests that require auth.');
    console.log('Check if TEST_USER credentials are correct or register a test user.');
    return;
  }
  
  // Habit API Tests
  console.log('\n=== HABIT API TESTS ===');
  await testCreateHabit();
  await testGetAllHabits();
  await testGetHabitById();
  await testUpdateHabit();
  await testCompleteHabit();
  
  // Calendar API Tests
  console.log('\n=== CALENDAR API TESTS ===');
  await testCreateCalendarTask();
  await testGetAllCalendarTasks();
  await testUpdateCalendarTask();
  
  // Assistant API Tests
  console.log('\n=== ASSISTANT API TESTS ===');
  await testSaveConversation();
  await testGetConversations();
  await testAnalyzeInput();
  
  // Cleanup Tests
  console.log('\n=== CLEANUP TESTS ===');
  await testDeleteHabit();
  await testDeleteCalendarTask();
  await testDeleteConversation();
  
  console.log('\nTests completed.');
}

// Start the tests
runTests()
  .then(() => {
    console.log('All API endpoints have been tested.');
  })
  .catch((error) => {
    console.error('Test execution error:', error);
  }); 
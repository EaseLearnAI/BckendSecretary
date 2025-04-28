/**
 * API Endpoint Verification Tool
 * 
 * This tool validates all API endpoints documented in apiDocs.md by:
 * - Parsing the markdown documentation
 * - Testing each endpoint for accessibility and correctness
 * - Providing a summary of passed and failed tests
 * 
 * Usage: node apiEndpointVerifier.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Constants
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword'
};

// Store test results and IDs generated during testing for cleanup
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Store IDs for cleanup
const createdIds = {
  habits: [],
  calendarTasks: [],
  conversations: []
};

/**
 * Parse API documentation from markdown file
 */
function parseApiDocs() {
  try {
    const docPath = path.join(__dirname, '..', 'test', 'apiDocs.md');
    const markdown = fs.readFileSync(docPath, 'utf8');
    
    // Parse markdown into tokens
    const tokens = marked.lexer(markdown);
    
    // Extract API endpoints
    const endpoints = [];
    let currentSection = '';
    let currentEndpoint = null;
    
    for (const token of tokens) {
      if (token.type === 'heading') {
        if (token.depth === 1 || token.depth === 2) {
          currentSection = token.text;
        } else if (token.depth === 3) {
          // New endpoint
          if (currentEndpoint) {
            endpoints.push(currentEndpoint);
          }
          
          currentEndpoint = {
            title: token.text,
            section: currentSection,
            url: '',
            method: '',
            headers: {},
            requestBody: null,
            responseExample: null,
            parameters: []
          };
        }
      } else if (token.type === 'paragraph' && currentEndpoint) {
        // Extract URL and method from text like "GET /api/habits"
        const methodMatch = token.text.match(/(GET|POST|PUT|DELETE|PATCH)\s+(\S+)/);
        if (methodMatch) {
          currentEndpoint.method = methodMatch[1];
          currentEndpoint.url = methodMatch[2];
        }
      } else if (token.type === 'code' && currentEndpoint) {
        if (token.lang === 'json' && token.text.includes('"Content-Type"')) {
          // Headers
          try {
            currentEndpoint.headers = JSON.parse(token.text);
          } catch (e) {
            console.error(`Failed to parse headers for ${currentEndpoint.title}`);
          }
        } else if (token.lang === 'json' && (token.text.includes('{') || token.text.includes('['))) {
          // Check if it's a request body or response example
          if (!currentEndpoint.requestBody && 
              (token.text.includes('"name"') || 
               token.text.includes('"title"') || 
               token.text.includes('"email"'))) {
            try {
              currentEndpoint.requestBody = JSON.parse(token.text);
            } catch (e) {
              console.error(`Failed to parse request body for ${currentEndpoint.title}`);
            }
          } else if (!currentEndpoint.responseExample) {
            try {
              currentEndpoint.responseExample = JSON.parse(token.text);
            } catch (e) {
              console.error(`Failed to parse response example for ${currentEndpoint.title}`);
            }
          }
        }
      }
    }
    
    // Add the last endpoint
    if (currentEndpoint) {
      endpoints.push(currentEndpoint);
    }
    
    return endpoints;
  } catch (error) {
    console.error(`${colors.red}Failed to parse API documentation:${colors.reset}`, error);
    process.exit(1);
  }
}

/**
 * Log test result
 */
function logResult(endpoint, status, message, responseData) {
  const statusColor = status === 'PASS' ? colors.green : 
                      status === 'SKIP' ? colors.yellow : colors.red;
                      
  console.log(`\n${statusColor}${status}${colors.reset} - ${colors.bright}${endpoint.section} > ${endpoint.title}${colors.reset}`);
  console.log(`  ${colors.cyan}${endpoint.method} ${endpoint.url}${colors.reset}`);
  
  if (message) {
    console.log(`  ${message}`);
  }
  
  if (responseData) {
    console.log(`  Response: ${colors.dim}${JSON.stringify(responseData).substring(0, 150)}...${colors.reset}`);
  }
  
  testResults.details.push({
    endpoint: `${endpoint.section} > ${endpoint.title}`,
    status,
    message
  });
  
  if (status === 'PASS') {
    testResults.passed++;
  } else if (status === 'FAIL') {
    testResults.failed++;
  } else {
    testResults.skipped++;
  }
}

/**
 * Login to get auth token
 */
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, TEST_USER);
    return response.data.token;
  } catch (error) {
    console.error(`${colors.red}Login failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * Test a single API endpoint
 */
async function testEndpoint(endpoint, token) {
  const url = `${API_BASE_URL}${endpoint.url.replace('{id}', '{ID}')}`;
  
  // Replace any placeholder IDs in the URL
  let testUrl = url;
  
  if (endpoint.url.includes('/habits/{id}')) {
    if (createdIds.habits.length > 0) {
      testUrl = url.replace('{ID}', createdIds.habits[0]);
    } else {
      logResult(endpoint, 'SKIP', 'No habit ID available for testing');
      return;
    }
  } else if (endpoint.url.includes('/calendar/{id}')) {
    if (createdIds.calendarTasks.length > 0) {
      testUrl = url.replace('{ID}', createdIds.calendarTasks[0]);
    } else {
      logResult(endpoint, 'SKIP', 'No calendar task ID available for testing');
      return;
    }
  } else if (endpoint.url.includes('/conversations/{id}')) {
    if (createdIds.conversations.length > 0) {
      testUrl = url.replace('{ID}', createdIds.conversations[0]);
    } else {
      logResult(endpoint, 'SKIP', 'No conversation ID available for testing');
      return;
    }
  }
  
  // Set up request config
  const config = {
    headers: {}
  };
  
  // Add authentication token if needed
  if (endpoint.headers && endpoint.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add content type if needed
  if (endpoint.headers && endpoint.headers['Content-Type']) {
    config.headers['Content-Type'] = endpoint.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  
  try {
    let response;
    
    // Generate test data based on endpoint
    let testData = endpoint.requestBody;
    
    // For create endpoints, generate unique test data
    if (endpoint.title.includes('Create') || endpoint.title.includes('Save')) {
      const timestamp = Date.now();
      
      if (endpoint.section.includes('Habit')) {
        testData = {
          name: `Test Habit ${timestamp}`,
          description: 'Created by API verifier tool',
          frequency: 'daily',
          tags: ['test', 'verification']
        };
      } else if (endpoint.section.includes('Calendar')) {
        testData = {
          title: `Test Task ${timestamp}`,
          description: 'Created by API verifier tool',
          date: new Date().toISOString().split('T')[0],
          priority: 'medium'
        };
      } else if (endpoint.section.includes('Assistant')) {
        testData = {
          message: `Test message ${timestamp}`,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Execute request based on HTTP method
    switch (endpoint.method) {
      case 'GET':
        response = await axios.get(testUrl, config);
        break;
      case 'POST':
        response = await axios.post(testUrl, testData, config);
        
        // Store IDs for later testing and cleanup
        if (response.data && response.data.id) {
          if (endpoint.section.includes('Habit')) {
            createdIds.habits.push(response.data.id);
          } else if (endpoint.section.includes('Calendar')) {
            createdIds.calendarTasks.push(response.data.id);
          } else if (endpoint.section.includes('Assistant')) {
            createdIds.conversations.push(response.data.id);
          }
        }
        break;
      case 'PUT':
        response = await axios.put(testUrl, testData, config);
        break;
      case 'PATCH':
        response = await axios.patch(testUrl, testData, config);
        break;
      case 'DELETE':
        response = await axios.delete(testUrl, config);
        break;
      default:
        logResult(endpoint, 'SKIP', `Unsupported HTTP method: ${endpoint.method}`);
        return;
    }
    
    // Verify response
    if (response.status >= 200 && response.status < 300) {
      logResult(endpoint, 'PASS', `Status code: ${response.status}`, response.data);
    } else {
      logResult(endpoint, 'FAIL', `Unexpected status code: ${response.status}`, response.data);
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logResult(
        endpoint, 
        'FAIL', 
        `Status code: ${error.response.status} - ${error.message}`, 
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      logResult(endpoint, 'FAIL', `No response received: ${error.message}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      logResult(endpoint, 'FAIL', `Request error: ${error.message}`);
    }
  }
}

/**
 * Clean up any test data created during testing
 */
async function cleanup(token) {
  console.log(`\n${colors.blue}Cleaning up test data...${colors.reset}`);
  
  // Delete created habits
  for (const id of createdIds.habits) {
    try {
      await axios.delete(`${API_BASE_URL}/api/habits/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`  Deleted habit ID: ${id}`);
    } catch (error) {
      console.log(`  Failed to delete habit ID: ${id}`);
    }
  }
  
  // Delete created calendar tasks
  for (const id of createdIds.calendarTasks) {
    try {
      await axios.delete(`${API_BASE_URL}/api/calendar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`  Deleted calendar task ID: ${id}`);
    } catch (error) {
      console.log(`  Failed to delete calendar task ID: ${id}`);
    }
  }
  
  // Delete created conversations
  for (const id of createdIds.conversations) {
    try {
      await axios.delete(`${API_BASE_URL}/api/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`  Deleted conversation ID: ${id}`);
    } catch (error) {
      console.log(`  Failed to delete conversation ID: ${id}`);
    }
  }
}

/**
 * Print summary of test results
 */
function printSummary() {
  console.log(`\n${colors.bright}${colors.white}=== API Endpoint Verification Summary ===${colors.reset}`);
  console.log(`${colors.green}PASSED: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}FAILED: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}SKIPPED: ${testResults.skipped}${colors.reset}`);
  console.log(`${colors.white}TOTAL: ${testResults.passed + testResults.failed + testResults.skipped}${colors.reset}`);
  
  if (testResults.failed > 0) {
    console.log(`\n${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
    testResults.details
      .filter(detail => detail.status === 'FAIL')
      .forEach((detail, index) => {
        console.log(`  ${index + 1}. ${detail.endpoint}: ${detail.message}`);
      });
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.bright}${colors.white}=== API Endpoint Verification Tool ===${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${API_BASE_URL}${colors.reset}`);
  
  // Parse API documentation
  const endpoints = parseApiDocs();
  console.log(`${colors.blue}Parsed ${endpoints.length} API endpoints from documentation${colors.reset}`);
  
  // Login to get token
  console.log(`${colors.blue}Logging in as ${TEST_USER.email}...${colors.reset}`);
  const token = await login();
  console.log(`${colors.green}Login successful${colors.reset}`);
  
  // Test endpoints
  console.log(`${colors.blue}Testing endpoints...${colors.reset}`);
  
  // First test endpoints that create resources
  for (const endpoint of endpoints.filter(e => e.title.includes('Create') || e.title.includes('Save'))) {
    await testEndpoint(endpoint, token);
  }
  
  // Then test get endpoints
  for (const endpoint of endpoints.filter(e => e.method === 'GET')) {
    await testEndpoint(endpoint, token);
  }
  
  // Then test update endpoints
  for (const endpoint of endpoints.filter(e => 
    (e.method === 'PUT' || e.method === 'PATCH') && 
    !e.title.includes('Complete') && 
    !e.title.includes('Uncomplete')
  )) {
    await testEndpoint(endpoint, token);
  }
  
  // Test complete/uncomplete endpoints
  for (const endpoint of endpoints.filter(e => 
    e.title.includes('Complete') || e.title.includes('Uncomplete')
  )) {
    await testEndpoint(endpoint, token);
  }
  
  // Test delete endpoints last
  for (const endpoint of endpoints.filter(e => e.method === 'DELETE')) {
    await testEndpoint(endpoint, token);
  }
  
  // Clean up test data
  await cleanup(token);
  
  // Print summary
  printSummary();
  
  // Return exit code based on test results
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
}); 
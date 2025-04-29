/**
 * 日历API自动化测试脚本
 * 
 * 这个脚本会自动执行日历相关的所有API调用，包括：
 * - 健康检查
 * - 用户登录
 * - 获取所有日历任务
 * - 创建日历任务
 * - 获取特定日历任务
 * - 更新日历任务
 * - 删除日历任务
 * 
 * 使用方法: node test/calendarApiTest.js
 */

const axios = require('axios');

// API基础URL - 根据实际情况调整
const BASE_URL = 'http://localhost:3000/api/v1';

// ANSI颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// 登录凭证
const credentials = {
  email: 'abc1567849@gmail.com',
  password: '123456'
};

// 全局变量，存储测试过程中生成的数据
let token = null;
let userId = null;
let taskId = null;

/**
 * 打印API调用的结果
 */
function logApiResult(endpoint, method, success, data) {
  const statusSymbol = success ? '✓' : '✗';
  const statusColor = success ? colors.green : colors.red;
  const statusText = success ? 'OK' : 'Failed';
  
  console.log(`\n${statusColor}${statusSymbol} ${method.toUpperCase()} ${endpoint} - ${statusText}${colors.reset}`);
  console.log(colors.dim + JSON.stringify(data, null, 2) + colors.reset);
}

/**
 * 健康检查接口
 */
async function checkHealth() {
  console.log(`\n${colors.bright}${colors.blue}====== 健康检查 ======${colors.reset}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    logApiResult('/health', 'GET', true, response.data);
    return true;
  } catch (error) {
    logApiResult('/health', 'GET', false, {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}

/**
 * 用户登录接口
 */
async function login() {
  console.log(`\n${colors.bright}${colors.blue}====== 用户登录 ======${colors.reset}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    
    // 处理不同的响应结构
    if (response.data.token) {
      token = response.data.token;
      userId = response.data.user?.id || response.data.userId;
    } else if (response.data.data?.token) {
      token = response.data.data.token;
      userId = response.data.data.user?._id || response.data.data.user?.id || response.data.data.userId;
    }
    
    if (!token) {
      throw new Error('Token not found in response');
    }
    
    logApiResult('/auth/login', 'POST', true, response.data);
    console.log(`\n${colors.cyan}获取到 Token: ${token.substring(0, 15)}...${colors.reset}`);
    console.log(`${colors.cyan}用户 ID: ${userId}${colors.reset}`);
    
    return true;
  } catch (error) {
    logApiResult('/auth/login', 'POST', false, {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}

/**
 * 获取所有日历任务
 */
async function getAllCalendarTasks() {
  console.log(`\n${colors.bright}${colors.blue}====== 获取所有日历任务 ======${colors.reset}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/calendar/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    logApiResult('/calendar/tasks', 'GET', true, response.data);
    return true;
  } catch (error) {
    logApiResult('/calendar/tasks', 'GET', false, {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}

/**
 * 创建日历任务
 */
async function createCalendarTask() {
  console.log(`\n${colors.bright}${colors.blue}====== 创建日历任务 ======${colors.reset}`);
  
  const newTask = {
    title: `Test Task ${new Date().toISOString()}`,
    description: "测试通过API创建的日历任务",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString(), // 一小时后
    isAllDay: false,
    isRecurring: false,
    priority: "medium",
    tags: ["test", "api"]
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/calendar/tasks`, newTask, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
    
    // 保存任务ID，用于后续测试
    if (response.data.data?._id) {
      taskId = response.data.data._id;
    } else if (response.data.data?.id) {
      taskId = response.data.data.id;
    } else if (response.data._id) {
      taskId = response.data._id;
    }
    
    logApiResult('/calendar/tasks', 'POST', true, response.data);
    console.log(`\n${colors.cyan}创建的任务 ID: ${taskId}${colors.reset}`);
    
    return true;
  } catch (error) {
    logApiResult('/calendar/tasks', 'POST', false, {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}

/**
 * 获取特定日历任务
 */
async function getCalendarTaskById() {
  console.log(`\n${colors.bright}${colors.blue}====== 获取特定日历任务 ======${colors.reset}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/calendar/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    logApiResult(`/calendar/tasks/${taskId}`, 'GET', true, response.data);
    return true;
  } catch (error) {
    logApiResult(`/calendar/tasks/${taskId}`, 'GET', false, {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}

/**
 * 更新日历任务
 */
async function updateCalendarTask() {
  console.log(`\n${colors.bright}${colors.blue}====== 更新日历任务 ======${colors.reset}`);
  
  const updatedTask = {
    title: `Test Task Updated ${new Date().toISOString()}`,
    description: "通过API更新的日历任务描述",
    priority: "high",
    tags: ["test", "api", "updated"]
  };
  
  try {
    const response = await axios.put(`${BASE_URL}/calendar/tasks/${taskId}`, updatedTask, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
    
    logApiResult(`/calendar/tasks/${taskId}`, 'PUT', true, response.data);
    return true;
  } catch (error) {
    logApiResult(`/calendar/tasks/${taskId}`, 'PUT', false, {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}

/**
 * 删除日历任务
 */
async function deleteCalendarTask() {
  console.log(`\n${colors.bright}${colors.blue}====== 删除日历任务 ======${colors.reset}`);
  
  try {
    const response = await axios.delete(`${BASE_URL}/calendar/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 删除接口可能返回204（无内容）
    const responseData = response.status === 204 ? { status: 204, message: 'No Content' } : response.data;
    
    logApiResult(`/calendar/tasks/${taskId}`, 'DELETE', true, responseData);
    return true;
  } catch (error) {
    logApiResult(`/calendar/tasks/${taskId}`, 'DELETE', false, {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}

/**
 * 打印测试摘要
 */
function printSummary(results) {
  console.log(`\n${colors.bright}${colors.white}====== 测试摘要 ======${colors.reset}`);
  
  const total = results.length;
  const passed = results.filter(r => r.success).length;
  const failed = total - passed;
  
  console.log(`${colors.white}总计测试: ${total}${colors.reset}`);
  console.log(`${colors.green}通过: ${passed}${colors.reset}`);
  console.log(`${colors.red}失败: ${failed}${colors.reset}`);
  
  if (failed > 0) {
    console.log(`\n${colors.red}失败的测试:${colors.reset}`);
    results.filter(r => !r.success).forEach((result, index) => {
      console.log(`  ${index+1}. ${result.name}`);
    });
  }
  
  console.log(`\n${colors.bright}${colors.white}============================${colors.reset}`);
}

/**
 * 主测试函数 - 按顺序执行所有API调用
 */
async function runTests() {
  console.log(`${colors.bright}${colors.white}
====================================
     日历API自动化测试开始
====================================
${colors.reset}`);

  const testResults = [];
  let success;
  
  // 健康检查
  success = await checkHealth();
  testResults.push({ name: 'Health Check', success });
  
  // 用户登录
  success = await login();
  testResults.push({ name: 'Login', success });
  
  // 如果登录失败，就不继续测试需要认证的接口
  if (!success) {
    console.log(`\n${colors.red}登录失败，无法执行后续需要认证的测试${colors.reset}`);
    printSummary(testResults);
    return;
  }
  
  // 获取所有日历任务
  success = await getAllCalendarTasks();
  testResults.push({ name: 'Get All Calendar Tasks', success });
  
  // 创建日历任务
  success = await createCalendarTask();
  testResults.push({ name: 'Create Calendar Task', success });
  
  // 如果创建任务失败，就不继续测试依赖任务ID的接口
  if (!success) {
    console.log(`\n${colors.red}创建日历任务失败，无法执行后续依赖任务ID的测试${colors.reset}`);
    printSummary(testResults);
    return;
  }
  
  // 获取特定日历任务
  success = await getCalendarTaskById();
  testResults.push({ name: 'Get Calendar Task By ID', success });
  
  // 更新日历任务
  success = await updateCalendarTask();
  testResults.push({ name: 'Update Calendar Task', success });
  
  // 删除日历任务
  success = await deleteCalendarTask();
  testResults.push({ name: 'Delete Calendar Task', success });
  
  // 打印测试摘要
  printSummary(testResults);
}

// 执行测试
runTests().catch(error => {
  console.error(`${colors.red}测试过程中发生未捕获的错误:${colors.reset}`, error);
}); 
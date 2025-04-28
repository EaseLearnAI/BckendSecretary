/**
 * 简单API测试工具 - 专注于测试习惯完成/取消完成接口和其他关键API
 * 
 * 运行方式: node test/simpleApiTester.js
 */

const axios = require('axios');

// ANSI 颜色代码，用于控制台输出
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// API端点
const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = {
  // 认证接口
  login: `${API_BASE_URL}/api/users/login`,
  
  // 习惯相关接口
  getAllHabits: `${API_BASE_URL}/api/habits`,
  createHabit: `${API_BASE_URL}/api/habits`,
  getHabitById: (id) => `${API_BASE_URL}/api/habits/${id}`,
  updateHabit: (id) => `${API_BASE_URL}/api/habits/${id}`,
  deleteHabit: (id) => `${API_BASE_URL}/api/habits/${id}`,
  completeHabit: (id) => `${API_BASE_URL}/api/habits/${id}/complete`,
  uncompleteHabit: (id) => `${API_BASE_URL}/api/habits/${id}/uncomplete`,
  
  // 日历相关接口
  getAllCalendarTasks: `${API_BASE_URL}/api/calendar`,
  createCalendarTask: `${API_BASE_URL}/api/calendar`,
  getCalendarTaskById: (id) => `${API_BASE_URL}/api/calendar/${id}`,
  updateCalendarTask: (id) => `${API_BASE_URL}/api/calendar/${id}`,
  deleteCalendarTask: (id) => `${API_BASE_URL}/api/calendar/${id}`,
  
  // 助手相关接口
  saveConversation: `${API_BASE_URL}/api/assistant/conversation`,
  saveResponse: `${API_BASE_URL}/api/assistant/response`,
  getConversationHistory: (userId) => `${API_BASE_URL}/api/assistant/conversation/${userId}`
};

// 测试用户
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// 存储生成的实体ID
let authToken = null;
let userId = null;
let createdHabitId = null;
let createdCalendarTaskId = null;

/**
 * 输出彩色测试结果
 */
function logResult(testName, success, message = '', data = null) {
  const statusSymbol = success ? '✓' : '✗';
  const color = success ? COLORS.green : COLORS.red;
  
  console.log(`${color}${statusSymbol} ${testName}${COLORS.reset}`);
  
  if (message) {
    console.log(`  ${message}`);
  }
  
  if (data && !success) {
    console.log(`  ${COLORS.yellow}详细错误:${COLORS.reset}`, data);
  }
  
  console.log(''); // 空行分隔
}

/**
 * 测试用户登录并获取认证令牌
 */
async function testLogin() {
  try {
    console.log(`${COLORS.cyan}==== 测试登录 ====${COLORS.reset}\n`);
    
    const response = await axios.post(API_ENDPOINTS.login, TEST_USER);
    
    if (response.status === 200 && response.data && response.data.token) {
      authToken = response.data.token;
      userId = response.data.userId || response.data.user._id || response.data.user.id;
      
      logResult('用户登录', true, `获取到认证令牌: ${authToken.substring(0, 15)}...`);
      return true;
    } else {
      logResult('用户登录', false, '响应格式无效', response.data);
      return false;
    }
  } catch (error) {
    logResult('用户登录', false, `错误: ${error.message}`, error.response?.data);
    return false;
  }
}

/**
 * 测试创建习惯
 */
async function testCreateHabit() {
  try {
    console.log(`${COLORS.cyan}==== 测试创建习惯 ====${COLORS.reset}\n`);
    
    const newHabit = {
      name: '测试习惯 ' + new Date().toISOString(),
      description: '这是一个测试习惯描述',
      frequency: '每天',
      time: '09:00',
      reminder: true,
      tags: ['测试', 'API测试']
    };
    
    const response = await axios.post(
      API_ENDPOINTS.createHabit, 
      newHabit,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    if (response.status === 201 && response.data && response.data._id) {
      createdHabitId = response.data._id;
      logResult('创建习惯', true, `习惯ID: ${createdHabitId}`);
      return true;
    } else {
      logResult('创建习惯', false, '响应格式无效', response.data);
      return false;
    }
  } catch (error) {
    logResult('创建习惯', false, `错误: ${error.message}`, error.response?.data);
    return false;
  }
}

/**
 * 测试完成习惯
 */
async function testCompleteHabit() {
  try {
    console.log(`${COLORS.cyan}==== 测试完成习惯 ====${COLORS.reset}\n`);
    
    if (!createdHabitId) {
      logResult('完成习惯', false, '没有可用的习惯ID，请先创建习惯');
      return false;
    }
    
    const response = await axios.post(
      API_ENDPOINTS.completeHabit(createdHabitId),
      {},
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    if (response.status === 200 && response.data) {
      logResult('完成习惯', true, `习惯标记为已完成: ${createdHabitId}`);
      return true;
    } else {
      logResult('完成习惯', false, '响应格式无效', response.data);
      return false;
    }
  } catch (error) {
    logResult('完成习惯', false, `错误: ${error.message}`, error.response?.data);
    return false;
  }
}

/**
 * 测试取消完成习惯
 */
async function testUncompleteHabit() {
  try {
    console.log(`${COLORS.cyan}==== 测试取消完成习惯 ====${COLORS.reset}\n`);
    
    if (!createdHabitId) {
      logResult('取消完成习惯', false, '没有可用的习惯ID，请先创建习惯');
      return false;
    }
    
    const response = await axios.post(
      API_ENDPOINTS.uncompleteHabit(createdHabitId),
      {},
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    if (response.status === 200 && response.data) {
      logResult('取消完成习惯', true, `习惯标记为未完成: ${createdHabitId}`);
      return true;
    } else {
      logResult('取消完成习惯', false, '响应格式无效', response.data);
      return false;
    }
  } catch (error) {
    logResult('取消完成习惯', false, `错误: ${error.message}`, error.response?.data);
    return false;
  }
}

/**
 * 测试创建日历任务
 */
async function testCreateCalendarTask() {
  try {
    console.log(`${COLORS.cyan}==== 测试创建日历任务 ====${COLORS.reset}\n`);
    
    const newTask = {
      title: '测试任务 ' + new Date().toISOString(),
      description: '这是一个测试任务描述',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      priority: 'medium',
      status: 'pending'
    };
    
    const response = await axios.post(
      API_ENDPOINTS.createCalendarTask, 
      newTask,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    if (response.status === 201 && response.data && response.data._id) {
      createdCalendarTaskId = response.data._id;
      logResult('创建日历任务', true, `任务ID: ${createdCalendarTaskId}`);
      return true;
    } else {
      logResult('创建日历任务', false, '响应格式无效', response.data);
      return false;
    }
  } catch (error) {
    logResult('创建日历任务', false, `错误: ${error.message}`, error.response?.data);
    return false;
  }
}

/**
 * 测试保存对话
 */
async function testSaveConversation() {
  try {
    console.log(`${COLORS.cyan}==== 测试保存对话 ====${COLORS.reset}\n`);
    
    if (!userId) {
      logResult('保存对话', false, '没有可用的用户ID，请先登录');
      return false;
    }
    
    const conversation = {
      userId: userId,
      message: '这是一条测试消息 ' + new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    
    const response = await axios.post(
      API_ENDPOINTS.saveConversation, 
      conversation,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    
    if (response.status === 201 && response.data) {
      logResult('保存对话', true, '对话已保存');
      return true;
    } else {
      logResult('保存对话', false, '响应格式无效', response.data);
      return false;
    }
  } catch (error) {
    logResult('保存对话', false, `错误: ${error.message}`, error.response?.data);
    return false;
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  console.log(`${COLORS.cyan}==== 清理测试数据 ====${COLORS.reset}\n`);
  
  try {
    // 清理创建的习惯
    if (createdHabitId) {
      await axios.delete(
        API_ENDPOINTS.deleteHabit(createdHabitId),
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      logResult('删除测试习惯', true, `习惯ID: ${createdHabitId}`);
    }
    
    // 清理创建的日历任务
    if (createdCalendarTaskId) {
      await axios.delete(
        API_ENDPOINTS.deleteCalendarTask(createdCalendarTaskId),
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      logResult('删除测试日历任务', true, `任务ID: ${createdCalendarTaskId}`);
    }
    
    return true;
  } catch (error) {
    logResult('清理测试数据', false, `错误: ${error.message}`, error.response?.data);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log(`${COLORS.bright}${COLORS.blue}
====================================
      简单API测试工具
====================================
${COLORS.reset}\n`);

  try {
    // 1. 登录并获取令牌
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log(`${COLORS.red}登录失败，终止测试${COLORS.reset}`);
      return;
    }
    
    // 2. 测试创建习惯
    const createHabitSuccess = await testCreateHabit();
    if (!createHabitSuccess) {
      console.log(`${COLORS.yellow}创建习惯失败，继续测试...${COLORS.reset}`);
    }
    
    // 3. 测试完成习惯
    await testCompleteHabit();
    
    // 4. 测试取消完成习惯
    await testUncompleteHabit();
    
    // 5. 测试创建日历任务
    await testCreateCalendarTask();
    
    // 6. 测试保存对话
    await testSaveConversation();
    
    // 7. 清理测试数据
    await cleanupTestData();

    console.log(`${COLORS.green}${COLORS.bright}
====================================
      测试完成
====================================
${COLORS.reset}\n`);
  } catch (error) {
    console.error(`${COLORS.red}测试过程中出现未捕获的错误:${COLORS.reset}`, error);
  }
}

// 执行测试
runAllTests(); 
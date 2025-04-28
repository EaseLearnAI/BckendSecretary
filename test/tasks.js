const axios = require('axios');
const chalk = require('chalk');

// 测试配置
const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';
const TIMESTAMP = Date.now();
const TEST_GROUP = `测试任务组_${TIMESTAMP}`;
const TEST_TASK = `测试任务_${TIMESTAMP}`;

let authToken = '';
let createdGroupId = '';
let createdTaskId = '';

// 测试流程执行器
async function runTests() {
  try {
    // 1. 用户登录获取Token
    console.log(chalk.cyan('\n[1/8] 用户登录'));
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: process.env.TEST_EMAIL || 'abc1567849@gmail.com',
      password: process.env.TEST_PASSWORD || '123456'
    });
    authToken = loginRes.data.data.token;
    console.log(chalk.green('✓ 获取Token成功'), authToken.slice(0, 20) + '...');

    // 2. 创建任务组
    console.log(chalk.cyan('\n[2/8] 创建任务组'));
    const groupRes = await axios.post(`${BASE_URL}/task-groups`, {
      name: TEST_GROUP
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    createdGroupId = groupRes.data.data._id;
    console.log(chalk.green('✓ 创建成功'), `ID: ${createdGroupId}`);

    // 3. 创建任务
    console.log(chalk.cyan('\n[3/8] 创建任务'));
    const taskRes = await axios.post(`${BASE_URL}/tasks`, {
      name: TEST_TASK,
      groupId: createdGroupId,
      priority: 'high'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    createdTaskId = taskRes.data.data._id;
    console.log(chalk.green('✓ 创建成功'), `ID: ${createdTaskId}`);

    // 在测试配置部分添加虚拟数据配置
const VIRTUAL_TASK_COUNT = 5; // 生成5个虚拟任务

// 在创建任务组后添加虚拟数据生成
console.log(chalk.cyan('\n[3/8] 生成虚拟任务'));
const virtualTasks = [];
for (let i = 1; i <= VIRTUAL_TASK_COUNT; i++) {
  const taskRes = await axios.post(`${BASE_URL}/tasks`, {
    name: `虚拟任务_${TIMESTAMP}_${i}`,
    groupId: createdGroupId,
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    dueDate: new Date(Date.now() + (i * 86400000)).toISOString(), // 每天递增的截止日期
    isImportant: Math.random() > 0.5,
    isUrgent: Math.random() > 0.5
  }, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  virtualTasks.push(taskRes.data.data._id);
  console.log(chalk.green(`✓ 虚拟任务${i}创建成功`), taskRes.data.data.name);
}

// 原第3步及后续步骤序号需要调整（原[3/8]改为[4/8]，依此类推）

    // 4. 获取任务详情
    console.log(chalk.cyan('\n[4/8] 获取任务详情'));
    const taskDetail = await axios.get(`${BASE_URL}/tasks/${createdTaskId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(chalk.green('✓ 获取成功'), taskDetail.data.data);

    // 5. 更新任务状态
    console.log(chalk.cyan('\n[5/8] 更新任务状态'));
    await axios.patch(`${BASE_URL}/tasks/${createdTaskId}/status`, {
      completed: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(chalk.green('✓ 更新成功'));

    // 6. 记录番茄钟
    console.log(chalk.cyan('\n[6/8] 记录番茄钟'));
    const pomodoroRes = await axios.post(
      `${BASE_URL}/tasks/${createdTaskId}/pomodoro`,
      {
        duration: 1500,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 1500000).toISOString()
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(chalk.green('✓ 记录成功'), pomodoroRes.data.data._id);

    // 7. 删除任务
    console.log(chalk.cyan('\n[7/8] 删除任务'));
    await axios.delete(`${BASE_URL}/tasks/${createdTaskId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(chalk.green('✓ 删除成功'));

    // 8. 删除任务组
    console.log(chalk.cyan('\n[8/8] 删除任务组'));
    await axios.delete(`${BASE_URL}/task-groups/${createdGroupId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(chalk.green('✓ 删除成功'));

  } catch (error) {
    console.error(chalk.red('\n测试失败:'), error.response?.data || error.message);
    process.exit(1);
  }
}

// 执行测试
runTests().then(() => {
  console.log(chalk.bgGreen.black('\n 所有任务相关接口测试通过 '));
});
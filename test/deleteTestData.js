const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Task = require('../src/models/Task');
const TaskGroup = require('../src/models/TaskGroup');

const cleanupTestData = async () => {
  try {
    await connectDB();
    
    // 删除测试任务（匹配生成脚本创建的任务名称模式）
    const taskResult = await Task.deleteMany({ 
      name: /【.*?】/ 
    });
    
    // 删除测试任务组（匹配生成脚本创建的任务组名称后缀）
    const groupResult = await TaskGroup.deleteMany({ 
      name: /工作组$/ 
    });
    
    console.log(`已删除 ${taskResult.deletedCount} 个测试任务`);
    console.log(`已删除 ${groupResult.deletedCount} 个测试任务组`);
    process.exit(0);
  } catch (error) {
    console.error('数据删除失败:', error);
    process.exit(1);
  }
};

cleanupTestData();
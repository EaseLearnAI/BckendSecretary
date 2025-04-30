/**
 * 反馈API接口测试脚本
 * 测试所有反馈相关的API接口
 */

const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// 设置API基础URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const FEEDBACK_API = `${API_BASE_URL}/feedback`;

// 测试数据
const testFeedback = {
  userInput: "模仿周杰伦说话",
  encourageStyle: "热情鼓励",
  criticizeStyle: "建设性批评"
};

// 存储测试过程中创建的记录ID
let createdFeedbackId = null;

/**
 * 测试生成反馈API
 */
async function testCreateFeedback() {
  console.log('\n===== 测试生成反馈 =====');
  try {
    console.log('请求数据:', JSON.stringify(testFeedback, null, 2));
    
    // 发送POST请求
    const response = await axios.post(FEEDBACK_API, testFeedback);
    
    // 检查响应状态码
    if (response.status !== 201) {
      throw new Error(`预期状态码201，实际状态码${response.status}`);
    }
    
    // 检查响应数据结构
    const { data } = response;
    if (!data.success || !data.data || !data.meta) {
      throw new Error('响应数据结构不符合预期');
    }
    
    // 检查返回的鼓励和批评语句是否存在
    if (!data.data.encourage || !data.data.criticize) {
      throw new Error('响应中缺少鼓励或批评语句');
    }
    
    // 保存创建的记录ID，用于后续测试
    createdFeedbackId = data.data.id;
    
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    console.log('✓ 生成反馈测试通过!');
    console.log(`✓ 创建的反馈ID: ${createdFeedbackId}`);
    
    return true;
  } catch (error) {
    console.error('✗ 生成反馈测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应:', error.response.data);
    }
    return false;
  }
}

/**
 * 测试获取所有反馈API
 */
async function testGetAllFeedback() {
  console.log('\n===== 测试获取所有反馈 =====');
  try {
    // 发送GET请求
    const response = await axios.get(FEEDBACK_API);
    
    // 检查响应状态码
    if (response.status !== 200) {
      throw new Error(`预期状态码200，实际状态码${response.status}`);
    }
    
    // 检查响应数据结构
    const { data } = response;
    if (!data.success || !Array.isArray(data.data) || !data.pagination) {
      throw new Error('响应数据结构不符合预期');
    }
    
    console.log('状态码:', response.status);
    console.log('数据总数:', data.pagination.total);
    console.log('当前页数据条数:', data.data.length);
    console.log('✓ 获取所有反馈测试通过!');
    
    return true;
  } catch (error) {
    console.error('✗ 获取所有反馈测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应:', error.response.data);
    }
    return false;
  }
}

/**
 * 测试获取单个反馈API
 */
async function testGetFeedbackById() {
  console.log('\n===== 测试获取单个反馈 =====');
  
  // 如果没有创建的反馈ID，则跳过此测试
  if (!createdFeedbackId) {
    console.log('✗ 跳过测试：没有可用的反馈ID');
    return false;
  }
  
  try {
    // 发送GET请求
    const response = await axios.get(`${FEEDBACK_API}/${createdFeedbackId}`);
    
    // 检查响应状态码
    if (response.status !== 200) {
      throw new Error(`预期状态码200，实际状态码${response.status}`);
    }
    
    // 检查响应数据结构
    const { data } = response;
    if (!data.success || !data.data) {
      throw new Error('响应数据结构不符合预期');
    }
    
    // 确保返回的记录与我们创建的匹配
    if (data.data.userInput !== testFeedback.userInput) {
      throw new Error('返回的记录与创建的不匹配');
    }
    
    console.log('状态码:', response.status);
    console.log('反馈ID:', data.data._id);
    console.log('用户输入:', data.data.userInput);
    console.log('鼓励消息:', data.data.encourageMessage);
    console.log('批评消息:', data.data.criticizeMessage);
    console.log('✓ 获取单个反馈测试通过!');
    
    return true;
  } catch (error) {
    console.error('✗ 获取单个反馈测试失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应:', error.response.data);
    }
    return false;
  }
}

/**
 * 测试错误处理 - 缺少必填字段
 */
async function testMissingRequiredFields() {
  console.log('\n===== 测试错误处理 - 缺少必填字段 =====');
  try {
    // 请求数据缺少必填字段
    const invalidData = {
      userInput: "测试输入"
      // 故意不提供encourageStyle和criticizeStyle
    };
    
    console.log('请求数据:', JSON.stringify(invalidData, null, 2));
    
    // 发送POST请求
    await axios.post(FEEDBACK_API, invalidData);
    
    // 如果请求没有抛出错误，则测试失败
    console.error('✗ 测试失败: 预期应该返回400错误，但请求成功了');
    return false;
  } catch (error) {
    // 应该捕获到400错误
    if (error.response && error.response.status === 400) {
      console.log('状态码:', error.response.status);
      console.log('错误消息:', error.response.data.message);
      console.log('✓ 错误处理测试通过!');
      return true;
    } else {
      console.error('✗ 测试失败: 预期状态码400，实际状态码', error.response ? error.response.status : '未知');
      if (error.response) {
        console.error('错误响应:', error.response.data);
      }
      return false;
    }
  }
}

/**
 * 测试无效ID处理
 */
async function testInvalidId() {
  console.log('\n===== 测试错误处理 - 无效ID =====');
  try {
    // 使用无效的ID
    const invalidId = 'invalid-id-12345';
    
    // 发送GET请求
    await axios.get(`${FEEDBACK_API}/${invalidId}`);
    
    // 如果请求没有抛出错误，则测试失败
    console.error('✗ 测试失败: 预期应该返回404或500错误，但请求成功了');
    return false;
  } catch (error) {
    // 应该捕获到404或500错误
    if (error.response && (error.response.status === 404 || error.response.status === 500)) {
      console.log('状态码:', error.response.status);
      console.log('错误消息:', error.response.data.message);
      console.log('✓ 无效ID处理测试通过!');
      return true;
    } else {
      console.error('✗ 测试失败: 预期状态码404或500，实际状态码', error.response ? error.response.status : '未知');
      if (error.response) {
        console.error('错误响应:', error.response.data);
      }
      return false;
    }
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始测试反馈API接口...\n');
  
  // 存储测试结果
  const results = {
    createFeedback: false,
    getAllFeedback: false,
    getFeedbackById: false,
    missingRequiredFields: false,
    invalidId: false
  };
  
  try {
    // 运行测试
    results.createFeedback = await testCreateFeedback();
    results.getAllFeedback = await testGetAllFeedback();
    results.getFeedbackById = await testGetFeedbackById();
    results.missingRequiredFields = await testMissingRequiredFields();
    results.invalidId = await testInvalidId();
    
    // 显示测试结果摘要
    console.log('\n===== 测试结果摘要 =====');
    Object.entries(results).forEach(([name, passed]) => {
      console.log(`${passed ? '✓' : '✗'} ${name}: ${passed ? '通过' : '失败'}`);
    });
    
    // 计算通过率
    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.values(results).length;
    const passRate = (passedCount / totalCount) * 100;
    
    console.log(`\n总通过率: ${passRate.toFixed(2)}% (${passedCount}/${totalCount})`);
    
    if (passedCount === totalCount) {
      console.log('\n🎉 所有测试通过!');
    } else {
      console.log('\n❌ 部分测试失败，请检查上述输出找出问题所在。');
    }
  } catch (error) {
    console.error('\n测试过程中出现未捕获的错误:', error);
  }
}

// 执行测试
runAllTests().catch(error => {
  console.error('运行测试时出错:', error);
}); 
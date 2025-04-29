/**
 * 简单API测试
 */

const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:3000/api/v1';

async function testHealth() {
  try {
    console.log('测试健康检查端点...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('健康检查成功:', response.data);
    return true;
  } catch (error) {
    console.error('健康检查失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

// 执行测试
testHealth()
  .then(success => {
    console.log(success ? '测试通过' : '测试失败');
  })
  .catch(err => {
    console.error('测试过程中发生错误:', err.message);
  }); 
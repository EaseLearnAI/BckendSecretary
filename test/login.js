const axios = require('axios');
const chalk = require('chalk');  // 确保已安装chalk@4（通过 npm install chalk@4）

// 测试配置
const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1/auth';
const TIMESTAMP = Date.now();
const TEST_EMAIL = `test_${TIMESTAMP}@supertimer.com`;
const TEST_PASSWORD = 'Test@1234';

// 测试用例执行器
async function runTests() {
    try {
        // 1. 正常注册测试
        console.log(chalk.cyan('\n[测试用例1] 正常注册'));
        const registerRes = await axios.post(`${BASE_URL}/register`, {
          name: '测试用户',
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        
        console.log(chalk.green('✓ 注册成功'), {
          status: registerRes.status,
          data: registerRes.data
        });
    
    
        // 2. 重复注册测试
        console.log(chalk.cyan('\n[测试用例2] 重复注册'));
        try {
          await axios.post(`${BASE_URL}/register`, {
            name: '测试用户',
            email: TEST_EMAIL,
            password: TEST_PASSWORD
          });
        } catch (error) {
          console.log(chalk.green('✓ 重复注册拦截成功'), {
            status: error.response.status,
            data: error.response.data
          });
        }
    
    
        // 3. 无效邮箱注册测试
        console.log(chalk.cyan('\n[测试用例3] 无效邮箱注册'));
        try {
          await axios.post(`${BASE_URL}/register`, {
            name: '测试用户',
            email: 'invalid_email',
            password: TEST_PASSWORD
          });
        } catch (error) {
          console.log(chalk.green('✓ 无效邮箱拦截成功'), {
            status: error.response.status,
            data: error.response.data
          });
        }
    
    
        // 4. 正常登录测试
        console.log(chalk.cyan('\n[测试用例4] 正常登录'));
        const loginRes = await axios.post(`${BASE_URL}/login`, {
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        
        console.log(chalk.green('✓ 登录成功'), {
          status: loginRes.status,
          token: loginRes.data.data.token.slice(0, 20) + '...' // 安全显示部分token
        });
    
    
        // 5. 错误密码登录测试
        console.log(chalk.cyan('\n[测试用例5] 错误密码登录'));
        try {
          await axios.post(`${BASE_URL}/login`, {
            email: TEST_EMAIL,
            password: 'wrong_password'
          });
        } catch (error) {
          console.log(chalk.green('✓ 错误密码拦截成功'), {
            status: error.response.status,
            data: error.response.data
          });
        }
    
    
        // 6. 获取用户信息测试
        console.log(chalk.cyan('\n[测试用例6] 获取用户信息'));
        const userRes = await axios.get(`${BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${loginRes.data.data.token}`
          }
        });
        
        console.log(chalk.green('✓ 用户信息获取成功'), {
          status: userRes.status,
          data: userRes.data
        });
    
    
      } catch (error) {
    console.error(chalk.red(`\n测试失败: ${error.message}`));  // 合并字符串参数
    process.exit(1);
  }
}

runTests().then(() => {
  console.log(chalk.bgGreen.black('\n 所有测试用例执行完成 '));  // 链式调用验证
});
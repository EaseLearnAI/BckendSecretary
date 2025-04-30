/**
 * Feedback Service Test Script
 * Used to test the Doubao API integration and feedback generation
 * and store test results in MongoDB
 */

const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// MongoDB Connection
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/supertimer';
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Define FeedbackMessage Schema
const FeedbackMessageSchema = new mongoose.Schema(
  {
    userInput: { type: String, required: true, trim: true },
    encourageStyle: { type: String, required: true, trim: true },
    criticizeStyle: { type: String, required: true, trim: true },
    encourageMessage: { type: String, required: true, trim: true },
    criticizeMessage: { type: String, required: true, trim: true },
    rawResponse: { type: String, required: false, trim: true },
    tokenUsage: {
      prompt_tokens: { type: Number, default: 0 },
      completion_tokens: { type: Number, default: 0 },
      total_tokens: { type: Number, default: 0 }
    },
    processingTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create Model (only if it doesn't exist)
const FeedbackMessage = mongoose.models.FeedbackMessage || 
  mongoose.model('FeedbackMessage', FeedbackMessageSchema);

// Configuration
const ARK_API_KEY = "6edbe8d5-7584-4c69-b062-6ef8c4d367f4";
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MODEL_NAME = "ep-20250427122528-dvmvp"; // Doubao-1.5-lite-32k model endpoint

/**
 * Generate a feedback request to the Doubao API and save to MongoDB
 * @param {string} userInput - User input text
 * @param {string} encourageStyle - Style for encouragement message
 * @param {string} criticizeStyle - Style for criticism message
 */
async function testFeedbackGeneration(userInput, encourageStyle, criticizeStyle) {
  console.log('\n--- 测试反馈生成 ---');
  console.log(`用户输入: "${userInput}"`);
  console.log(`鼓励风格: "${encourageStyle}"`);
  console.log(`批评风格: "${criticizeStyle}"`);
  
  // Construct the prompt
  const prompt = `请根据以下要求，生成一句鼓励语句和一句批评语句，并以JSON格式返回：
{
  "encourage": "鼓励语句",
  "criticize": "批评语句"
}
用户输入内容：${userInput}
鼓励语句要求：请用"${userInput}+${encourageStyle}"的表达风格来鼓励用户。
批评语句要求：请用"${userInput}+${criticizeStyle}"的表达风格来提出批评建议。
注意：只返回JSON对象，不要添加其他内容。`;

  console.log('\n正在发送请求到 Doubao API...');
  
  try {
    // Prepare the payload
    const payload = {
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "你是一个擅长生成反馈信息的AI助手。请严格按照用户要求的JSON格式输出内容。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    };
    
    // Record start time
    const startTime = Date.now();
    
    // Send request to API
    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ARK_API_KEY}`
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    console.log(`\n请求完成，响应时间: ${responseTime}ms`);
    
    // Extract and parse the result
    const result = response.data;
    const assistantMessage = result.choices[0].message.content;
    
    console.log('\n原始响应:');
    console.log(assistantMessage);
    
    // Try to parse as JSON
    try {
      // Clean up the response if needed
      let cleanedResponse = assistantMessage.trim();
      
      // Remove markdown code block markers if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.substring(7);
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.substring(3);
      }
      
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
      }
      
      cleanedResponse = cleanedResponse.trim();
      
      // Parse the JSON
      const parsedResponse = JSON.parse(cleanedResponse);
      
      console.log('\n解析结果:');
      console.log('鼓励消息:', parsedResponse.encourage);
      console.log('批评消息:', parsedResponse.criticize);
      
      console.log('\nToken 使用情况:');
      console.log(`- 提示词 tokens: ${result.usage.prompt_tokens}`);
      console.log(`- 输出 tokens: ${result.usage.completion_tokens}`);
      console.log(`- 总 tokens: ${result.usage.total_tokens}`);
      
      // Save to MongoDB
      const feedbackData = {
        userInput,
        encourageStyle,
        criticizeStyle,
        encourageMessage: parsedResponse.encourage,
        criticizeMessage: parsedResponse.criticize,
        rawResponse: assistantMessage,
        tokenUsage: {
          prompt_tokens: result.usage.prompt_tokens,
          completion_tokens: result.usage.completion_tokens,
          total_tokens: result.usage.total_tokens
        },
        processingTime: responseTime
      };
      
      const feedback = new FeedbackMessage(feedbackData);
      await feedback.save();
      
      console.log('\n测试结果已保存到 MongoDB');
      console.log(`文档 ID: ${feedback._id}`);
      
      return {
        success: true,
        data: parsedResponse,
        usage: result.usage,
        responseTime,
        mongoId: feedback._id
      };
    } catch (error) {
      console.error('解析 JSON 失败:', error.message);
      console.log('将尝试使用正则表达式提取内容...');
      
      // Try to extract content using regex
      const encourageMatch = assistantMessage.match(/"encourage"\s*:\s*"([^"]*)"/);
      const criticizeMatch = assistantMessage.match(/"criticize"\s*:\s*"([^"]*)"/);
      
      if (encourageMatch && criticizeMatch) {
        const extractedData = {
          encourage: encourageMatch[1],
          criticize: criticizeMatch[1]
        };
        
        console.log('\n提取结果:');
        console.log('鼓励消息:', extractedData.encourage);
        console.log('批评消息:', extractedData.criticize);
        
        // Save to MongoDB
        const feedbackData = {
          userInput,
          encourageStyle,
          criticizeStyle,
          encourageMessage: extractedData.encourage,
          criticizeMessage: extractedData.criticize,
          rawResponse: assistantMessage,
          tokenUsage: {
            prompt_tokens: result.usage.prompt_tokens,
            completion_tokens: result.usage.completion_tokens,
            total_tokens: result.usage.total_tokens
          },
          processingTime: responseTime
        };
        
        const feedback = new FeedbackMessage(feedbackData);
        await feedback.save();
        
        console.log('\n测试结果已保存到 MongoDB');
        console.log(`文档 ID: ${feedback._id}`);
        
        return {
          success: true,
          data: extractedData,
          usage: result.usage,
          responseTime,
          note: '内容通过正则表达式提取，非严格JSON解析',
          mongoId: feedback._id
        };
      } else {
        throw new Error('无法从响应中提取有效内容');
      }
    }
  } catch (error) {
    console.error('请求失败:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', error.response.data);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

// Run tests with sample inputs
async function runTests() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const testCases = [
      {
        userInput: "今天我完成了所有计划的工作",
        encourageStyle: "热情鼓励",
        criticizeStyle: "建设性批评"
      }
    ];
    
    console.log('开始测试 Doubao API 调用和反馈生成...\n');
    
    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n===== 测试用例 ${index + 1} =====`);
      await testFeedbackGeneration(
        testCase.userInput,
        testCase.encourageStyle,
        testCase.criticizeStyle
      );
      console.log('\n' + '-'.repeat(50));
    }
    
    console.log('\n测试完成！');
    
    // 验证MongoDB中是否存在刚保存的数据
    const count = await FeedbackMessage.countDocuments();
    console.log(`\nMongoDB中反馈消息总数: ${count}`);
    
    // 获取最近的一条记录
    const latestFeedback = await FeedbackMessage.findOne().sort({ createdAt: -1 });
    if (latestFeedback) {
      console.log('\n最新保存的反馈消息:');
      console.log(`ID: ${latestFeedback._id}`);
      console.log(`用户输入: ${latestFeedback.userInput}`);
      console.log(`鼓励风格: ${latestFeedback.encourageStyle}`);
      console.log(`批评风格: ${latestFeedback.criticizeStyle}`);
      console.log(`鼓励消息: ${latestFeedback.encourageMessage}`);
      console.log(`批评消息: ${latestFeedback.criticizeMessage}`);
      console.log(`处理时间: ${latestFeedback.processingTime}ms`);
      console.log(`Token使用: ${latestFeedback.tokenUsage.total_tokens}`);
    }
    
    // 关闭MongoDB连接
    await mongoose.connection.close();
    console.log('\nMongoDB连接已关闭');
  } catch (error) {
    console.error('测试过程中出错:', error);
    // 确保关闭MongoDB连接
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nMongoDB连接已关闭');
    }
  }
}

// Run the tests
runTests().catch(error => {
  console.error('测试过程中出错:', error);
}); 
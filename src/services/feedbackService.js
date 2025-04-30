/**
 * Feedback Service
 * Service for generating encouragement and criticism messages using Doubao-1.5-lite-32k model
 */

const axios = require('axios');
const logger = require('../utils/logger');

// Environment variables or hardcoded values (consider moving to .env in production)
const ARK_API_KEY = "6edbe8d5-7584-4c69-b062-6ef8c4d367f4";
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const MODEL_NAME = "ep-20250427122528-dvmvp"; // Doubao-1.5-lite-32k model endpoint

/**
 * Generate encouragement and criticism messages based on user input and specified styles
 * @param {string} userInput - User input text
 * @param {string} encourageStyle - Style for encouragement message
 * @param {string} criticizeStyle - Style for criticism message
 * @returns {Promise<Object>} - Object containing the generated messages
 */
async function generateFeedback(userInput, encourageStyle, criticizeStyle) {
  try {
    logger.info('Generating feedback messages', { userInput, encourageStyle, criticizeStyle });
    
    // Construct the prompt for the LLM
    const prompt = constructPrompt(userInput, encourageStyle, criticizeStyle);
    
    // Prepare the payload for the API request
    const payload = {
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "你是一个擅长生成反馈信息的AI助手。请严格按照用户要求的JSON格式输出内容。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7 // Adjust as needed for the right balance of creativity and consistency
    };

    // Log the API request attempt
    logger.debug('Sending request to Doubao LLM API', { prompt });
    
    // Send request to the API
    const startTime = Date.now();
    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ARK_API_KEY}`
      },
      timeout: 15000 // 15 seconds timeout
    });
    
    const responseTime = Date.now() - startTime;
    logger.debug(`API response received in ${responseTime}ms`, { responseTime });
    
    // Extract and parse the generated content
    const result = response.data;
    const assistantMessage = result.choices[0].message.content;
    
    // Parse the JSON response
    try {
      // Clean up the response if needed (e.g., remove markdown code block markers)
      const cleanedMessage = cleanJsonResponse(assistantMessage);
      const parsedResponse = JSON.parse(cleanedMessage);
      
      logger.info('Successfully generated feedback messages', { 
        tokenUsage: result.usage,
        responseTime 
      });
      
      return {
        encourage: parsedResponse.encourage,
        criticize: parsedResponse.criticize,
        rawResponse: assistantMessage,
        tokenUsage: result.usage,
        responseTime
      };
    } catch (parseError) {
      logger.error('Failed to parse LLM response as JSON', { 
        error: parseError.message, 
        rawResponse: assistantMessage
      });
      
      // Attempt to extract content using regex as a fallback
      const extractedContent = extractJsonContent(assistantMessage);
      if (extractedContent) {
        return extractedContent;
      }
      
      throw new Error(`Invalid response format: ${parseError.message}`);
    }
  } catch (error) {
    logger.error('Error generating feedback', { 
      error: error.message, 
      stack: error.stack 
    });
    
    if (error.response) {
      logger.error('API error details', { 
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw new Error(`Failed to generate feedback: ${error.message}`);
  }
}

/**
 * Construct the prompt for the LLM
 * @param {string} userInput - User input text
 * @param {string} encourageStyle - Style for encouragement message
 * @param {string} criticizeStyle - Style for criticism message
 * @returns {string} - Formatted prompt for the LLM
 */
function constructPrompt(userInput, encourageStyle, criticizeStyle) {
    return `请用模仿${userInput}说话的方式，分别说一句${encourageStyle}的话和一句${criticizeStyle}的话，并以JSON格式返回：
  {
    "encourage": "热情鼓励的话",
    "criticize": "直接批评的话"
  }
  注意：只返回JSON对象，不要添加其他内容。`;
  }
  // ... existing code ...

/**
 * Clean the JSON response from potential markup or formatting
 * @param {string} response - Raw response from LLM
 * @returns {string} - Cleaned JSON string
 */
function cleanJsonResponse(response) {
  let cleanedResponse = response.trim();
  
  // Remove markdown code block markers if present
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.substring(7);
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.substring(3);
  }
  
  if (cleanedResponse.endsWith('```')) {
    cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
  }
  
  return cleanedResponse.trim();
}

/**
 * Extract JSON content using regex as a fallback
 * @param {string} text - Text to extract JSON from
 * @returns {Object|null} - Extracted JSON object or null if not found
 */
function extractJsonContent(text) {
  try {
    // Try to find JSON-like content within the text
    const jsonMatch = text.match(/\{[\s\S]*"encourage"[\s\S]*"criticize"[\s\S]*\}/);
    if (jsonMatch) {
      const jsonContent = jsonMatch[0];
      return JSON.parse(jsonContent);
    }
    
    // Alternative approach: extract individual fields if JSON parsing fails
    const encourageMatch = text.match(/"encourage"\s*:\s*"([^"]*)"/);
    const criticizeMatch = text.match(/"criticize"\s*:\s*"([^"]*)"/);
    
    if (encourageMatch && criticizeMatch) {
      return {
        encourage: encourageMatch[1],
        criticize: criticizeMatch[1]
      };
    }
    
    return null;
  } catch (error) {
    logger.error('Error extracting JSON content', { error: error.message });
    return null;
  }
}

module.exports = {
  generateFeedback
}; 
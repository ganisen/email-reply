/**
 * Token generator utility module
 * Provides functions to generate unique tokens with expiration dates
 * and validate existing tokens
 */

const { randomUUID } = require('crypto');

/**
 * Generate a unique token with expiration date
 * @param {Object} options - Configuration options
 * @param {number} options.expiresInDays - Days until token expires (default: 7)
 * @returns {Object} Token object with token and expiration date
 */
const generateToken = (options = {}) => {
  const { expiresInDays = 7 } = options;
  
  // Generate a UUID using Node's built-in crypto module
  const token = randomUUID();
  
  // Calculate expiration date
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expiresInDays);
  
  return {
    token,
    expirationDate
  };
};

/**
 * Validate a token against existing tokens and expiration
 * @param {string} token - Token to validate
 * @param {Array|Function} existingTokens - Array of tokens or function to check token existence
 * @returns {boolean} Whether token is valid
 */
const validateToken = async (token, existingTokens) => {
  if (!token) {
    return false;
  }

  // If existingTokens is a function, call it to check if token exists
  if (typeof existingTokens === 'function') {
    try {
      const tokenData = await existingTokens(token);
      
      if (!tokenData) {
        return false;
      }
      
      // Check if token has expired
      const expirationDate = new Date(tokenData.expirationDate);
      return expirationDate > new Date();
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
  
  // If existingTokens is an array, check if token exists in array
  if (Array.isArray(existingTokens)) {
    const tokenData = existingTokens.find(t => t.token === token);
    
    if (!tokenData) {
      return false;
    }
    
    // Check if token has expired
    const expirationDate = new Date(tokenData.expirationDate);
    return expirationDate > new Date();
  }
  
  return false;
};

module.exports = {
  generateToken,
  validateToken
};

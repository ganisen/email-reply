/**
 * Token service
 * Handles token generation, uniqueness verification, and persistence
 */

const db = require('../db');
const { generateToken } = require('../utils/tokenGenerator');

/**
 * Maximum number of attempts to generate a unique token
 */
const MAX_TOKEN_ATTEMPTS = 5;

/**
 * GenerateAndSaveToken - Generates a unique token and stores it with email metadata
 * 
 * @param {Object} emailData - Email metadata to store
 * @param {string} emailData.sender_email - The email of the sender
 * @param {string} emailData.recipient_email - The email of the recipient
 * @param {string} emailData.subject - The email subject
 * @param {string} emailData.content - The email content
 * @param {Object} options - Configuration options
 * @param {number} options.expiresInDays - Days until token expires (default: 7)
 * @returns {Promise<Object>} Object containing token, email metadata, and success status
 * @throws {Error} If token generation or database operations fail
 */
const generateAndSaveToken = async (emailData, options = {}) => {
  const { expiresInDays = 7 } = options;
  
  if (!emailData || !emailData.sender_email || !emailData.recipient_email || 
      !emailData.subject || !emailData.content) {
    throw new Error('Missing required email data');
  }

  // Use a transaction to ensure atomicity
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    
    let tokenData = null;
    let isUnique = false;
    let attempts = 0;
    
    // Try to generate a unique token up to MAX_TOKEN_ATTEMPTS times
    while (!isUnique && attempts < MAX_TOKEN_ATTEMPTS) {
      attempts++;
      
      // Generate token and expiration date
      tokenData = generateToken({ expiresInDays });
      
      // Check if token already exists
      const checkResult = await client.query(
        'SELECT EXISTS(SELECT 1 FROM email_metadata WHERE token = $1) AS "exists"',
        [tokenData.token]
      );
      
      isUnique = !checkResult.rows[0].exists;
      
      if (!isUnique && attempts === MAX_TOKEN_ATTEMPTS) {
        throw new Error('Failed to generate a unique token after multiple attempts');
      }
    }
    
    // Insert the token and email metadata into the database
    const queryText = `
      INSERT INTO email_metadata 
        (token, sender_email, recipient_email, subject, content, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, token, created_at, expires_at
    `;
    
    const values = [
      tokenData.token,
      emailData.sender_email,
      emailData.recipient_email,
      emailData.subject,
      emailData.content,
      tokenData.expirationDate
    ];
    
    const result = await client.query(queryText, values);
    await client.query('COMMIT');
    
    return {
      success: true,
      token: tokenData.token,
      emailMetadata: result.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Token generation and saving failed:', error);
    
    throw new Error(`Failed to generate and save token: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * getTokenData - Retrieves email metadata associated with a token
 * 
 * @param {string} token - The token to look up
 * @returns {Promise<Object|null>} The email metadata if found, null otherwise
 * @throws {Error} If database operations fail
 */
const getTokenData = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const query = `
      SELECT id, token, sender_email, recipient_email, subject, content, 
             created_at, expires_at, is_active
      FROM email_metadata
      WHERE token = $1 AND expires_at > NOW() AND is_active = true
    `;
    
    const result = await db.query(query, [token]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Token lookup failed:', error);
    throw new Error(`Failed to retrieve token data: ${error.message}`);
  }
};

/**
 * logResponse - Logs a response action for a token
 * 
 * @param {string} token - The token being used
 * @param {string} actionType - The type of action (accept/decline)
 * @param {Object} requestInfo - Additional request information
 * @returns {Promise<Object>} The logged response data
 * @throws {Error} If database operations fail
 */
const logResponse = async (token, actionType, requestInfo = {}) => {
  const { ipAddress, userAgent } = requestInfo;
  
  try {
    const query = `
      INSERT INTO response_logs
        (token, action_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4)
      RETURNING id, token, action_type, response_time
    `;
    
    const values = [token, actionType, ipAddress, userAgent];
    const result = await db.query(query, values);
    
    return result.rows[0];
  } catch (error) {
    console.error('Response logging failed:', error);
    // This is non-critical, so we'll just log the error but not throw
    return null;
  }
};

module.exports = {
  generateAndSaveToken,
  getTokenData,
  logResponse
}; 
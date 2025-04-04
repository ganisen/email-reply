/**
 * Email routes
 * Handles API routes related to email operations
 */

const express = require('express');
const router = express.Router();
const tokenService = require('../services/tokenService');

/**
 * POST /api/emails
 * Creates a new email with a unique token for tracking responses
 */
router.post('/', async (req, res) => {
  try {
    const { sender_email, recipient_email, subject, content, expires_in_days } = req.body;
    
    // Generate and save token with email metadata
    const result = await tokenService.generateAndSaveToken(
      { sender_email, recipient_email, subject, content },
      { expiresInDays: expires_in_days || 7 }
    );
    
    return res.status(201).json({
      success: true,
      message: 'Email token generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error generating email token:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to generate email token',
      error: error.message
    });
  }
});

module.exports = router; 
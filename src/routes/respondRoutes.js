/**
 * Respond routes
 * Handles the response endpoints when users click on email buttons
 */

const express = require('express');
const router = express.Router();
const tokenService = require('../services/tokenService');

/**
 * GET /respond
 * Handles button click responses from emails and redirects to mailto link
 */
router.get('/', async (req, res) => {
  const { token, action } = req.query;
  
  if (!token || !action) {
    return res.status(400).send('Invalid request. Missing token or action.');
  }
  
  try {
    // Validate the token and get associated email data
    const tokenData = await tokenService.getTokenData(token);
    
    if (!tokenData) {
      return res.status(404).send('Token invalid or expired.');
    }
    
    // Log the response action
    await tokenService.logResponse(token, action, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Determine response content based on action
    let subject = '';
    let body = '';
    
    if (action.toLowerCase() === 'accept') {
      subject = `RE: ${tokenData.subject} - ACCEPTED`;
      body = `I accept the deal.`;
    } else if (action.toLowerCase() === 'decline') {
      subject = `RE: ${tokenData.subject} - DECLINED`;
      body = `I decline the deal.`;
    } else {
      return res.status(400).send('Invalid action specified.');
    }
    
    // Format the created_at date for the quote
    const createdDate = new Date(tokenData.created_at);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayOfWeek = days[createdDate.getDay()];
    const month = months[createdDate.getMonth()];
    const day = String(createdDate.getDate()).padStart(2, '0');
    const year = createdDate.getFullYear();
    
    let hours = createdDate.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = String(createdDate.getMinutes()).padStart(2, '0');
    const timestamp = `${hours}:${minutes} ${ampm}`;
    
    // Create the quote with the formatted date
    const quote = `\n- - - - - - -\nOn ${dayOfWeek}, ${month} ${day}, ${year} at ${timestamp} Natural Gaz (naturalgazdc@gmail.com) wrote:\n    "${tokenData.content.replace(/\n/g, '\n    ')}"`;
    
    // Add the quote to the response body
    body += quote;
    
    // Create mailto link with prefilled subject and body
    const mailtoUrl = `mailto:${tokenData.sender_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Redirect to mailto link
    return res.redirect(mailtoUrl);
  } catch (error) {
    console.error('Error processing response:', error);
    
    return res.status(500).send('An error occurred while processing your response.');
  }
});

module.exports = router; 
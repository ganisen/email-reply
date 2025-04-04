# Email Reply Generator

This project provides a server-side solution to generate pre-filled email replies with proper threading, triggered by button clicks in an email.

## Overview

The Email Reply Generator enables directors to send emails with embedded buttons (e.g., "Accept" or "Decline"). When clicked, these buttons generate a pre-filled reply in the recipient’s email client, ensuring correct threading and inclusion of the original email content.

## Features

- **Dynamic Subject**: Sets the reply subject to "RE: [original subject]".
- **Quoted Content**: Includes the original email in the reply for context.
- **Cross-Client Support**: Compatible with email clients supporting `mailto` links.
- **Secure Tokens**: Uses unique tokens to link clicks to email metadata.

## Architecture

- **Client-Side**: Email with buttons linking to the server.
- **Server-Side**: Node.js with Express.js for request handling and `mailto` generation.
- **Database**: PostgreSQL for storing email metadata with unique tokens.

## Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (local instance)
- A domain/subdomain for hosting (http://91.228.110.8/ or https://n-gaz.com/web/ or https://naturalgaz.md/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/email-reply.git
   cd email-reply-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file with:
   ```env
   POSTGRES_URI=your_postgres_connection_string
   PORT=3000
   ```

4. **Run the server**:
   ```bash
   npm start
   ```

## Usage

1. **Generate Email with Buttons**:
   - When composing an email, generate a token and store its metadata in the database.
   - Add buttons with URLs like `https://yourserver.com/respond?token=abc123&action=accept`.

2. **Handle Button Clicks**:
   - The server processes the request and generates a `mailto` link.
   - The partner’s email client opens with a pre-filled reply.

3. **Partner Sends Reply**:
   - The partner reviews and sends the email manually.
   - The reply threads correctly in the director’s inbox.

## API Endpoints

- **POST /store-metadata**:
  - Stores email metadata and returns a token.
  - Request: `{ "subject": "string", "content": "string", "recipient": "string" }`
  - Response: `{ "token": "string" }`

- **GET /respond**:
  - Processes button clicks and redirects to a `mailto` link.
  - Query Params: `token` (string), `action` (string: "accept" or "decline")

## Security Considerations

- **Token Expiration**: Set tokens to expire (e.g., after 7 days).
- **HTTPS**: Use HTTPS to secure token transmission.
- **Access Control**: Restrict endpoint access if needed.

## Testing

- Test with email clients (Gmail, Outlook, etc.).
- Verify threading and content inclusion in replies.
- Confirm token validation and expiration work as expected.

## License

Licensed under the MIT License.
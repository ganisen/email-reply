# Architecture Layout

The architecture for this solution is designed to streamline email replies with proper threading and dynamic content. It consists of three main components:

- **Client-Side (Email)**:
  - The director sends an email containing buttons (e.g., "Accept" or "Decline").
  - Each button links to a unique URL on the server, embedding a token and action (e.g., `https://yourserver.com/respond?token=abc123&action=accept`).

- **Server-Side**:
  - A web server receives requests when a button is clicked.
  - It processes the token and action, retrieves email metadata, and generates a `mailto` link with a pre-filled subject (`RE: [original subject]`) and body (e.g., `Yes, I accept.` or `No, I decline.`, plus the quoted original content).
  - The server redirects the partner to this `mailto` link, opening their email client.

- **Database**:
  - Stores email metadata (e.g., original subject, content, recipient) linked to unique tokens.
  - Ensures the server can retrieve the correct details for each reply.

**Flow**:
1. Director sends an email with buttons.
2. Partner clicks a button, triggering a server request.
3. Server retrieves metadata using the token and generates a `mailto` link.
4. Partner’s email client opens with a pre-filled reply.
5. Partner sends the email, which threads correctly in the director’s inbox.
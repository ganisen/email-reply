# Software Stack

The project uses a modern, lightweight stack for simplicity and efficiency:

- **Server**: Node.js with Express.js
  - Node.js is fast and scalable; Express.js simplifies routing and request handling.
- **Database**: PostgreSQL
  - Flexible for storing unstructured email metadata.
- **Authentication**: Basic token generation (e.g., UUID)
  - Ensures secure linking of button clicks to email data.
- **Hosting**: http://91.228.110.8/ or https://n-gaz.com/web/ or https://naturalgaz.md/
  - Easy deployment and scalability.
- **Email Sending**: None required
  - Relies on the partner’s email client via `mailto` links.
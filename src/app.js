import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import pkg from 'express-openid-connect'; // Import as pkg to handle CommonJS
const { auth } = pkg; // Destructure functions
import { createTicket, getTicketDetails } from './controllers/ticketController.js'; // Import your controller functions
import { query } from './config/db.js'; // Import the database query function

dotenv.config();

const app = express();

// Auth0 configuration for login redirection
const config = {
  authRequired: false, // Allow unauthenticated users
  auth0Logout: true,
  baseURL: process.env.BASE_URL, // Your app's base URL
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  secret: process.env.AUTH0_CLIENT_SECRET,
};

// Initialize Auth0 authentication middleware
app.use(auth(config));

// Middleware
app.use(express.json());
app.use(helmet());

// Public route to create tickets (no authentication required)
app.post('/api/tickets', createTicket);

// Protected route for viewing ticket details
app.get('/tickets/:id', (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    // If the user is not authenticated, redirect to login and remember the original URL
    const returnTo = `/tickets/${req.params.id}`;
    return res.oidc.login({ returnTo });
  }
  
  // If the user is authenticated, show the ticket details
  getTicketDetails(req, res);
});

// Home route (public) to show the aggregate of tickets bought
app.get('/', async (req, res) => {
  try {
    // Query the database to get the total number of tickets
    const result = await query('SELECT COUNT(*) FROM tickets');
    const ticketCount = parseInt(result.rows[0].count, 10);

    // Render the response with the aggregate ticket count
    res.send(`
      <html>
        <head><title>Home</title></head>
        <body>
          <h1>Welcome to the QR Ticket Generator!</h1>
          <p>Total Tickets Bought: ${ticketCount}</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('<h1>Error fetching ticket count</h1>');
  }
});

// Login route
app.get('/login', (req, res) => {
  const returnTo = req.query.returnTo || '/'; // Redirect to specified URL or home by default
  res.oidc.login({ returnTo });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

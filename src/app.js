import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import pkg from 'express-openid-connect';
const { auth } = pkg;
import { createTicket, getTicketDetails } from './controllers/ticketController.js';
import { query } from './config/db.js';

dotenv.config();

const app = express();

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL, 
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  secret: process.env.AUTH0_CLIENT_SECRET,
};

app.use(auth(config));

app.use(express.json());
app.use(helmet());

app.post('/api/tickets', createTicket);

app.get('/tickets/:id', (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    const returnTo = `/tickets/${req.params.id}`;
    return res.oidc.login({ returnTo });
  }
  
  getTicketDetails(req, res);
});

app.get('/', async (req, res) => {
  try {
    const result = await query('SELECT COUNT(*) FROM tickets');
    const ticketCount = parseInt(result.rows[0].count, 10);

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

app.get('/login', (req, res) => {
  const returnTo = req.query.returnTo || '/';
  res.oidc.login({ returnTo });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

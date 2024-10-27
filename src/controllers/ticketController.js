import { query } from '../config/db.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new ticket (POST request)
export const createTicket = async (req, res) => {
  const { vatin, firstName, lastName } = req.body;

  // Check required fields
  if (!vatin || !firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if the VATIN already has 3 tickets
    const result = await query('SELECT COUNT(*) FROM tickets WHERE vatin = $1', [vatin]);
    if (parseInt(result.rows[0].count) >= 3) {
      return res.status(400).json({ message: 'Maximum 3 tickets per VATIN allowed' });
    }

    // Generate UUID and timestamp for the ticket
    const ticketId = uuidv4();
    const timestamp = new Date();

    // Insert the ticket into the database
    await query(
      'INSERT INTO tickets (id, vatin, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, $5)',
      [ticketId, vatin, firstName, lastName, timestamp]
    );

    // Generate the QR code URL that links to the protected ticket details page
    const qrCodeImage = await generateQRCode(`http://localhost:5000/tickets/${ticketId}`);

    // Set the response content type to an image (PNG)
    res.setHeader('Content-Type', 'image/png');
    
    // Send the QR code image as the response
    res.send(qrCodeImage);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating ticket' });
  }
};

export const getTicketDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the ticket details from the database
    const result = await query('SELECT * FROM tickets WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).send('<h1>Ticket not found</h1>');
    }

    const ticket = result.rows[0];

    // Get the authenticated user's email
    const userEmail = req.oidc.user ? req.oidc.user.email : 'Unknown';

    // Generate the HTML to display ticket details
    const html = `
      <html>
        <head><title>Ticket Details</title></head>
        <body>
          <h1>Ticket Details</h1>
          <p><strong>ID:</strong> ${ticket.id}</p>
          <p><strong>First Name:</strong> ${ticket.first_name}</p>
          <p><strong>Last Name:</strong> ${ticket.last_name}</p>
          <p><strong>VATIN:</strong> ${ticket.vatin}</p>
          <p><strong>Created At:</strong> ${ticket.created_at}</p>
          <p><strong>User Email:</strong> ${userEmail}</p>
        </body>
      </html>
    `;

    // Send the HTML response
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('<h1>Error fetching ticket details</h1>');
  }
};
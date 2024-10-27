import express from 'express';
import ticketController from '../controllers/ticketController.js';

const router = express.Router();

// Route to create a new ticket (protected)
router.post('/tickets', ticketController.createTicket);

// Route to get ticket details by ID (protected)
router.get('/tickets/:id', ticketController.getTicketDetails);

export default router;

// routes/eventRoutes.js
const express = require('express');
const {
  getEvents,
  getEventBySlug,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
} = require('../controllers/eventController');

const router = express.Router();

// Public routes
router.get('/', getEvents); // GET /api/events?page=1&limit=10&category=Workshop&search=react
router.get('/stats', getEventStats); // GET /api/events/stats
router.get('/slug/:slug', getEventBySlug); // GET /api/events/slug/react-workshop-2024
router.get('/id/:id', getEventById); // GET /api/events/id/507f1f77bcf86cd799439011

// Protected routes (you may want to add authentication middleware)
router.post('/', createEvent); // POST /api/events
router.put('/:id', updateEvent); // PUT /api/events/507f1f77bcf86cd799439011
router.delete('/:id', deleteEvent); // DELETE /api/events/507f1f77bcf86cd799439011

module.exports = router;






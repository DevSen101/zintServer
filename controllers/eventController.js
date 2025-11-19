// controllers/eventController.js
const Event = require('../models/Events');

/**
 * Get all events with pagination, filtering, and search
 * Query params: page, limit, category, status, city, search, sort
 */
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      city,
      search,
      sort = '-startDate', // Default sort by newest first
    } = req.query;

    // Build query
    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by city
    if (city) {
      query['venue.city'] = { $regex: city, $options: 'i' };
    }

    // Search in title, description, and tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: events,
    });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch events',
      error: err.message 
    });
  }
};

/**
 * Get event by slug
 */
const getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error('Get event by slug error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch event',
      error: err.message 
    });
  }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error('Get event by ID error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch event',
      error: err.message 
    });
  }
};

/**
 * Create new event
 */
const createEvent = async (req, res) => {
  try {
    console.log('Creating event with data:', req.body);

    const eventData = {
      title: req.body.title,
      description: req.body.description,
      eventType: req.body.eventType || 'Workshop',
      category: req.body.category,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      locationType: req.body.locationType || 'venue',
      venue: req.body.venue,
      onlineLink: req.body.onlineLink,
      price: req.body.price || 0,
      originalPrice: req.body.originalPrice,
      capacity: req.body.capacity,
      ticketsSold: req.body.ticketsSold || 0,
      instructor: req.body.instructor,
      thumbnailImage: req.body.thumbnailImage,
      imageUrl: req.body.imageUrl,
      tags: Array.isArray(req.body.tags) 
        ? req.body.tags 
        : req.body.tags?.split(',').map(t => t.trim()) || [],
      slug: req.body.slug,
      status: req.body.status || 'draft',
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: savedEvent,
    });
  } catch (err) {
    console.error('Create event error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors 
      });
    }

    // Handle duplicate slug error
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'An event with this slug already exists' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to create event',
      error: err.message 
    });
  }
};

/**
 * Update event
 */
const updateEvent = async (req, res) => {
  try {
    console.log('Updating event:', req.params.id);
    console.log('Update data:', req.body);

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Update fields
    const allowedUpdates = [
      'title', 'description', 'eventType', 'category',
      'startDate', 'endDate', 'startTime', 'endTime',
      'locationType', 'venue', 'onlineLink',
      'price', 'originalPrice', 'capacity', 'ticketsSold',
      'instructor', 'thumbnailImage', 'imageUrl',
      'tags', 'slug', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    const updatedEvent = await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (err) {
    console.error('Update event error:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors 
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'An event with this slug already exists' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to update event',
      error: err.message 
    });
  }
};

/**
 * Delete event
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
      data: event,
    });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete event',
      error: err.message 
    });
  }
};

/**
 * Get events statistics (optional utility endpoint)
 */
const getEventStats = async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalSold: { $sum: '$ticketsSold' },
        }
      }
    ]);

    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      startDate: { $gte: new Date() },
      status: 'published'
    });

    res.json({
      success: true,
      data: {
        total: totalEvents,
        upcoming: upcomingEvents,
        byStatus: stats,
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics',
      error: err.message 
    });
  }
};

module.exports = {
  getEvents,
  getEventBySlug,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
};
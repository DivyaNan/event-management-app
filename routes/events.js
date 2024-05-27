const express = require('express');
const auth = require('../middleware/auth');
const events = require('../models/event');
const users = require('../models/user');

const router = express.Router();

// Get all events
router.get('/', auth, (req, res) => {
    res.json(events);
});

// Create a new event (organizers only)
router.post('/', auth, (req, res) => {
    if (req.user.role !== 'organizer') {
        return res.status(403).json({ msg: 'Authorization denied' });
    }

    const { date, time, description } = req.body;
    const event = {
        id: events.length + 1,
        date,
        time,
        description,
        participants: [],
        organizer: req.user.id,
    };

    events.push(event);
    res.json(event);
});

// Update an event (organizers only)
router.put('/:id', auth, (req, res) => {
    if (req.user.role !== 'organizer') {
        return res.status(403).json({ msg: 'Authorization denied' });
    }

    const event = events.find(event => event.id === parseInt(req.params.id));
    if (!event) {
        return res.status(404).json({ msg: 'Event not found' });
    }

    if (event.organizer !== req.user.id) {
        return res.status(403).json({ msg: 'Authorization denied' });
    }

    const { date, time, description } = req.body;
    event.date = date;
    event.time = time;
    event.description = description;

    res.json(event);
});

// Delete an event (organizers only)
router.delete('/:id', auth, (req, res) => {
    if (req.user.role !== 'organizer') {
        return res.status(403).json({ msg: 'Authorization denied' });
    }

    const eventIndex = events.findIndex(event => event.id === parseInt(req.params.id));
    if (eventIndex === -1) {
        return res.status(404).json({ msg: 'Event not found' });
    }

    if (events[eventIndex].organizer !== req.user.id) {
        return res.status(403).json({ msg: 'Authorization denied' });
    }

    events.splice(eventIndex, 1);
    res.json({ msg: 'Event removed' });
});

// Register for an event
router.post('/:id/register', auth, (req, res) => {
    const event = events.find(event => event.id === parseInt(req.params.id));
    if (!event) {
        return res.status(404).json({ msg: 'Event not found' });
    }

    if (req.user.role !== 'attendee') {
        return res.status(403).json({ msg: 'Authorization denied' });
    }

    if (event.participants.includes(req.user.id)) {
        return res.status(400).json({ msg: 'Already registered' });
    }

    event.participants.push(req.user.id);
    res.json({ msg: 'Registered successfully' });
});

module.exports = router;

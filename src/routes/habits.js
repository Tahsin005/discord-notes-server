const express = require('express');
const router = express.Router();
const { getProjection } = require('../projections/state');
const { getChannel } = require('../discord/client');

// GET /habits
router.get('/', async (req, res) => {
    try {
        const state = await getProjection();
        res.json(Object.values(state.habits));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// POST /habits (Create)
router.post('/', async (req, res) => {
    const { name, frequency, target, unit, id } = req.body;
    const habitId = id || name.toLowerCase().replace(/\s+/g, '_');

    const event = {
        type: 'HABIT_CREATED',
        id: habitId,
        name,
        frequency: frequency || 'daily',
        target: target || 1,
        unit: unit || 'times',
        active: true,
        created_at: new Date().toISOString()
    };

    try {
        const channel = await getChannel(process.env.HABITS);
        await channel.send(JSON.stringify(event, null, 2));
        res.status(201).json({ message: 'Habit created', habitId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

// POST /habits/:id/log
router.post('/:id/log', async (req, res) => {
    const { id } = req.params;
    const { value, date } = req.body;

    const event = {
        type: 'HABIT_LOGGED',
        habit_id: id,
        date: date || new Date().toISOString().split('T')[0],
        value: value || 1
    };

    try {
        const channel = await getChannel(process.env.HABIT_EVENTS);
        await channel.send(JSON.stringify(event, null, 2));
        res.status(200).json({ message: 'Habit logged' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log habit' });
    }
});

// POST /habits/:id/skip
router.post('/:id/skip', async (req, res) => {
    const { id } = req.params;
    const { date } = req.body;

    const event = {
        type: 'HABIT_SKIPPED',
        habit_id: id,
        date: date || new Date().toISOString().split('T')[0]
    };

    try {
        const channel = await getChannel(process.env.HABIT_EVENTS);
        await channel.send(JSON.stringify(event, null, 2));
        res.status(200).json({ message: 'Habit skipped' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to skip habit' });
    }
});

module.exports = router;

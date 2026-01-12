const express = require('express');
const router = express.Router();
const { getProjection } = require('../projections/state');
const { getChannel } = require('../discord/client');

// GET /daily/:date
router.get('/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const state = await getProjection();
        res.json(state.dailyLogs[date] || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch daily log' });
    }
});

// POST /daily
router.post('/', async (req, res) => {
    const { date, mood, energy, note } = req.body;

    const event = {
        type: 'DAILY_LOG',
        date: date || new Date().toISOString().split('T')[0],
        mood,
        energy,
        note,
        timestamp: new Date().toISOString()
    };

    try {
        const channel = await getChannel(process.env.DAILY_LOGS);
        await channel.send(JSON.stringify(event, null, 2));
        res.status(200).json({ message: 'Daily log saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save daily log' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getProjection } = require('../projections/state');
const { getChannel } = require('../discord/client');

// GET /tasks
router.get('/', async (req, res) => {
    try {
        const state = await getProjection();
        res.json(Object.values(state.tasks));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST /tasks (Create)
router.post('/', async (req, res) => {
    const { title, tags, expires_at, id } = req.body;
    const taskId = id || `task_${Date.now()}`;

    const event = {
        type: 'TASK_CREATED',
        id: taskId,
        title,
        tags: tags || [],
        created_at: new Date().toISOString(),
        expires_at: expires_at || null
    };

    try {
        const channel = await getChannel(process.env.TASKS);
        await channel.send(JSON.stringify(event, null, 2));
        res.status(201).json({ message: 'Task created', taskId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// POST /tasks/:id/done
router.post('/:id/done', async (req, res) => {
    const { id } = req.params;

    const event = {
        type: 'TASK_DONE',
        task_id: id,
        timestamp: new Date().toISOString()
    };

    try {
        const channel = await getChannel(process.env.TASK_EVENTS);
        await channel.send(JSON.stringify(event, null, 2));
        res.status(200).json({ message: 'Task marked as done' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to complete task' });
    }
});

// POST /tasks/:id/reschedule
router.post('/:id/reschedule', async (req, res) => {
    const { id } = req.params;
    const { to } = req.body;

    const event = {
        type: 'TASK_RESCHEDULED',
        task_id: id,
        to: to
    };

    try {
        const channel = await getChannel(process.env.TASK_EVENTS);
        await channel.send(JSON.stringify(event, null, 2));
        res.status(200).json({ message: 'Task rescheduled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reschedule task' });
    }
});

module.exports = router;

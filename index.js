const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { login } = require('./src/discord/client');

// Routes
const habitRoutes = require('./src/routes/habits');
const taskRoutes = require('./src/routes/tasks');
const dailyRoutes = require('./src/routes/daily');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Main State Endpoint (for debugging or heavy builds)
const { getProjection } = require('./src/projections/state');
app.get('/state', async (req, res) => {
    try {
        const state = await getProjection();
        res.json(state);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to rebuild state' });
    }
});

// Register Routes
app.use('/habits', habitRoutes);
app.use('/tasks', taskRoutes);
app.use('/daily', dailyRoutes);

// System Log / Error Handling (middleware-ish)
app.use((err, req, res, next) => {
    console.error(err.stack);
    // TODO: Send to #system-log
    res.status(500).send('Something broke!');
});

const PORT = 3001;

login().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to login to Discord:', err);
    process.exit(1);
});
const { fetchAllMessages, parseMessage } = require('../discord/fetchMessages');
const { reduceHabits } = require('../events/habitReducer');
const { reduceTasks } = require('../events/taskReducer');
const { reduceDailyLogs } = require('../events/dailyReducer');

const getProjection = async () => {
    console.log('[Projection] Rebuilding state...');

    // Fetch all events from all channels
    const [
        habitDefs,
        habitEvents,
        taskDefs,
        taskEvents,
        dailyLogs
    ] = await Promise.all([
        fetchAllMessages(process.env.HABITS).then(msgs => msgs.map(parseMessage).filter(Boolean)),
        fetchAllMessages(process.env.HABIT_EVENTS).then(msgs => msgs.map(parseMessage).filter(Boolean)),
        fetchAllMessages(process.env.TASKS).then(msgs => msgs.map(parseMessage).filter(Boolean)),
        fetchAllMessages(process.env.TASK_EVENTS).then(msgs => msgs.map(parseMessage).filter(Boolean)),
        fetchAllMessages(process.env.DAILY_LOGS).then(msgs => msgs.map(parseMessage).filter(Boolean)),
    ]);

    const state = {
        habits: reduceHabits(habitDefs, habitEvents),
        tasks: reduceTasks(taskDefs, taskEvents),
        dailyLogs: reduceDailyLogs(dailyLogs),
        lastUpdated: new Date().toISOString()
    };

    console.log('[Projection] State rebuilt successfully.');
    return state;
};

module.exports = { getProjection };

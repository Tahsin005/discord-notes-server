/**
 * Reducer for Daily Logs.
 * @param {Array} events List of daily log events
 * @returns {Object} Daily logs indexed by date
 */
const reduceDailyLogs = (events) => {
    const logs = {};

    events.forEach(event => {
        if (event.type === 'DAILY_LOG') {
            // Since it's append only, the latest log for a date should probably win, 
            // or we could merge them. Let's take the latest.
            logs[event.date] = {
                ...event,
                timestamp: event.timestamp // might be useful if we want to know when it was posted
            };
        }
    });

    return logs;
};

module.exports = { reduceDailyLogs };

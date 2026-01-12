/**
 * Reducer for Task events.
 * @param {Array} definitions List of task definitions
 * @param {Array} events List of task events
 * @returns {Object} Current tasks state
 */
const reduceTasks = (definitions, events) => {
    const tasks = {};

    // Initial state from definitions
    definitions.forEach(def => {
        if (def.type === 'TASK_CREATED') {
            tasks[def.id] = {
                ...def,
                status: 'pending',
                completed_at: null,
                history: []
            };
        }
    });

    // Apply events
    events.forEach(event => {
        const task = tasks[event.task_id];
        if (!task) return;

        task.history.push(event);

        switch (event.type) {
            case 'TASK_DONE':
                task.status = 'done';
                task.completed_at = event.timestamp || new Date().toISOString();
                break;
            case 'TASK_RESCHEDULED':
                task.expires_at = event.to;
                break;
            // Add other task event types as needed
        }
    });

    return tasks;
};

module.exports = { reduceTasks };

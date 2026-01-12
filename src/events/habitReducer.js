/**
 * Reducer for Habit events.
 * @param {Array} events List of habit events
 * @param {Array} definitions List of habit definitions
 * @returns {Object} Habit state including current streaks and completions
 */
const reduceHabits = (definitions, events) => {
    const habits = {};

    // Initial state from definitions
    definitions.forEach(def => {
        if (def.type === 'HABIT_CREATED') {
            habits[def.id] = {
                ...def,
                logs: [],
                streak: 0,
                lastLogged: null,
                completedToday: false
            };
        }
    });

    // Apply events
    events.forEach(event => {
        const habit = habits[event.habit_id];
        if (!habit) return;

        switch (event.type) {
            case 'HABIT_LOGGED':
                habit.logs.push({ date: event.date, value: event.value });
                break;
            case 'HABIT_SKIPPED':
                habit.logs.push({ date: event.date, skipped: true });
                break;
            case 'HABIT_DISABLED':
                habit.active = false;
                break;
            case 'HABIT_OVERRIDE':
                // Custom logic for overrides if needed
                break;
        }
    });

    // Calculate streaks and today status
    const today = new Date().toISOString().split('T')[0];

    Object.values(habits).forEach(habit => {
        habit.logs.sort((a, b) => new Date(b.date) - new Date(a.date));

        habit.completedToday = habit.logs.some(log => log.date === today && !log.skipped);

        // Calculate streak (consecutive days)
        let streak = 0;
        let currentDate = new Date(today);

        // If not completed today, check if it was completed yesterday to continue streak
        if (!habit.completedToday) {
            currentDate.setDate(currentDate.getDate() - 1);
        }

        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const logEntry = habit.logs.find(l => l.date === dateStr);

            if (logEntry && !logEntry.skipped) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        habit.streak = streak;
    });

    return habits;
};

module.exports = { reduceHabits };

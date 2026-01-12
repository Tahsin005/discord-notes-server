const { getChannel } = require('./client');

/**
 * Fetches all messages from a channel, handling pagination.
 * @param {string} channelId 
 * @returns {Promise<Array>} Messages sorted by timestamp (oldest first).
 */
const fetchAllMessages = async (channelId) => {
    const channel = await getChannel(channelId);
    let allMessages = [];
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) break;

        allMessages = allMessages.concat(Array.from(messages.values()));
        lastId = messages.last().id;

        if (messages.size < 100) break;
    }

    // Sort by timestamp (asc) to replay events correctly
    return allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
};

/**
 * Parses a message content as JSON.
 * @param {object} message Discord message object
 * @returns {object|null} Parsed JSON or null if invalid
 */
const parseMessage = (message) => {
    try {
        return JSON.parse(message.content);
    } catch (e) {
        // Silently ignore non-JSON messages unless it's critical
        return null;
    }
};

module.exports = {
    fetchAllMessages,
    parseMessage
};

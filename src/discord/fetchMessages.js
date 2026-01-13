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
 * Parses a message content and extracts attachments.
 * @param {object} message Discord message object
 * @returns {object|null} Parsed content with attachments or null if invalid
 */
const parseMessage = (message) => {
    const result = {
        content: null,
        attachments: [],
        timestamp: message.createdTimestamp,
        messageId: message.id
    };

    // Try to parse content as JSON, fallback to plain text
    try {
        result.content = JSON.parse(message.content);
    } catch (e) {
        // If not JSON, keep as plain text (useful for blog posts)
        result.content = message.content || null;
    }

    // Extract attachments (images, files, etc.)
    if (message.attachments && message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            result.attachments.push({
                url: attachment.url,
                proxyURL: attachment.proxyURL,
                name: attachment.name,
                size: attachment.size,
                contentType: attachment.contentType,
                width: attachment.width,
                height: attachment.height
            });
        });
    }

    // Return null if no content and no attachments
    if (!result.content && result.attachments.length === 0) {
        return null;
    }

    return result;
};

module.exports = {
    fetchAllMessages,
    parseMessage
};

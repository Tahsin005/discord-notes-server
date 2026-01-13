const { fetchAllMessages, parseMessage } = require('../discord/fetchMessages');
const { reduceBlogPosts } = require('../events/blogReducer');

const getProjection = async () => {
    console.log('[Projection] Rebuilding state...');

    // Fetch blog posts from BLOG channel
    const blogMessages = await fetchAllMessages(process.env.BLOG)
        .then(msgs => msgs.map(parseMessage).filter(Boolean));

    const state = {
        blogPosts: await reduceBlogPosts(blogMessages),
        lastUpdated: new Date().toISOString()
    };

    console.log('[Projection] State rebuilt successfully.');
    return state;
};

module.exports = { getProjection };

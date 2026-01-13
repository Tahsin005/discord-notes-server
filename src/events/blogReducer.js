const fetch = require('node-fetch');

/**
 * Reducer for Blog posts.
 * Fetches text file attachments to read blog content.
 * @param {Array} messages List of blog post messages from Discord
 * @returns {Promise<Object>} Blog posts indexed by slug
 */
const reduceBlogPosts = async (messages) => {
    const posts = {};

    for (const msg of messages) {
        if (!msg) continue;

        // Handle both plain text and JSON content
        let content = msg.content || ''; // Default to empty string if null
        let metadata = {};

        // If content is an object (JSON), extract metadata
        if (typeof content === 'object' && content !== null) {
            metadata = content;
            content = metadata.content || metadata.body || '';
        }

        // Check for text file attachments (.txt, .md, .markdown)
        const textAttachment = (msg.attachments || []).find(att => {
            const contentType = att.contentType || '';
            const name = (att.name || '').toLowerCase();
            return contentType.startsWith('text/') ||
                name.endsWith('.txt') ||
                name.endsWith('.md') ||
                name.endsWith('.markdown');
        });

        // If there's a text file attachment, fetch and read it
        if (textAttachment) {
            try {
                const response = await fetch(textAttachment.url);
                const fileContent = await response.text();

                // Use file content as the main content
                content = fileContent;

                console.log(`[Blog] Loaded content from attachment: ${textAttachment.name} (${fileContent.length} chars)`);
            } catch (error) {
                console.error(`[Blog] Failed to fetch attachment ${textAttachment.name}:`, error);
                // Fall back to message content if fetch fails
            }
        }

        // Skip if still no content and no images
        const imageAttachments = (msg.attachments || []).filter(a => a.contentType?.startsWith('image/'));
        if (!content && imageAttachments.length === 0) {
            continue;
        }

        // Parse title and body from content
        const lines = content.split('\n');
        const title = metadata.title || lines[0] || 'Untitled Post';
        const body = metadata.body || lines.slice(1).join('\n').trim();

        // Generate slug from title
        const slug = metadata.slug || generateSlug(title, msg.messageId);

        // Extract images from attachments
        const images = (msg.attachments || []).filter(att =>
            att.contentType && att.contentType.startsWith('image/')
        );

        // Create post object
        posts[slug] = {
            slug,
            title: title.trim(),
            body,
            excerpt: metadata.excerpt || generateExcerpt(body),
            images,
            tags: metadata.tags || [],
            published: metadata.published !== false, // Default to published
            createdAt: new Date(msg.timestamp).toISOString(),
            messageId: msg.messageId,
            readingTime: calculateReadingTime(body)
        };
    }

    return posts;
};

/**
 * Generate URL-friendly slug from title
 * @param {string} title Post title
 * @param {string} messageId Fallback ID
 * @returns {string} URL slug
 */
const generateSlug = (title, messageId) => {
    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .substring(0, 100);        // Limit length

    return slug || `post-${messageId}`;
};

/**
 * Generate excerpt from body text
 * @param {string} body Post body
 * @returns {string} Excerpt
 */
const generateExcerpt = (body) => {
    if (!body) return '';

    const plainText = body
        .replace(/[#*`_~]/g, '') // Remove markdown syntax
        .trim();

    return plainText.length > 160
        ? plainText.substring(0, 160) + '...'
        : plainText;
};

/**
 * Calculate estimated reading time
 * @param {string} text Post content
 * @returns {number} Minutes to read
 */
const calculateReadingTime = (text) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

module.exports = { reduceBlogPosts };

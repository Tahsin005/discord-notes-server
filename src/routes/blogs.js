const express = require('express');
const router = express.Router();
const { getProjection } = require('../projections/state');

// GET /posts - List all published blog posts
router.get('/', async (req, res) => {
    try {
        const state = await getProjection();
        const posts = Object.values(state.blogPosts || {});

        // Filter published posts only
        const publishedPosts = posts.filter(post => post.published);

        // Sort by date (newest first)
        publishedPosts.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json(publishedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

// GET /posts/:slug - Get individual blog post by slug
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const state = await getProjection();
        const post = state.blogPosts?.[slug];

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (!post.published) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

module.exports = router;

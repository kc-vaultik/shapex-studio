/**
 * ShapeX Frontend - Express Server
 */
const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: '../config/.env' });

const app = express();
const PORT = process.env.FRONTEND_PORT || 3001;
const API_URL = `http://localhost:${process.env.BACKEND_PORT || 8000}/api`;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== ROUTES =====

// Dashboard home
app.get('/', async (req, res) => {
    try {
        // Fetch stats from API
        const [statsRes, trendsRes, strategicRes, quickWinRes] = await Promise.all([
            axios.get(`${API_URL}/stats`).catch(() => ({ data: null })),
            axios.get(`${API_URL}/trends?limit=10`).catch(() => ({ data: { trends: [] } })),
            axios.get(`${API_URL}/opportunities/strategic?limit=5`).catch(() => ({ data: { opportunities: [] } })),
            axios.get(`${API_URL}/opportunities/quick-wins?limit=5`).catch(() => ({ data: { opportunities: [] } }))
        ]);

        res.render('dashboard', {
            stats: statsRes.data,
            trends: trendsRes.data.trends,
            strategicOpportunities: strategicRes.data.opportunities,
            quickWinOpportunities: quickWinRes.data.opportunities
        });
    } catch (error) {
        console.error('Error loading dashboard:', error.message);
        res.render('error', { error: 'Failed to load dashboard data' });
    }
});

// Ideas page
app.get('/ideas', async (req, res) => {
    try {
        const channel = req.query.channel || '';
        const category = req.query.category || '';
        const minScore = req.query.min_score || '';

        const response = await axios.get(`${API_URL}/ideas`, {
            params: { channel, category, min_score: minScore, limit: 100 }
        });

        res.render('ideas', {
            ideas: response.data.ideas,
            filters: { channel, category, minScore }
        });
    } catch (error) {
        console.error('Error loading ideas:', error.message);
        res.render('error', { error: 'Failed to load ideas' });
    }
});

// Idea details page
app.get('/ideas/:id', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/ideas/${req.params.id}`);
        res.render('idea-detail', { idea: response.data });
    } catch (error) {
        console.error('Error loading idea:', error.message);
        res.render('error', { error: 'Idea not found' });
    }
});

// Trends page
app.get('/trends', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/trends?limit=50`);
        res.render('trends', { trends: response.data.trends });
    } catch (error) {
        console.error('Error loading trends:', error.message);
        res.render('error', { error: 'Failed to load trends' });
    }
});

// Scan page
app.get('/scan', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/scan/status`);
        res.render('scan', { scans: response.data.recent_scans });
    } catch (error) {
        console.error('Error loading scan status:', error.message);
        res.render('error', { error: 'Failed to load scan status' });
    }
});

// ===== API PROXY ROUTES =====

// Trigger scan
app.post('/api/scan', async (req, res) => {
    try {
        const response = await axios.post(`${API_URL}/scan/now`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger scan' });
    }
});

// Update idea
app.patch('/api/ideas/:id', async (req, res) => {
    try {
        const response = await axios.patch(`${API_URL}/ideas/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update idea' });
    }
});

// Get ideas (AJAX)
app.get('/api/ideas', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/ideas`, { params: req.query });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});

// Get stats (AJAX)
app.get('/api/stats', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ===== START SERVER =====

app.listen(PORT, () => {
    console.log(`\n✓ ShapeX Dashboard running at http://localhost:${PORT}`);
    console.log(`✓ API backend: ${API_URL}`);
    console.log('\n📊 Open http://localhost:${PORT} in your browser\n');
});

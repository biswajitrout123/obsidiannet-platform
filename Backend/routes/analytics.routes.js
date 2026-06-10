import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📈 Endpoint: /api/analytics/engagement
router.get('/engagement', protectRoute, (req, res) => {
    try {
        // Simulated real-time engagement data for the chart
        const realTimeData = [
            { day: 'Mon', profileViews: 120, connections: 14 },
            { day: 'Tue', profileViews: 150, connections: 22 },
            { day: 'Wed', profileViews: 180, connections: 18 },
            { day: 'Thu', profileViews: 220, connections: 35 },
            { day: 'Fri', profileViews: 280, connections: 45 },
            { day: 'Sat', profileViews: 350, connections: 60 },
            { day: 'Sun', profileViews: 410, connections: 85 }
        ];
        
        res.status(200).json(realTimeData);
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Server error fetching chart data" });
    }
});

export default router;
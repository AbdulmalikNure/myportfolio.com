const { query } = require('../config/database');

/**
 * POST /api/analytics/track  (public)
 */
const trackEvent = async (req, res) => {
  try {
    const { event_type, page, project_id } = req.body;
    const validTypes = ['page_view', 'contact_submit', 'project_view', 'cv_download'];
    if (!validTypes.includes(event_type)) {
      return res.status(400).json({ success: false, message: 'Invalid event type' });
    }
    await query(
      'INSERT INTO analytics (event_type, page, project_id, ip_address, user_agent, referrer) VALUES ($1,$2,$3,$4,$5,$6)',
      [event_type, page || null, project_id || null, req.ip,
       req.headers['user-agent'] || null, req.headers.referer || null]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/analytics  (protected)
 */
const getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const [total, daily, byType, topProjects] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM analytics WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'`),
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM analytics
        WHERE event_type = 'page_view' AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
      query(`
        SELECT event_type, COUNT(*) as count
        FROM analytics
        WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days'
        GROUP BY event_type
      `),
      query(`
        SELECT p.id, p.name, COUNT(a.id) as views
        FROM analytics a
        JOIN projects p ON a.project_id = p.id
        WHERE a.event_type = 'project_view' AND a.created_at >= NOW() - INTERVAL '${parseInt(days)} days'
        GROUP BY p.id, p.name
        ORDER BY views DESC
        LIMIT 5
      `),
    ]);

    return res.json({
      success: true,
      data: {
        totalVisitors: parseInt(total.rows[0].total),
        dailyVisitors: daily.rows,
        eventBreakdown: byType.rows,
        topProjects: topProjects.rows,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { trackEvent, getAnalytics };

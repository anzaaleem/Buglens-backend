// routes/stats.js
const express = require('express');
const router = express.Router();
const ErrorLog = require('../models/ErrorLog');

function pickGrain(from, to, override) {
  if (override && ['day','week','month'].includes(String(override))) return override;
  const days = Math.abs((to - from) / 86400000);
  if (days <= 90) return 'day';
  if (days <= 365 * 2) return 'week';
  return 'month';
}

async function countBetween(from, to) {
  if (!from || !to) return 0;
  return ErrorLog.countDocuments({ server_received_at: { $gte: from, $lte: to } });
}

// GET /stats/summary?range=all|custom&from=YYYY-MM-DD&to=YYYY-MM-DD&grain=day|week|month&topN=10
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();

    let from = req.query.from ? new Date(req.query.from) : null;
    let to   = req.query.to   ? new Date(req.query.to)   : null;
    const wantAll = (req.query.range || 'all') === 'all';

    // If ALL or no explicit range → derive min/max
    if (wantAll && (!from || !to)) {
      const mm = await ErrorLog.aggregate([
        { $group: { _id: null, min: { $min: '$server_received_at' }, max: { $max: '$server_received_at' } } }
      ]);
      const rec = mm[0];
      if (!rec || !rec.min || !rec.max) {
        return res.json({
          total: 0,
          range: { from: null, to: null },
          grain: 'day',
          seriesDaily: [],
          byBrowser: [], byMethod: [], byStatus: [], topUrls: [],
          kpi: { last24h: 0, last7d: 0, prev7d: 0, change7dPct: 0 }
        });
      }
      from = rec.min;
      to = rec.max;
    }

    // Fallback default = last 14d
    if (!from || !to) {
      to = now;
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
    }

    const grain = pickGrain(from, to, req.query.grain);
    const topN = Math.max(1, Math.min(50, parseInt(req.query.topN || '10', 10)));

    const match = { server_received_at: { $gte: from, $lte: to } };

    const [agg] = await ErrorLog.aggregate([
      { $match: match },
      {
        $facet: {
          byDay: [
            { $group: { _id: { $dateTrunc: { date: '$server_received_at', unit: grain } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, t: '$_id', count: 1 } }
          ],
          byBrowser: [
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 8 },
            { $project: { _id: 0, key: { $ifNull: ['$_id', 'Unknown'] }, count: 1 } }
          ],
          byMethod: [
            { $group: { _id: '$method', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, key: { $ifNull: ['$_id', '—'] }, count: 1 } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, key: { $ifNull: ['$_id', '—'] }, count: 1 } }
          ],
          topUrls: [
            { $group: { _id: '$url', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: topN },
            { $project: { _id: 0, key: { $ifNull: ['$_id', '—'] }, count: 1 } }
          ]
        }
      }
    ]);

    // KPIs
    const last24hFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7dFrom  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
    const prev7dFrom  = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const [last24h, last7d, prev7d] = await Promise.all([
      countBetween(last24hFrom, now),
      countBetween(last7dFrom, now),
      countBetween(prev7dFrom, last7dFrom)
    ]);
    const change7dPct = prev7d ? ((last7d - prev7d) / prev7d) * 100 : (last7d ? 100 : 0);

    const total = (agg?.byDay || []).reduce((s, r) => s + (r.count || 0), 0);

    res.json({
      total,
      range: { from, to },
      grain,
      seriesDaily: agg?.byDay || [],
      byBrowser: agg?.byBrowser || [],
      byMethod: agg?.byMethod || [],
      byStatus: agg?.byStatus || [],
      topUrls: agg?.topUrls || [],
      kpi: { last24h, last7d, prev7d, change7dPct }
    });
  } catch (err) {
    console.error('stats error:', err);
    res.status(500).json({ ok: false, error: 'Failed to compute stats' });
  }
});

module.exports = router;

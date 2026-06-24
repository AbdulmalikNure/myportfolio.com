import { useEffect, useState } from 'react';
import { analytics } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analytics.get(days).then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="text-muted animate-pulse">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Big stat */}
      <div className="bg-surface border border-border rounded-xl p-6 text-center">
        <p className="text-muted text-sm">Total Page Views</p>
        <p className="text-5xl font-bold text-primary mt-2">{data?.totalVisitors?.toLocaleString() ?? 0}</p>
        <p className="text-muted text-xs mt-1">in the last {days} days</p>
      </div>

      {/* Daily chart */}
      {data?.dailyVisitors?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Daily Visitors</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dailyVisitors}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', color: '#e6edf3' }} />
              <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} name="Visitors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Event breakdown */}
        {data?.eventBreakdown?.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Events Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.eventBreakdown} dataKey="count" nameKey="event_type" cx="50%" cy="50%" outerRadius={70} label>
                  {data.eventBreakdown.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', color: '#e6edf3' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top projects */}
        {data?.topProjects?.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Top Viewed Projects</h2>
            <div className="space-y-3">
              {data.topProjects.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <div className="h-1.5 bg-bg rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, (p.views / data.topProjects[0].views) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-sm text-muted w-12 text-right">{p.views} views</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

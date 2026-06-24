import { useEffect, useState } from 'react';
import { dashboard } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Layers, Code2, MessageSquare, Award, Image, FileText } from 'lucide-react';

interface Stats {
  totalVisitors: number; totalProjects: number; totalSkills: number;
  totalMessages: number; totalCertificates: number; totalGallery: number; totalBlogPosts: number;
}

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <div className="text-2xl font-bold text-text">{value?.toLocaleString() ?? 0}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.get().then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted animate-pulse">Loading dashboard...</div>;

  const stats: Stats = data?.stats || {};

  const statCards = [
    { label: 'Total Visitors',    value: stats.totalVisitors,    icon: Users,         color: 'bg-cyan-600' },
    { label: 'Projects',          value: stats.totalProjects,    icon: Layers,        color: 'bg-blue-600' },
    { label: 'Skills',            value: stats.totalSkills,      icon: Code2,         color: 'bg-purple-600' },
    { label: 'Messages',          value: stats.totalMessages,    icon: MessageSquare, color: 'bg-green-600' },
    { label: 'Certificates',      value: stats.totalCertificates,icon: Award,         color: 'bg-yellow-600' },
    { label: 'Gallery Items',     value: stats.totalGallery,     icon: Image,         color: 'bg-pink-600' },
    { label: 'Blog Posts',        value: stats.totalBlogPosts,   icon: FileText,      color: 'bg-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Visitor chart */}
      {data?.dailyVisitors?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Daily Visitors (Last 30 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dailyVisitors}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', color: '#e6edf3' }} />
              <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent messages */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Recent Messages</h2>
          <div className="space-y-3">
            {data?.recentMessages?.length === 0 && <p className="text-muted text-sm">No messages yet</p>}
            {data?.recentMessages?.map((msg: any) => (
              <div key={msg.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{msg.full_name}</p>
                  <p className="text-muted text-xs">{msg.subject || msg.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${msg.is_read ? 'bg-border text-muted' : 'bg-cyan-900 text-cyan-300'}`}>
                  {msg.is_read ? 'Read' : 'New'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent projects */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {data?.recentProjects?.length === 0 && <p className="text-muted text-sm">No projects yet</p>}
            {data?.recentProjects?.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                {p.thumbnail
                  ? <img src={p.thumbnail} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  : <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center text-muted"><Layers size={16}/></div>
                }
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-muted text-xs">{p.category || 'General'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

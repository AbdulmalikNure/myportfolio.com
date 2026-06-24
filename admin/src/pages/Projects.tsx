import { useEffect, useState } from 'react';
import { projects } from '../lib/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, Star, ExternalLink, Github } from 'lucide-react';

const emptyForm = {
  name: '', category: '', description: '', technologies: '',
  github_url: '', live_url: '', is_featured: false, status: 'completed',
  completion_date: '', display_order: 0,
};

export default function Projects() {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const fetchData = async () => {
    const r = await projects.getAll({ page, limit: 10, search });
    setData(r.data.data);
    setPagination(r.data.pagination);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    const techs = form.technologies.split(',').map((s: string) => s.trim()).filter(Boolean);
    fd.set('technologies', JSON.stringify(techs));
    if (thumbnail) fd.append('thumbnail', thumbnail);
    try {
      if (editing) { await projects.update(editing, fd); toast.success('Project updated'); }
      else { await projects.create(fd); toast.success('Project created'); }
      setForm(emptyForm); setEditing(null); setShowForm(false); setThumbnail(null); fetchData();
    } catch { toast.error('Failed to save project'); }
  };

  const handleEdit = (p: any) => {
    setForm({ ...emptyForm, ...p, technologies: (p.technologies || []).join(', ') });
    setEditing(p.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await projects.delete(id); toast.success('Deleted'); fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">
          <Plus size={14} /> Add Project
        </button>
      </div>

      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search projects..."
        className="bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text focus:outline-none focus:border-primary w-full" />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit' : 'Add'} Project</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Project Name *', 'name'], ['Category', 'category'], ['GitHub URL', 'github_url'], ['Live URL', 'live_url']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">{label}</label>
                <input value={form[key]} onChange={(e) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-muted mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary">
                {['completed', 'in_progress', 'planned'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Completion Date</label>
              <input type="date" value={form.completion_date} onChange={(e) => setForm((p: any) => ({ ...p, completion_date: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Technologies (comma-separated)</label>
              <input value={form.technologies} onChange={(e) => setForm((p: any) => ({ ...p, technologies: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
                placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))}
                rows={3} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary resize-none" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Thumbnail</label>
              <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                className="text-sm text-muted file:bg-border file:text-text file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="featured" checked={form.is_featured}
                onChange={(e) => setForm((p: any) => ({ ...p, is_featured: e.target.checked }))} />
              <label htmlFor="featured" className="text-sm text-muted">Featured Project</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-text">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((p) => (
          <div key={p.id} className="bg-surface border border-border rounded-xl overflow-hidden">
            {p.thumbnail
              ? <img src={p.thumbnail} alt={p.name} className="w-full h-40 object-cover" />
              : <div className="w-full h-40 bg-bg flex items-center justify-center text-muted text-xs">No image</div>
            }
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-sm">{p.name}</h3>
                {p.is_featured && <Star size={14} className="text-yellow-400 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className={`px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-green-900 text-green-300' : p.status === 'in_progress' ? 'bg-yellow-900 text-yellow-300' : 'bg-border'}`}>{p.status}</span>
                {p.category && <span>{p.category}</span>}
              </div>
              <div className="flex gap-2 pt-1">
                {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="text-muted hover:text-primary"><Github size={14} /></a>}
                {p.live_url   && <a href={p.live_url}   target="_blank" rel="noreferrer" className="text-muted hover:text-primary"><ExternalLink size={14} /></a>}
                <div className="ml-auto flex gap-2">
                  <button onClick={() => handleEdit(p)} className="text-muted hover:text-primary"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-muted hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm ${page === i + 1 ? 'bg-primary text-bg' : 'bg-surface border border-border text-muted hover:text-text'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

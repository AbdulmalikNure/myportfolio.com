import { useEffect, useState } from 'react';
import { services } from '../lib/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

const empty = { title: '', description: '', icon: '', gradient: '', display_order: 0 };

export default function Services() {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => { const r = await services.getAll(); setData(r.data.data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await services.update(editing, form); toast.success('Updated'); }
      else { await services.create(form); toast.success('Created'); }
      setForm(empty); setEditing(null); setShowForm(false); fetch();
    } catch { toast.error('Failed to save'); }
  };

  const handleEdit = (s: any) => {
    setForm({ title: s.title, description: s.description, icon: s.icon || '', gradient: s.gradient || '', display_order: s.display_order });
    setEditing(s.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await services.delete(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">
          <Plus size={14} /> Add Service
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit' : 'Add'} Service</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Title *', 'title'], ['Icon (Lucide name)', 'icon'], ['Gradient classes', 'gradient']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">{label}</label>
                <input value={form[key]} onChange={(e) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-muted mb-1">Display Order</label>
              <input type="number" value={form.display_order} onChange={(e) => setForm((p: any) => ({ ...p, display_order: parseInt(e.target.value) }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))}
                rows={3} required className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-text">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((s) => (
          <div key={s.id} className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{s.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="text-muted hover:text-primary"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(s.id)} className="text-muted hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-muted line-clamp-3">{s.description}</p>
            {s.icon && <span className="text-xs text-primary">{s.icon}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

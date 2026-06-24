import { useEffect, useState } from 'react';
import { skills } from '../lib/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

const CATEGORIES = ['core', 'frontend', 'backend', 'tool', 'other'];

const emptyForm = { name: '', category: 'frontend', percentage: 70, icon: '', color_from: '', color_to: '', display_order: 0 };

export default function Skills() {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => { const r = await skills.getAll(); setData(r.data.data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await skills.update(editing, form); toast.success('Skill updated'); }
      else { await skills.create(form); toast.success('Skill created'); }
      setForm(emptyForm); setEditing(null); setShowForm(false); fetch();
    } catch { toast.error('Failed to save skill'); }
  };

  const handleEdit = (s: any) => {
    setForm({ name: s.name, category: s.category, percentage: s.percentage, icon: s.icon || '', color_from: s.color_from || '', color_to: s.color_to || '', display_order: s.display_order });
    setEditing(s.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await skills.delete(id); toast.success('Deleted'); fetch();
  };

  const grouped: Record<string, any[]> = {};
  CATEGORIES.forEach((c) => { grouped[c] = data.filter((s) => s.category === c); });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skills</h1>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">
          <Plus size={14} /> Add Skill
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit' : 'Add'} Skill</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Name', 'name', 'text'], ['Icon (Lucide name)', 'icon', 'text'], ['Color From', 'color_from', 'text'], ['Color To', 'color_to', 'text'], ['Display Order', 'display_order', 'number']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-muted mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((p: any) => ({ ...p, category: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Percentage (0-100)</label>
              <input type="number" min="0" max="100" value={form.percentage} onChange={(e) => setForm((p: any) => ({ ...p, percentage: parseInt(e.target.value) }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-text">Cancel</button>
          </div>
        </form>
      )}

      {CATEGORIES.filter((c) => grouped[c]?.length > 0).map((cat) => (
        <div key={cat} className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-border/20">
            <span className="font-semibold capitalize text-primary">{cat}</span>
          </div>
          {grouped[cat].map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{s.name}</span>
                {s.percentage !== null && (
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-bg rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${s.percentage}%` }} />
                    </div>
                    <span className="text-xs text-muted">{s.percentage}%</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="text-muted hover:text-primary"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(s.id)} className="text-muted hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

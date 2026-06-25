import { useEffect, useState } from 'react';
import { education } from '../lib/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

const empty = { institution: '', degree: '', department: '', start_date: '', end_date: '', description: '', display_order: 0 };

export default function Education() {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => { const r = await education.getAll(); setData(r.data.data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await education.update(editing, form); toast.success('Updated'); }
      else { await education.create(form); toast.success('Created'); }
      setForm(empty); setEditing(null); setShowForm(false); fetch();
    } catch { toast.error('Failed to save'); }
  };

  const handleEdit = (item: any) => {
    setForm({ institution: item.institution, degree: item.degree || '', department: item.department || '',
      start_date: item.start_date?.slice(0, 10) || '', end_date: item.end_date?.slice(0, 10) || '',
      description: item.description || '', display_order: item.display_order });
    setEditing(item.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await education.delete(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Education</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">
          <Plus size={14} /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit' : 'Add'} Education</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Institution *', 'institution'], ['Degree', 'degree'], ['Department', 'department']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">{label}</label>
                <input value={form[key]} onChange={(e) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-muted mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm((p: any) => ({ ...p, start_date: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm((p: any) => ({ ...p, end_date: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))}
                rows={3} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-text">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="bg-surface border border-border rounded-xl p-5 flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{item.institution}</h3>
              <p className="text-sm text-primary">{item.degree} {item.department && `— ${item.department}`}</p>
              <p className="text-xs text-muted mt-1">
                {item.start_date?.slice(0, 4)} — {item.end_date?.slice(0, 4) || 'Present'} E.C
              </p>
              {item.description && <p className="text-sm text-muted mt-2">{item.description}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleEdit(item)} className="text-muted hover:text-primary"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

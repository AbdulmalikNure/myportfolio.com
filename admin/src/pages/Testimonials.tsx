import { useEffect, useState } from 'react';
import { testimonials } from '../lib/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, Star } from 'lucide-react';

const empty = { name: '', position: '', company: '', rating: 5, review: '', display_order: 0 };

export default function Testimonials() {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const fetch = async () => { const r = await testimonials.getAll(); setData(r.data.data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (photoFile) fd.append('photo', photoFile);
    try {
      if (editing) { await testimonials.update(editing, fd); toast.success('Updated'); }
      else { await testimonials.create(fd); toast.success('Created'); }
      setForm(empty); setEditing(null); setShowForm(false); setPhotoFile(null); fetch();
    } catch { toast.error('Failed to save'); }
  };

  const handleEdit = (item: any) => {
    setForm({ name: item.name, position: item.position || '', company: item.company || '',
      rating: item.rating, review: item.review, display_order: item.display_order });
    setEditing(item.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await testimonials.delete(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">
          <Plus size={14} /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit' : 'Add'} Testimonial</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Name *', 'name'], ['Position', 'position'], ['Company', 'company']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">{label}</label>
                <input value={form[key]} onChange={(e) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-muted mb-1">Rating (1–5)</label>
              <input type="number" min="1" max="5" value={form.rating}
                onChange={(e) => setForm((p: any) => ({ ...p, rating: parseInt(e.target.value) }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="text-sm text-muted file:bg-border file:text-text file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:cursor-pointer" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Review *</label>
              <textarea value={form.review} onChange={(e) => setForm((p: any) => ({ ...p, review: e.target.value }))} required
                rows={3} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-text">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {item.photo
                  ? <img src={item.photo} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                  : <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center font-bold text-primary">{item.name[0]}</div>
                }
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted">{[item.position, item.company].filter(Boolean).join(' @ ')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="text-muted hover:text-primary"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={14} className={i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-border'} />
              ))}
            </div>
            <p className="text-sm text-muted italic">"{item.review}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

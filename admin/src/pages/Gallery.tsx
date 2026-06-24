import { useEffect, useState } from 'react';
import { gallery } from '../lib/api';
import toast from 'react-hot-toast';
import { Trash2, Plus, Pencil } from 'lucide-react';

export default function Gallery() {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => { const r = await gallery.getAll(); setData(r.data.data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !file) { toast.error('Please select a file'); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      if (editing) { await gallery.update(editing, form); toast.success('Updated'); }
      else { await gallery.create(fd); toast.success('Uploaded'); }
      setForm({ title: '', category: '', description: '' });
      setEditing(null); setFile(null); setShowForm(false); fetch();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await gallery.delete(id); toast.success('Deleted'); fetch();
  };

  const handleEdit = (item: any) => {
    setForm({ title: item.title || '', category: item.category || '', description: item.description || '' });
    setEditing(item.id); setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <button onClick={() => { setForm({ title: '', category: '', description: '' }); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">
          <Plus size={14} /> Upload
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit' : 'Upload'} Gallery Item</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            {!editing && (
              <div className="sm:col-span-2">
                <label className="block text-xs text-muted mb-1">File (Image or Video)</label>
                <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-sm text-muted file:bg-border file:text-text file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:cursor-pointer" />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-text">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((item) => (
          <div key={item.id} className="relative group bg-surface border border-border rounded-xl overflow-hidden">
            {item.file_type === 'video'
              ? <video src={item.file_url} className="w-full h-36 object-cover" muted />
              : <img src={item.file_url} alt={item.title || ''} className="w-full h-36 object-cover" />
            }
            <div className="p-2">
              <p className="text-xs font-medium truncate">{item.title || 'Untitled'}</p>
              {item.category && <p className="text-xs text-muted">{item.category}</p>}
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(item)} className="bg-bg/80 p-1 rounded text-muted hover:text-primary"><Pencil size={12} /></button>
              <button onClick={() => handleDelete(item.id)} className="bg-bg/80 p-1 rounded text-muted hover:text-red-400"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

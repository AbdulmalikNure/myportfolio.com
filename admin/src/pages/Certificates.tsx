import { useEffect, useState } from 'react';
import { certificates } from '../lib/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, ExternalLink } from 'lucide-react';

const empty = { name: '', organization: '', issue_date: '', verification_url: '', display_order: 0 };

export default function Certificates() {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetch = async () => { const r = await certificates.getAll(); setData(r.data.data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (imageFile) fd.append('image', imageFile);
    try {
      if (editing) { await certificates.update(editing, fd); toast.success('Updated'); }
      else { await certificates.create(fd); toast.success('Created'); }
      setForm(empty); setEditing(null); setShowForm(false); setImageFile(null); fetch();
    } catch { toast.error('Failed to save'); }
  };

  const handleEdit = (item: any) => {
    setForm({ name: item.name, organization: item.organization || '', issue_date: item.issue_date?.slice(0, 10) || '',
      verification_url: item.verification_url || '', display_order: item.display_order });
    setEditing(item.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await certificates.delete(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); setImageFile(null); }}
          className="flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">
          <Plus size={14} /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit' : 'Add'} Certificate</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['Certificate Name *', 'name'], ['Organization', 'organization'], ['Verification URL', 'verification_url']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">{label}</label>
                <input value={form[key]} onChange={(e) => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-muted mb-1">Issue Date</label>
              <input type="date" value={form.issue_date} onChange={(e) => setForm((p: any) => ({ ...p, issue_date: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Certificate Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm text-muted file:bg-border file:text-text file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-text">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.id} className="bg-surface border border-border rounded-xl overflow-hidden">
            {item.image
              ? <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
              : <div className="w-full h-40 bg-bg flex items-center justify-center text-muted text-xs">No image</div>
            }
            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              {item.organization && <p className="text-xs text-primary">{item.organization}</p>}
              {item.issue_date && <p className="text-xs text-muted">{item.issue_date.slice(0, 10)}</p>}
              <div className="flex items-center justify-between pt-1">
                {item.verification_url
                  ? <a href={item.verification_url} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <ExternalLink size={10} /> Verify
                    </a>
                  : <span />
                }
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="text-muted hover:text-primary"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

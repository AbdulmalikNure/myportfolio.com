import { useEffect, useState } from 'react';
import { blog } from '../lib/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

const empty = { title: '', excerpt: '', content: '', tags: '', category: '', is_published: false };

export default function Blog() {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pagination, setPagination] = useState<any>({});
  const [page, setPage] = useState(1);

  const fetch = async () => {
    const r = await blog.getAll({ page, limit: 10 });
    setData(r.data.data);
    setPagination(r.data.pagination);
  };
  useEffect(() => { fetch(); }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('excerpt', form.excerpt);
    fd.append('content', form.content);
    fd.append('tags', JSON.stringify(form.tags.split(',').map((s: string) => s.trim()).filter(Boolean)));
    fd.append('category', form.category);
    fd.append('is_published', String(form.is_published));
    if (coverFile) fd.append('cover_image', coverFile);
    try {
      if (editing) { await blog.update(editing, fd); toast.success('Updated'); }
      else { await blog.create(fd); toast.success('Created'); }
      setForm(empty); setEditing(null); setShowForm(false); setCoverFile(null); fetch();
    } catch { toast.error('Failed to save'); }
  };

  const handleEdit = (item: any) => {
    setForm({ title: item.title, excerpt: item.excerpt || '', content: item.content || '',
      tags: (item.tags || []).join(', '), category: item.category || '', is_published: item.is_published });
    setEditing(item.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await blog.delete(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">
          <Plus size={14} /> New Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit' : 'New'} Post</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))} required
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm((p: any) => ({ ...p, category: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm((p: any) => ({ ...p, tags: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm((p: any) => ({ ...p, excerpt: e.target.value }))}
                rows={2} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1">Content</label>
              <textarea value={form.content} onChange={(e) => setForm((p: any) => ({ ...p, content: e.target.value }))}
                rows={8} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary resize-none font-mono" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Cover Image</label>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="text-sm text-muted file:bg-border file:text-text file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="published" checked={form.is_published}
                onChange={(e) => setForm((p: any) => ({ ...p, is_published: e.target.checked }))} />
              <label htmlFor="published" className="text-sm text-muted">Publish immediately</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-text">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {data.map((post) => (
          <div key={post.id} className="bg-surface border border-border rounded-xl p-5 flex items-start gap-4">
            {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold truncate">{post.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {post.is_published
                    ? <span className="flex items-center gap-1 text-xs text-green-400"><Eye size={12}/> Published</span>
                    : <span className="flex items-center gap-1 text-xs text-muted"><EyeOff size={12}/> Draft</span>
                  }
                  <button onClick={() => handleEdit(post)} className="text-muted hover:text-primary"><Pencil size={14}/></button>
                  <button onClick={() => handleDelete(post.id)} className="text-muted hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              </div>
              {post.excerpt && <p className="text-sm text-muted mt-1 line-clamp-2">{post.excerpt}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                {post.category && <span className="text-primary">{post.category}</span>}
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <span>{post.view_count} views</span>
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

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import {
  Upload, Trash2, Eye, Download, FileText, Briefcase,
  CheckCircle, XCircle, Pencil, X, Save,
} from 'lucide-react';

const DOCUMENT_TYPES = [
  {
    value: 'design_1_cv',
    label: 'Design 1 CV',
    description: 'Professional CV Design Version 1',
    icon: FileText,
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    value: 'design_2_cv',
    label: 'Design 2 CV',
    description: 'Professional CV Design Version 2',
    icon: FileText,
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    value: 'complete_professional_portfolio',
    label: 'Complete Professional Portfolio',
    description: 'All professional documents in one PDF',
    icon: Briefcase,
    gradient: 'from-pink-500 to-rose-500',
  },
];

function formatBytes(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CvDocuments() {
  const [docs, setDocs]               = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [uploadType, setUploadType]   = useState<string>('design_1_cv');
  const [uploadName, setUploadName]   = useState('');
  const [uploadDesc, setUploadDesc]   = useState('');
  const [file, setFile]               = useState<File | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editForm, setEditForm]       = useState({ document_name: '', description: '', status: '' });

  const fetchDocs = async () => {
    try {
      const r = await api.get('/admin/cv-documents');
      setDocs(r.data.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('document_type', uploadType);
    if (uploadName) fd.append('document_name', uploadName);
    if (uploadDesc) fd.append('description', uploadDesc);
    setUploading(true);
    try {
      await api.post('/admin/cv-documents', fd);
      toast.success('Document uploaded successfully!');
      setFile(null);
      setUploadName('');
      setUploadDesc('');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/cv-documents/${id}`);
      toast.success('Document deleted');
      fetchDocs();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handlePreview = (id: string) => {
    window.open(`/api/admin/cv-documents/${id}/preview`, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const res = await api.get(`/admin/cv-documents/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const startEdit = (doc: any) => {
    setEditingId(doc.id);
    setEditForm({ document_name: doc.document_name, description: doc.description || '', status: doc.status });
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/admin/cv-documents/${id}`, editForm);
      toast.success('Updated');
      setEditingId(null);
      fetchDocs();
    } catch {
      toast.error('Update failed');
    }
  };

  // Group by type for display
  const getDocByType = (type: string) => docs.filter((d) => d.document_type === type);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">CV Management</h1>

      {/* ── Upload Form ─────────────────────────────────────── */}
      <form onSubmit={handleUpload} className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-primary">Upload CV Document</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Document type */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-muted mb-2">Document Type *</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {DOCUMENT_TYPES.map(({ value, label, icon: Icon, gradient }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUploadType(value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                    ${uploadType === value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-bg hover:border-border/60'}`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom name */}
          <div>
            <label className="block text-xs text-muted mb-1">Document Name (optional — uses default if blank)</label>
            <input value={uploadName} onChange={(e) => setUploadName(e.target.value)}
              placeholder={DOCUMENT_TYPES.find((t) => t.value === uploadType)?.label}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-muted mb-1">Description (optional)</label>
            <input value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
          </div>

          {/* File picker */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-muted mb-1">File (PDF or DOCX) *</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <Upload size={24} className="text-muted mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-primary text-sm font-medium hover:underline">Choose file</span>
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
              {file && (
                <p className="mt-2 text-sm text-text flex items-center justify-center gap-2">
                  <FileText size={14} className="text-primary" /> {file.name}
                  <span className="text-muted">({formatBytes(file.size)})</span>
                </p>
              )}
              <p className="text-xs text-muted mt-1">Uploading replaces the current active document of this type</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={uploading || !file}
          className="flex items-center gap-2 bg-primary text-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50">
          <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>

      {/* ── Document cards by type ───────────────────────────── */}
      {loading && <p className="text-muted text-sm animate-pulse">Loading documents...</p>}

      {DOCUMENT_TYPES.map(({ value, label, icon: Icon, gradient }) => {
        const typeDocs = getDocByType(value);
        return (
          <div key={value} className="bg-surface border border-border rounded-xl overflow-hidden">
            {/* Type header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-border/10">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon size={14} className="text-white" />
              </div>
              <span className="font-semibold">{label}</span>
              <span className="ml-auto text-xs text-muted">{typeDocs.length} version{typeDocs.length !== 1 ? 's' : ''}</span>
            </div>

            {typeDocs.length === 0 && (
              <p className="px-5 py-4 text-sm text-muted">No document uploaded yet</p>
            )}

            {typeDocs.map((doc) => (
              <div key={doc.id} className="px-5 py-4 border-b border-border last:border-0">
                {editingId === doc.id ? (
                  /* Inline edit form */
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-muted mb-1">Name</label>
                        <input value={editForm.document_name}
                          onChange={(e) => setEditForm((p) => ({ ...p, document_name: e.target.value }))}
                          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">Status</label>
                        <select value={editForm.status}
                          onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-muted mb-1">Description</label>
                        <input value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(doc.id)}
                        className="flex items-center gap-1 bg-primary text-bg px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-dark">
                        <Save size={12} /> Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 border border-border text-muted px-3 py-1.5 rounded-lg text-xs hover:text-text">
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal row */
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{doc.document_name}</span>
                        {doc.status === 'active'
                          ? <span className="flex items-center gap-1 text-xs text-green-400 flex-shrink-0"><CheckCircle size={11}/> Active</span>
                          : <span className="flex items-center gap-1 text-xs text-muted flex-shrink-0"><XCircle size={11}/> Inactive</span>
                        }
                      </div>
                      {doc.description && <p className="text-xs text-muted mt-0.5 truncate max-w-xs">{doc.description}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        <span>{doc.file_name}</span>
                        <span>{formatBytes(doc.file_size)}</span>
                        <span>{doc.view_count} views</span>
                        <span>{doc.download_count} downloads</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(doc)} title="Edit" className="text-muted hover:text-primary p-1.5 rounded hover:bg-border/50"><Pencil size={14} /></button>
                      <button onClick={() => handlePreview(doc.id)} title="Preview" className="text-muted hover:text-primary p-1.5 rounded hover:bg-border/50"><Eye size={14} /></button>
                      <button onClick={() => handleDownload(doc.id, doc.file_name)} title="Download" className="text-muted hover:text-primary p-1.5 rounded hover:bg-border/50"><Download size={14} /></button>
                      <button onClick={() => handleDelete(doc.id, doc.document_name)} title="Delete" className="text-muted hover:text-red-400 p-1.5 rounded hover:bg-border/50"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

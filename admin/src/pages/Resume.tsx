import { useEffect, useState } from 'react';
import { resume } from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function Resume() {
  const [list, setList] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetch = async () => { const r = await resume.list(); setList(r.data.data); };
  useEffect(() => { fetch(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a PDF file'); return; }
    const fd = new FormData();
    fd.append('resume', file);
    setUploading(true);
    try {
      await resume.upload(fd);
      toast.success('Resume uploaded and set as active!');
      setFile(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Resume Management</h1>

      <form onSubmit={handleUpload} className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-primary">Upload New Resume</h2>
        <p className="text-sm text-muted">Uploading a new PDF will automatically set it as the active resume for the "Download CV" button.</p>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <Upload size={32} className="text-muted mx-auto mb-3" />
          <label className="cursor-pointer">
            <span className="text-primary font-medium hover:underline">Choose PDF file</span>
            <input type="file" accept=".pdf,application/pdf" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          {file && <p className="mt-2 text-sm text-text">{file.name}</p>}
        </div>
        <button type="submit" disabled={uploading || !file}
          className="bg-primary text-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2">
          <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </form>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Upload History</h2>
        <div className="space-y-3">
          {list.length === 0 && <p className="text-muted text-sm">No resumes uploaded yet</p>}
          {list.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <FileText size={18} className="text-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.file_name || 'resume.pdf'}</p>
                <p className="text-xs text-muted">{new Date(r.uploaded_at).toLocaleString()}</p>
              </div>
              {r.is_active && (
                <span className="flex items-center gap-1 text-xs text-green-400 flex-shrink-0">
                  <CheckCircle size={12} /> Active
                </span>
              )}
              <a href={r.file_url} target="_blank" rel="noreferrer"
                className="text-xs text-primary hover:underline flex-shrink-0">View</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

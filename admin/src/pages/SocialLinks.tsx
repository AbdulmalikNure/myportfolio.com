import { useEffect, useState } from 'react';
import { socialLinks } from '../lib/api';
import toast from 'react-hot-toast';
import { Trash2, Save } from 'lucide-react';

const PLATFORMS = [
  { key: 'telegram',  label: 'Telegram',  placeholder: 'https://t.me/username' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@channel' },
  { key: 'github',    label: 'GitHub',    placeholder: 'https://github.com/username' },
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username' },
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/profile' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'x',         label: 'X (Twitter)', placeholder: 'https://x.com/username' },
  { key: 'email',     label: 'Email',     placeholder: 'mailto:your@email.com' },
];

export default function SocialLinks() {
  const [data, setData] = useState<any[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const fetch = async () => { const r = await socialLinks.getAll(); setData(r.data.data); };
  useEffect(() => { fetch(); }, []);

  const getUrl = (platform: string) => data.find((d) => d.platform === platform)?.url || '';
  const getId  = (platform: string) => data.find((d) => d.platform === platform)?.id;

  const handleSave = async (platform: string, url: string) => {
    if (!url.trim()) return;
    setSaving(platform);
    try {
      await socialLinks.upsert({ platform, url });
      toast.success(`${platform} saved`);
      fetch();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(null); }
  };

  const handleDelete = async (platform: string) => {
    const id = getId(platform);
    if (!id || !confirm(`Remove ${platform}?`)) return;
    await socialLinks.delete(id); toast.success('Removed'); fetch();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Social Links</h1>

      <div className="bg-surface border border-border rounded-xl divide-y divide-border">
        {PLATFORMS.map(({ key, label, placeholder }) => {
          const [url, setUrl] = useState(getUrl(key));
          // sync from data
          useEffect(() => { setUrl(getUrl(key)); }, [data]);

          return (
            <div key={key} className="flex items-center gap-3 px-5 py-4">
              <label className="w-28 text-sm font-medium flex-shrink-0">{label}</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
              />
              <button onClick={() => handleSave(key, url)} disabled={saving === key}
                className="flex items-center gap-1 bg-primary text-bg px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary-dark disabled:opacity-50">
                <Save size={12} /> {saving === key ? '...' : 'Save'}
              </button>
              {getId(key) && (
                <button onClick={() => handleDelete(key)} className="text-muted hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

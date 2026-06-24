import { useEffect, useState } from 'react';
import { settings } from '../lib/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settings.get().then((r) => setData(r.data.data || {})).finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: any) => setData((p: any) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData(e.target as HTMLFormElement);
      // For array field hero_professions, split by comma
      const professions = data.hero_professions_text || data.hero_professions?.join(', ') || '';
      fd.set('hero_professions', JSON.stringify(professions.split(',').map((s: string) => s.trim())));
      await settings.update(fd);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted animate-pulse">Loading...</div>;

  const field = (label: string, name: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm text-muted mb-1">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={data[name] || ''}
        className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-primary"
        placeholder={placeholder}
      />
    </div>
  );

  const textarea = (label: string, name: string, rows = 3) => (
    <div>
      <label className="block text-sm text-muted mb-1">{label}</label>
      <textarea
        name={name}
        defaultValue={data[name] || ''}
        rows={rows}
        className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-primary resize-none"
      />
    </div>
  );

  const fileField = (label: string, name: string, current?: string) => (
    <div>
      <label className="block text-sm text-muted mb-1">{label}</label>
      {current && <img src={current} alt={label} className="h-12 mb-2 rounded" />}
      <input type="file" name={name} accept="image/*"
        className="text-sm text-muted file:bg-border file:text-text file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:cursor-pointer" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Site */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-primary">Site Identity</h2>
          {field('Site Name', 'site_name')}
          {field('Footer Text', 'footer_text')}
          {fileField('Site Logo', 'site_logo', data.site_logo)}
          {fileField('Favicon', 'favicon', data.favicon)}
        </section>

        {/* SEO */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-primary">SEO</h2>
          {field('SEO Title', 'seo_title')}
          {textarea('SEO Description', 'seo_desc')}
          {field('Meta Keywords', 'meta_keywords', 'text', 'keyword1, keyword2')}
        </section>

        {/* Hero */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-primary">Hero Section</h2>
          {field('Hero Title (Name)', 'hero_title')}
          {field('Hero Subtitle', 'hero_subtitle')}
          {textarea('Hero Description', 'hero_desc')}
          <div>
            <label className="block text-sm text-muted mb-1">Professions (comma-separated)</label>
            <input
              type="text"
              name="hero_professions_text"
              defaultValue={data.hero_professions?.join(', ') || ''}
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-primary"
              placeholder="Graphic Designer, Video Editor, Website Developer"
            />
          </div>
          {field('CTA Button Text', 'hero_cta_text')}
          {fileField('Hero Image', 'hero_image', data.hero_image)}
        </section>

        {/* About */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-primary">About Section</h2>
          {textarea('Biography', 'about_bio', 5)}
          {field('Age', 'about_age', 'number')}
          {field('Location', 'about_location')}
          {field('Years of Experience', 'about_years_exp', 'number')}
          {field('Projects Completed', 'about_projects_count', 'number')}
          {field('CV Download URL', 'cv_url')}
          {fileField('About Image', 'about_image', data.about_image)}
        </section>

        {/* Contact */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-primary">Contact Info</h2>
          {field('Email', 'email', 'email')}
          {field('Phone', 'phone', 'tel')}
        </section>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

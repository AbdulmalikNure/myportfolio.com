import { useEffect, useState } from 'react';
import { messages } from '../lib/api';
import toast from 'react-hot-toast';
import { Trash2, Mail, Reply, Search } from 'lucide-react';

export default function Messages() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    const r = await messages.getAll({ search });
    setData(r.data.data);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, [search]);

  const open = async (msg: any) => {
    if (!msg.is_read) await messages.markRead(msg.id).catch(() => {});
    const r = await messages.getOne(msg.id);
    setSelected(r.data.data);
    setData((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await messages.delete(id);
    setData((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success('Message deleted');
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await messages.reply(selected.id, replyText);
      toast.success('Reply sent!');
      setReplyText('');
      setSelected((prev: any) => ({ ...prev, is_replied: true }));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>

      <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
        <Search size={16} className="text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="bg-transparent flex-1 text-sm focus:outline-none text-text placeholder-muted"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* List */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {loading && <p className="p-4 text-muted text-sm animate-pulse">Loading...</p>}
          {!loading && data.length === 0 && <p className="p-4 text-muted text-sm">No messages</p>}
          {data.map((msg) => (
            <div
              key={msg.id}
              onClick={() => open(msg)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-border/30 transition-colors
                ${selected?.id === msg.id ? 'bg-border/30' : ''}
                ${!msg.is_read ? 'border-l-2 border-l-primary' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-medium text-sm ${!msg.is_read ? 'text-text' : 'text-muted'}`}>{msg.full_name}</p>
                  <p className="text-xs text-muted">{msg.email}</p>
                  <p className="text-xs text-muted mt-1 truncate max-w-xs">{msg.subject || 'No subject'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {msg.is_replied && <Mail size={12} className="text-green-400" />}
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} className="text-muted hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-lg">{selected.full_name}</h2>
              <p className="text-muted text-sm">{selected.email}</p>
              {selected.phone && <p className="text-muted text-sm">{selected.phone}</p>}
              {selected.subject && <p className="text-sm text-primary mt-1">{selected.subject}</p>}
              <p className="text-xs text-muted">{new Date(selected.created_at).toLocaleString()}</p>
            </div>
            <div className="bg-bg rounded-lg p-4 text-sm text-text whitespace-pre-wrap">{selected.message}</div>
            <div>
              <label className="block text-sm text-muted mb-2">Reply</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text focus:outline-none focus:border-primary resize-none"
                placeholder="Type your reply..."
              />
              <button
                onClick={handleReply}
                disabled={sending}
                className="mt-2 flex items-center gap-2 bg-primary text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
              >
                <Reply size={14} /> {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl flex items-center justify-center text-muted text-sm">
            Select a message to view
          </div>
        )}
      </div>
    </div>
  );
}

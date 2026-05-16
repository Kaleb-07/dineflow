import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Download, Trash2, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import api from '../lib/axios';

interface QR {
  id: number;
  label: string;
  type: 'TABLE' | 'ROOM' | 'BAR' | 'TAKEAWAY' | 'OTHER';
  url: string;
  scanCount: number;
  isActive: boolean;
}

const TYPES = ['TABLE','ROOM','BAR','TAKEAWAY','OTHER'] as const;

export default function QRPage() {
  const { venue } = useStore();
  const [qrCodes, setQrCodes] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ label: '', type: 'TABLE' as QR['type'] });
  const [saving,  setSaving]  = useState(false);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  const load = async () => {
    const { data } = await api.get('/qr');
    setQrCodes(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Render QR codes onto canvases after data loads
  useEffect(() => {
    qrCodes.forEach(qr => {
      const canvas = canvasRefs.current[qr.id];
      if (canvas) {
        QRCode.toCanvas(canvas, qr.url, {
          width: 200,
          margin: 2,
          color: { dark: '#0d1f1a', light: '#FAF7F0' }
        });
      }
    });
  }, [qrCodes]);

  const create = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    try {
      const url = `${window.location.origin}/menu/${venue?.slug}`;
      const { data } = await api.post('/qr', { ...form, url });
      setQrCodes(p => [...p, data]);
      setForm({ label: '', type: 'TABLE' });
      setModal(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this QR code?')) return;
    await api.delete(`/qr/${id}`);
    setQrCodes(p => p.filter(q => q.id !== id));
  };

  const download = (id: number, label: string) => {
    const canvas = canvasRefs.current[id];
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${label.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const bulk = async () => {
    const count = Number(prompt('How many tables? (e.g. 10)'));
    if (!count || count < 1) return;
    const url = `${window.location.origin}/menu/${venue?.slug}`;
    const promises = Array.from({ length: count }, (_, i) =>
      api.post('/qr', { label: `Table ${i + 1}`, type: 'TABLE', url })
    );
    const results = await Promise.all(promises);
    setQrCodes(p => [...p, ...results.map(r => r.data)]);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">QR Codes</h1>
          <p className="text-gray-400 text-sm mt-0.5">{qrCodes.length} codes · scan to open guest menu</p>
        </div>
        <div className="flex gap-2">
          <button onClick={bulk}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
            Bulk tables
          </button>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 text-sm font-medium rounded-lg transition-colors">
            <Plus size={15} /> New QR
          </button>
        </div>
      </div>

      {/* Guest menu URL info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Guest menu URL</div>
          <code className="text-amber-300 text-sm">{window.location.origin}/menu/{venue?.slug}</code>
        </div>
        <QrCode size={20} className="text-gray-600 flex-shrink-0" />
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading…</div>
      ) : qrCodes.length === 0 ? (
        <div className="text-center py-16">
          <QrCode size={40} className="text-gray-700 mx-auto mb-3" />
          <div className="text-gray-500 mb-4">No QR codes yet</div>
          <button onClick={() => setModal(true)}
            className="text-amber-400 text-sm hover:text-amber-300">
            Create your first QR code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {qrCodes.map(qr => (
            <div key={qr.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center gap-3">
              {/* QR canvas */}
              <div className="rounded-xl overflow-hidden bg-[#FAF7F0] p-2">
                <canvas
                  ref={el => { canvasRefs.current[qr.id] = el; }}
                  width={160} height={160}
                  style={{ display: 'block' }}
                />
              </div>
              {/* Info */}
              <div className="text-center w-full">
                <div className="text-white text-sm font-medium truncate">{qr.label}</div>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full capitalize">
                    {qr.type.toLowerCase()}
                  </span>
                  <span className="text-xs text-gray-600">{qr.scanCount} scans</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2 w-full">
                <button onClick={() => download(qr.id, qr.label)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs rounded-lg transition-colors">
                  <Download size={13} /> Download
                </button>
                <button onClick={() => remove(qr.id)}
                  className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-400 rounded-lg transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModal(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6">
            <h3 className="text-white font-medium mb-4">New QR code</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Label</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                  placeholder="e.g. Table 1, Room 204, Bar"
                  value={form.label}
                  onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                        form.type === t
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      }`}>
                      {t.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={create} disabled={saving || !form.label.trim()}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 text-sm font-semibold rounded-lg transition-colors mt-2">
                {saving ? 'Creating…' : 'Create QR code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

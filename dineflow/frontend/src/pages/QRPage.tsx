import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Download, Trash2, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import api from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
          <Button onClick={bulk} variant="outline">
            Bulk tables
          </Button>
          <Button onClick={() => setModal(true)}>
            <Plus size={15} /> New QR
          </Button>
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
                <Button
                  onClick={() => download(qr.id, qr.label)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download size={13} /> Download
                </Button>
                <Button
                  onClick={() => remove(qr.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={13} />
                </Button>
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
                <Input
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
                    <Button
                      key={t}
                      onClick={() => setForm(p => ({ ...p, type: t }))}
                      variant={form.type === t ? 'default' : 'outline'}
                      size="sm"
                      className="capitalize"
                    >
                      {t.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={create}
                disabled={saving || !form.label.trim()}
                className="w-full mt-2"
              >
                {saving ? 'Creating…' : 'Create QR code'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Download, Trash2, QrCode, ArrowUpDown, MoreHorizontal, Eye } from 'lucide-react';
import QRCode from 'qrcode';
import api from '../lib/axios';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { DataTable } from '../components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';

interface QR {
  id: number;
  label: string;
  type: 'TABLE' | 'ROOM' | 'BAR' | 'TAKEAWAY' | 'OTHER';
  url: string;
  scanCount: number;
  isActive: boolean;
}

const TYPES = ['TABLE','ROOM','BAR','TAKEAWAY','OTHER'] as const;

// Self-contained component to render QR code on a canvas and Ensures rendering works perfectly even during table pagination, sorting, and filtering.
function QRCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 120,
        margin: 1,
        color: { dark: '#0d1f1a', light: '#FAF7F0' }
      }).catch(err => console.error("QR render error", err));
    }
  }, [url]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

export default function QRPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { venue } = useStore();
  const [qrCodes, setQrCodes] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ label: '', type: 'TABLE' as QR['type'] });
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    const { data } = await api.get('/qr');
    setQrCodes(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    try {
      const url = `${window.location.origin}/menu/${venue?.slug}`;
      const { data } = await api.post('/qr', { ...form, url });
      setQrCodes(p => [data, ...p]);
      setForm({ label: '', type: 'TABLE' });
      setModal(false);
      toast.created('QR code');
    } catch {
      toast.error('Failed to create QR code');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete QR Code',
      message: 'Are you sure you want to permanently delete this QR code?',
      confirmLabel: 'Delete',
      isDestructive: true,
    });
    if (!confirmed) return;
    try {
      await api.delete(`/qr/${id}`);
      setQrCodes(p => p.filter(q => q.id !== id));
      toast.deleted('QR code');
    } catch {
      toast.error('Failed to delete QR code');
    }
  };

  const bulkDelete = async (selectedQRs: QR[]) => {
    const confirmed = await confirm({
      title: 'Delete Multiple QR Codes',
      message: `Are you sure you want to delete the ${selectedQRs.length} selected QR code(s)?`,
      confirmLabel: 'Delete Selected',
      isDestructive: true,
    });
    if (!confirmed) return;
    const toastId = toast.loading(`Deleting ${selectedQRs.length} QR code(s)…`);
    try {
      await Promise.all(selectedQRs.map(qr => api.delete(`/qr/${qr.id}`)));
      const deletedIds = new Set(selectedQRs.map(qr => qr.id));
      setQrCodes(p => p.filter(q => !deletedIds.has(q.id)));
      toast.dismiss(toastId);
      toast.success(`${selectedQRs.length} QR code(s) deleted`);
    } catch (err) {
      console.error("Bulk delete QR codes failed", err);
      toast.dismiss(toastId);
      toast.error("Failed to delete some QR codes");
      load();
    }
  };

  // Generates high-quality print-ready QR codes dynamically for download
  const download = async (url: string, label: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 600,
        margin: 2,
        color: { dark: '#0d1f1a', light: '#FAF7F0' }
      });
      const link = document.createElement('a');
      link.download = `${label.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Downloaded!', 'QR Code downloaded successfully');
    } catch (err) {
      console.error("QR download generation failed", err);
      toast.error('Download failed', 'Failed to generate download');
    }
  };

  const bulk = async () => {
    const count = Number(prompt('How many tables? (e.g. 10)'));
    if (!count || count < 1) return;
    const toastId = toast.loading(`Generating ${count} table QR codes…`);
    try {
      const url = `${window.location.origin}/menu/${venue?.slug}`;
      const promises = Array.from({ length: count }, (_, i) =>
        api.post('/qr', { label: `Table ${i + 1}`, type: 'TABLE', url })
      );
      const results = await Promise.all(promises);
      setQrCodes(p => [...results.map(r => r.data), ...p]);
      toast.dismiss(toastId);
      toast.success(`${count} table QR codes generated`);
    } catch (err) {
      console.error("Bulk QR generation failed", err);
      toast.dismiss(toastId);
      toast.error('Generation failed', 'Failed to generate table QR codes');
      load();
    }
  };

  const columns: ColumnDef<QR>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'qr',
      header: 'QR Code',
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-lg bg-[#FAF7F0] p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
          <QRCanvas url={row.original.url} />
        </div>
      ),
    },
    {
      accessorKey: 'label',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent text-gray-400 hover:text-white"
        >
          Label
          <ArrowUpDown size={14} className="ml-1" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium text-white">{row.original.label}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full capitalize whitespace-nowrap">
          {row.original.type.toLowerCase()}
        </span>
      ),
    },
    {
      accessorKey: 'scanCount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 hover:bg-transparent text-gray-400 hover:text-white whitespace-nowrap"
        >
          Scans
          <ArrowUpDown size={14} className="ml-1" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-sm text-gray-400 whitespace-nowrap">{row.original.scanCount} scans</span>,
    },
    {
      accessorKey: 'url',
      header: 'Guest Menu URL',
      cell: ({ row }) => (
        <code className="text-xs text-amber-300 max-w-[220px] block truncate">{row.original.url}</code>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const qr = row.original;
        return (
          <div className="text-right whitespace-nowrap w-12 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => window.open(qr.url, '_blank')}>
                  <Eye size={14} /> View menu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => download(qr.url, qr.label)}>
                  <Download size={14} /> Download QR
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400"
                  onClick={() => remove(qr.id)}
                >
                  <Trash2 size={14} /> Delete QR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
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
        <DataTable
          columns={columns}
          data={qrCodes}
          searchKey="label"
          searchPlaceholder="Search QR codes..."
          onDeleteSelected={bulkDelete}
        />
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

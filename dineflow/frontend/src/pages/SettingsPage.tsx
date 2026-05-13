import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import api from '../lib/axios';
import type { Amenity } from '../types';

export default function SettingsPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editAmenity, setEditAmenity] = useState<Amenity | null>(null);

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      const { data } = await api.get('/amenities');
      setAmenities(data);
    } finally {
      setLoading(false);
    }
  };

  const deleteAmenity = async (id: number) => {
    if (!confirm('Delete this amenity?')) return;
    await api.delete(`/amenities/${id}`);
    setAmenities(p => p.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage amenities and features</p>
        </div>
        <button
          onClick={() => { setEditAmenity(null); setModal(true); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} /> Add amenity
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading…</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-xs text-gray-400 uppercase tracking-widest">Amenities</h3>
          </div>
          
          {amenities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-3">No amenities yet</div>
              <button
                onClick={() => setModal(true)}
                className="text-amber-400 text-sm hover:text-amber-300"
              >
                + Add your first amenity
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {amenities.map(amenity => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/50 transition-colors"
                >
                  <GripVertical size={14} className="text-gray-600 flex-shrink-0" />
                  <span className="text-xl flex-shrink-0">{amenity.icon}</span>
                  <span className="text-white text-sm flex-1">{amenity.name}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditAmenity(amenity); setModal(true); }}
                      className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-500 hover:text-white transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteAmenity(amenity.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modal && (
        <AmenityModal
          amenity={editAmenity}
          onClose={() => setModal(false)}
          onSave={(amenity) => {
            setAmenities(p =>
              editAmenity
                ? p.map(a => (a.id === amenity.id ? amenity : a))
                : [...p, amenity]
            );
            setModal(false);
          }}
        />
      )}
    </div>
  );
}

function AmenityModal({
  amenity,
  onClose,
  onSave,
}: {
  amenity: Amenity | null;
  onClose: () => void;
  onSave: (amenity: Amenity) => void;
}) {
  const [form, setForm] = useState({
    name: amenity?.name || '',
    icon: amenity?.icon || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = amenity
        ? await api.patch(`/amenities/${amenity.id}`, form)
        : await api.post('/amenities', form);
      onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="text-white font-medium">
            {amenity ? 'Edit amenity' : 'New amenity'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
              Amenity name
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-colors"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Free WiFi"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
              Icon (emoji)
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-colors"
              value={form.icon}
              onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
              placeholder="📶"
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : amenity ? 'Save changes' : 'Create amenity'}
          </button>
        </div>
      </div>
    </div>
  );
}

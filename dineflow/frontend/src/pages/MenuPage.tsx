import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Image, FileSpreadsheet } from 'lucide-react';
import api from '../lib/axios';
import type { Category, MenuItem, Variant } from '../types';
import BulkUploadModal from '../components/BulkUploadModal';

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items,      setItems]      = useState<MenuItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState<'items' | 'categories'>('items');

  // Item form state
  const [itemModal,  setItemModal]  = useState(false);
  const [editItem,   setEditItem]   = useState<MenuItem | null>(null);
  const [catModal,   setCatModal]   = useState(false);
  const [editCat,    setEditCat]    = useState<Category | null>(null);
  const [bulkModal,  setBulkModal]  = useState(false);

  const load = async () => {
    const [c, i] = await Promise.all([api.get('/categories'), api.get('/items')]);
    setCategories(c.data);
    setItems(i.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const deleteItem = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/items/${id}`);
    setItems(p => p.filter(i => i.id !== id));
  };

  const deleteCat = async (id: number) => {
    if (!confirm('Delete category and all its items?')) return;
    await api.delete(`/categories/${id}`);
    setCategories(p => p.filter(c => c.id !== id));
    setItems(p => p.filter(i => i.categoryId !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Menu</h1>
        <div className="flex gap-2">
          <button onClick={() => setBulkModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
            <FileSpreadsheet size={15} /> Bulk upload
          </button>
          <button onClick={() => { setEditCat(null); setCatModal(true); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
            <Plus size={15} /> Category
          </button>
          <button onClick={() => { setEditItem(null); setItemModal(true); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 text-sm font-medium rounded-lg transition-colors">
            <Plus size={15} /> Add item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        {(['items', 'categories'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors ${
              tab === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading…</div>
      ) : tab === 'categories' ? (
        // ── Categories list ──
        <div className="space-y-2">
          {categories.length === 0 && (
            <div className="text-gray-500 text-center py-12">No categories yet</div>
          )}
          {categories.map(cat => (
            <div key={cat.id}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon || '🍽'}</span>
                <div>
                  <div className="text-white text-sm font-medium">{cat.name}</div>
                  <div className="text-gray-500 text-xs">
                    {cat.type} · {cat._count?.items ?? 0} items
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditCat(cat); setCatModal(true); }}
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteCat(cat.id)}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── Items list grouped by category ──
        <div className="space-y-6">
          {categories.map(cat => {
            const catItems = items.filter(i => i.categoryId === cat.id);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{cat.icon || '🍽'}</span>
                  <span className="text-gray-400 text-xs uppercase tracking-widest">{cat.name}</span>
                  <span className="text-gray-700 text-xs">({catItems.length})</span>
                </div>
                <div className="space-y-2">
                  {catItems.map(item => (
                    <div key={item.id}
                      className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
                      {/* Image */}
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image
                          ? <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                          : <Image size={18} className="text-gray-600" />
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{item.name}</span>
                          {item.isFeatured && (
                            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                          {!item.isAvailable && (
                            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {item.variants.map(v => `${v.label} — ${v.price} ETB`).join(' · ')}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditItem(item); setItemModal(true); }}
                          className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteItem(item.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-3">No menu items yet</div>
              <button onClick={() => setItemModal(true)}
                className="text-amber-400 text-sm hover:text-amber-300">
                + Add your first item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {itemModal && (
        <ItemModal
          categories={categories}
          item={editItem}
          onClose={() => setItemModal(false)}
          onSave={(item) => {
            setItems(p => editItem
              ? p.map(i => i.id === item.id ? item : i)
              : [...p, item]
            );
            setItemModal(false);
          }}
        />
      )}
      {catModal && (
        <CategoryModal
          cat={editCat}
          onClose={() => setCatModal(false)}
          onSave={(cat) => {
            setCategories(p => editCat
              ? p.map(c => c.id === cat.id ? cat : c)
              : [...p, cat]
            );
            setCatModal(false);
          }}
        />
      )}
      {bulkModal && (
        <BulkUploadModal
          onClose={() => setBulkModal(false)}
          onDone={() => { load(); setBulkModal(false); }}
        />
      )}
    </div>
  );
}

// ── Item Modal ──────────────────────────────────────────
function ItemModal({ categories, item, onClose, onSave }: {
  categories: Category[]
  item: MenuItem | null
  onClose: () => void
  onSave: (item: MenuItem) => void
}) {
  const [form, setForm] = useState({
    name:        item?.name        || '',
    description: item?.description || '',
    image:       item?.image       || '',
    categoryId:  item?.categoryId  || categories[0]?.id || 0,
    ingredients: (item?.ingredients as string[] || []).join(', '),
    allergens:   (item?.allergens  as string[] || []).join(', '),
    isFeatured:  item?.isFeatured  || false,
    isAvailable: item?.isAvailable ?? true,
  });
  const [variants, setVariants] = useState<Omit<Variant, 'id' | 'menuItemId'>[]>(
    item?.variants?.map(v => ({ label: v.label, price: v.price, isDefault: v.isDefault, isAvailable: v.isAvailable, sortOrder: v.sortOrder }))
    || [{ label: 'Regular', price: 0, isDefault: true, isAvailable: true, sortOrder: 0 }]
  );
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const uploadImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await api.post('/upload', fd);
    setForm(p => ({ ...p, image: data.url }));
    setUploading(false);
  };

  const addVariant = () => setVariants(p => [
    ...p, { label: '', price: 0, isDefault: false, isAvailable: true, sortOrder: p.length }
  ]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        ingredients: form.ingredients.split(',').map(s => s.trim()).filter(Boolean),
        allergens:   form.allergens.split(',').map(s => s.trim()).filter(Boolean),
        variants
      };
      const { data } = item
        ? await api.patch(`/items/${item.id}`, payload)
        : await api.post('/items', payload);
      onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={item ? 'Edit item' : 'New item'} onClose={onClose}>
      <div className="space-y-4">
        {/* Image upload */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Photo</label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.image
                ? <img src={form.image} className="w-full h-full object-cover" alt="" />
                : <Image size={20} className="text-gray-600" />
              }
            </div>
            <label className="cursor-pointer text-sm text-amber-400 hover:text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors">
              {uploading ? 'Uploading…' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadImg} />
            </label>
          </div>
        </div>

        <FormField label="Item name">
          <input className={input} value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </FormField>

        <FormField label="Description">
          <textarea className={`${input} h-20 resize-none`} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </FormField>

        <FormField label="Category">
          <select className={input} value={form.categoryId}
            onChange={e => setForm(p => ({ ...p, categoryId: Number(e.target.value) }))}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Ingredients (comma separated)">
          <input className={input} value={form.ingredients}
            placeholder="Eggs, Tomato, Berbere, Onion"
            onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))} />
        </FormField>

        <FormField label="Allergens (comma separated)">
          <input className={input} value={form.allergens}
            placeholder="Gluten, Dairy"
            onChange={e => setForm(p => ({ ...p, allergens: e.target.value }))} />
        </FormField>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Variants & prices</label>
            <button onClick={addVariant} className="text-xs text-amber-400 hover:text-amber-300">
              + Add variant
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${input} flex-1`} placeholder="e.g. Full plate"
                  value={v.label}
                  onChange={e => setVariants(p => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                <input className={`${input} w-28`} type="number" placeholder="Price"
                  value={v.price}
                  onChange={e => setVariants(p => p.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} />
                {variants.length > 1 && (
                  <button onClick={() => setVariants(p => p.filter((_, j) => j !== i))}
                    className="text-gray-600 hover:text-red-400 transition-colors px-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-4">
          <Toggle label="Featured" value={form.isFeatured}
            onChange={v => setForm(p => ({ ...p, isFeatured: v }))} />
          <Toggle label="Available" value={form.isAvailable}
            onChange={v => setForm(p => ({ ...p, isAvailable: v }))} />
        </div>

        <button onClick={save} disabled={saving}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors">
          {saving ? 'Saving…' : item ? 'Save changes' : 'Create item'}
        </button>
      </div>
    </Modal>
  );
}

// ── Category Modal ──────────────────────────────────────
function CategoryModal({ cat, onClose, onSave }: {
  cat: Category | null
  onClose: () => void
  onSave: (cat: Category) => void
}) {
  const [form, setForm] = useState({
    name: cat?.name || '',
    type: cat?.type || 'FOOD' as 'FOOD' | 'DRINK',
    icon: cat?.icon || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = cat
        ? await api.patch(`/categories/${cat.id}`, form)
        : await api.post('/categories', form);
      onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={cat ? 'Edit category' : 'New category'} onClose={onClose}>
      <div className="space-y-4">
        <FormField label="Category name">
          <input className={input} value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </FormField>
        <FormField label="Icon (emoji)">
          <input className={input} value={form.icon} placeholder="🍔"
            onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} />
        </FormField>
        <FormField label="Type">
          <select className={input} value={form.type}
            onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}>
            <option value="FOOD">Food</option>
            <option value="DRINK">Drink</option>
          </select>
        </FormField>
        <button onClick={save} disabled={saving}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors">
          {saving ? 'Saving…' : cat ? 'Save changes' : 'Create category'}
        </button>
      </div>
    </Modal>
  );
}

// ── Shared components ───────────────────────────────────
const input = 'w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-colors';

function Modal({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <h3 className="text-white font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={() => onChange(!value)}
        className={`w-8 h-4 rounded-full transition-colors relative ${value ? 'bg-amber-500' : 'bg-gray-700'}`}>
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-gray-400 text-sm">{label}</span>
    </label>
  );
}

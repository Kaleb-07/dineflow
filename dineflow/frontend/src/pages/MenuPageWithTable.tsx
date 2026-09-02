import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Image as ImageIcon, FileSpreadsheet, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import api from '../lib/axios';
import type { Category, MenuItem, Variant } from '../types';
import BulkUploadModal from '../components/modals/BulkUploadModal';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
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

export default function MenuPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'items' | 'categories'>('items');

  // Modals
  const [itemModal, setItemModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [bulkModal, setBulkModal] = useState(false);

  const load = async () => {
    const [c, i] = await Promise.all([api.get('/categories'), api.get('/items')]);
    setCategories(c.data);
    setItems(i.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const deleteItem = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Menu Item',
      message: 'Are you sure you want to permanently delete this item?',
      confirmLabel: 'Delete',
      isDestructive: true,
    });
    if (!confirmed) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(p => p.filter(i => i.id !== id));
      toast.deleted('Menu item');
    } catch {
      toast.error('Failed to delete item', 'Please try again');
    }
  };

  const deleteCat = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category and all of its menu items?',
      confirmLabel: 'Delete All',
      isDestructive: true,
    });
    if (!confirmed) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(p => p.filter(c => c.id !== id));
      setItems(p => p.filter(i => i.categoryId !== id));
      toast.deleted('Category');
    } catch {
      toast.error('Failed to delete category', 'Please try again');
    }
  };

  const bulkDeleteItems = async (selectedItems: MenuItem[]) => {
    const confirmed = await confirm({
      title: 'Delete Multiple Items',
      message: `Are you sure you want to delete the ${selectedItems.length} selected item(s)?`,
      confirmLabel: 'Delete Selected',
      isDestructive: true,
    });
    if (!confirmed) return;
    const id = toast.loading(`Deleting ${selectedItems.length} item(s)…`);
    try {
      await Promise.all(selectedItems.map(item => api.delete(`/items/${item.id}`)));
      const deletedIds = new Set(selectedItems.map(item => item.id));
      setItems(p => p.filter(i => !deletedIds.has(i.id)));
      toast.dismiss(id);
      toast.success(`${selectedItems.length} item(s) deleted`, 'Removed successfully');
    } catch (err) {
      console.error("Bulk delete items failed", err);
      toast.dismiss(id);
      toast.error('Failed to delete some items', 'Please try again');
      load();
    }
  };

  const bulkDeleteCategories = async (selectedCats: Category[]) => {
    const confirmed = await confirm({
      title: 'Delete Multiple Categories',
      message: `Are you sure you want to delete the ${selectedCats.length} selected category(ies) and all of their menu items?`,
      confirmLabel: 'Delete All',
      isDestructive: true,
    });
    if (!confirmed) return;
    const id = toast.loading(`Deleting ${selectedCats.length} category(ies)…`);
    try {
      await Promise.all(selectedCats.map(cat => api.delete(`/categories/${cat.id}`)));
      const deletedIds = new Set(selectedCats.map(cat => cat.id));
      setCategories(p => p.filter(c => !deletedIds.has(c.id)));
      setItems(p => p.filter(i => !deletedIds.has(i.categoryId)));
      toast.dismiss(id);
      toast.success(`${selectedCats.length} category(ies) deleted`, 'Removed successfully');
    } catch (err) {
      console.error("Bulk delete categories failed", err);
      toast.dismiss(id);
      toast.error('Failed to delete some categories', 'Please try again');
      load();
    }
  };

  // Menu Items Columns
  const itemColumns: ColumnDef<MenuItem>[] = [
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
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
          {row.original.image ? (
            <img src={row.original.image} className="w-full h-full object-cover" alt={row.original.name} />
          ) : (
            <ImageIcon size={18} className="text-gray-600" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown size={14} />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-white">{row.original.name}</div>
          {row.original.description && (
            <div className="text-xs text-gray-500 line-clamp-1">{row.original.description}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'categoryId',
      header: 'Category',
      cell: ({ row }) => {
        const cat = categories.find(c => c.id === row.original.categoryId);
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span>{cat?.icon || '🍽'}</span>
            <span className="text-sm">{cat?.name || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'variants',
      header: 'Prices',
      cell: ({ row }) => (
        <div className="text-sm text-gray-400 whitespace-nowrap">
          {row.original.variants.map(v => `${v.label}: ${v.price} ETB`).join(' · ')}
        </div>
      ),
    },
    {
      accessorKey: 'isFeatured',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 whitespace-nowrap">
          {row.original.isFeatured && (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {!row.original.isAvailable && (
            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
              Unavailable
            </span>
          )}
          {row.original.isAvailable && !row.original.isFeatured && (
            <span className="text-xs text-gray-500">Available</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
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
                <DropdownMenuItem onClick={() => { setEditItem(item); setItemModal(true); }}>
                  <Pencil size={14} /> Edit item
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 size={14} /> Delete item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // The Category Columns
  const categoryColumns: ColumnDef<Category>[] = [
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
      accessorKey: 'icon',
      header: 'Icon',
      cell: ({ row }) => <span className="text-xl">{row.original.icon || '🍽'}</span>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown size={14} />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-sm text-gray-400">{row.original.type}</span>
      ),
    },
    {
      accessorKey: '_count',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-sm text-gray-400">{row.original._count?.items ?? 0} items</span>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const cat = row.original;
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
                <DropdownMenuItem onClick={() => { setEditCat(cat); setCatModal(true); }}>
                  <Pencil size={14} /> Edit category
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400"
                  onClick={() => deleteCat(cat.id)}
                >
                  <Trash2 size={14} /> Delete category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Menu</h1>
        <div className="flex gap-2">
          <Button onClick={() => setBulkModal(true)} variant="outline">
            <FileSpreadsheet size={15} /> Bulk upload
          </Button>
          <Button onClick={() => { setEditCat(null); setCatModal(true); }} variant="outline">
            <Plus size={15} /> Category
          </Button>
          <Button onClick={() => { setEditItem(null); setItemModal(true); }}>
            <Plus size={15} /> Add item
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        {(['items', 'categories'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors ${
              tab === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading…</div>
      ) : tab === 'categories' ? (
        <DataTable
          columns={categoryColumns}
          data={categories}
          searchKey="name"
          searchPlaceholder="Search categories..."
          onDeleteSelected={bulkDeleteCategories}
        />
      ) : (
        <DataTable
          columns={itemColumns}
          data={items}
          searchKey="name"
          searchPlaceholder="Search menu items..."
          onDeleteSelected={bulkDeleteItems}
        />
      )}

      {/* Modals - Keep existing modals from original MenuPage */}
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
            editItem ? toast.updated('Menu item') : toast.created('Menu item');
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
            editCat ? toast.updated('Category') : toast.created('Category');
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

// Modal component types
interface ItemModalProps {
  categories: Category[];
  item: MenuItem | null;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
}

interface CategoryModalProps {
  cat: Category | null;
  onClose: () => void;
  onSave: (cat: Category) => void;
}

// Item Modal
function ItemModal({ categories, item, onClose, onSave }: ItemModalProps) {
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
                : <ImageIcon size={20} className="text-gray-600" />
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

// The Category Modal 
function CategoryModal({ cat, onClose, onSave }: CategoryModalProps) {
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

// The Shared components
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

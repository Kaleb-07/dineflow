import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../lib/api';
import type { MenuItem, Category } from '../types';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const MenuPage = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/items'),
        api.get('/categories'),
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      setToast({ message: 'Failed to fetch data', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter((item) => item.id !== id));
      setToast({ message: 'Item deleted successfully', type: 'success' });
      setDeleteModal(null);
    } catch (error) {
      setToast({ message: 'Failed to delete item', type: 'error' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="card">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
            <p className="text-2xl font-bold text-blue-600 mb-4">
              {item.variants && item.variants.length > 0 
                ? `$${item.variants[0].price}` 
                : 'Price varies'}
            </p>
            
            <div className="flex gap-2">
              <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => setDeleteModal(item.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {deleteModal && (
        <ConfirmModal
          title="Delete Item"
          message="Are you sure you want to delete this item?"
          onConfirm={() => handleDelete(deleteModal)}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
};

export default MenuPage;

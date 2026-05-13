import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import api from '../lib/api';
import Toast from '../components/Toast';

const ThemePage = () => {
  const { settings, setSettings } = useStore();
  const [theme, setTheme] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Inter',
    restaurantName: '',
    logo: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (settings?.theme) {
      setTheme({ ...theme, ...settings.theme });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      const { data } = await api.patch('/settings/theme', { theme });
      setSettings(data);
      setToast({ message: 'Theme updated successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update theme', type: 'error' });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Theme Customization</h1>

      <div className="card max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              value={theme.restaurantName}
              onChange={(e) => setTheme({ ...theme, restaurantName: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="w-16 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                className="input-field flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                className="w-16 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.secondaryColor}
                onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                className="input-field flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={theme.fontFamily}
              onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
              className="input-field"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>

          <button onClick={handleSave} className="btn-primary w-full">
            Save Theme
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ThemePage;

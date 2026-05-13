import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Star, MapPin, Wifi, CreditCard } from 'lucide-react';
import axios from 'axios';
import type { Category, MenuItem, Amenity, Settings } from '../types';
import ItemDetailModal from '../components/ItemDetailModal';
import LocationModal from '../components/LocationModal';

const GuestMenuPage = () => {
  const { venueId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, [venueId]);

  const fetchMenu = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/public/menu`);
      setCategories(data.categories);
      setAmenities(data.amenities);
      setSettings(data.settings);
      
      if (data.settings?.theme) {
        applyTheme(data.settings.theme);
      }
    } catch (error) {
      console.error('Failed to fetch menu', error);
    }
  };

  const applyTheme = (theme: any) => {
    const root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty('--color-primary', theme.primaryColor);
    if (theme.secondaryColor) root.style.setProperty('--color-secondary', theme.secondaryColor);
  };

  const filteredCategories = categories.map(cat => ({
    ...cat,
    menuItems: cat.items?.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.menuItems && cat.menuItems.length > 0);

  const displayCategories = selectedCategory
    ? filteredCategories.filter(cat => cat.id === selectedCategory)
    : filteredCategories;

  return (
    <div className="guest-menu">
      <header className="guest-header">
        <div className="container">
          <h1 className="restaurant-name">
            {settings?.theme?.restaurantName || 'DineFlow'}
          </h1>
          <button onClick={() => setShowLocation(true)} className="location-btn">
            <MapPin size={18} />
            <span>Location & Hours</span>
          </button>
        </div>
      </header>

      <div className="amenities-bar">
        <div className="container">
          {amenities.map(amenity => (
            <div key={amenity.id} className="amenity-item">
              {amenity.icon === 'wifi' && <Wifi size={16} />}
              {amenity.icon === 'card' && <CreditCard size={16} />}
              <span>{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="search-section">
        <div className="container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="categories-nav">
        <div className="container">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`category-chip ${!selectedCategory ? 'active' : ''}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="menu-content">
        <div className="container">
          {displayCategories.map(category => (
            <section key={category.id} className="category-section">
              <h2 className="category-title">{category.name}</h2>
              
              <div className="menu-grid">
                {category.menuItems?.map(item => {
                  const avgRating = item.reviews && item.reviews.length > 0
                    ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
                    : 0;

                  return (
                    <div
                      key={item.id}
                      className="menu-item-card"
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.image && (
                        <div className="item-image">
                          <img src={item.image} alt={item.name} />
                          {item.isFeatured && (
                            <span className="featured-badge">Featured</span>
                          )}
                        </div>
                      )}
                      
                      <div className="item-content">
                        <div className="item-header">
                          <h3 className="item-name">{item.name}</h3>
                          <span className="item-price">
                            {item.variants && item.variants.length > 0 
                              ? `$${item.variants[0].price}` 
                              : item.price 
                                ? `$${item.price}` 
                                : 'Price varies'}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                        
                        {avgRating > 0 && (
                          <div className="item-rating">
                            <Star size={14} className="star-icon" />
                            <span>{avgRating.toFixed(1)}</span>
                            <span className="review-count">({item.reviews?.length})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {showLocation && (
        <LocationModal onClose={() => setShowLocation(false)} />
      )}
    </div>
  );
};

export default GuestMenuPage;

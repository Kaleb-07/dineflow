import { useState } from 'react';
import { X, Star, Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types';
import ReviewFormModal from './ReviewFormModal';

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
}

const ItemDetailModal = ({ item, onClose }: ItemDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const avgRating = item.reviews && item.reviews.length > 0
    ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
    : 0;

  const currentPrice = selectedVariant
    ? item.variants?.find(v => v.id === selectedVariant)?.price || item.price
    : item.price;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>

          {item.image && (
            <div className="modal-image">
              <img src={item.image} alt={item.name} />
            </div>
          )}

          <div className="modal-body">
            <div className="modal-header">
              <h2 className="modal-title">{item.name}</h2>
              <span className="modal-price">${currentPrice}</span>
            </div>

            {item.description && (
              <p className="modal-description">{item.description}</p>
            )}

            {avgRating > 0 && (
              <div className="modal-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.round(avgRating) ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {avgRating.toFixed(1)} ({item.reviews?.length} reviews)
                </span>
              </div>
            )}

            {item.variants && item.variants.length > 0 && (
              <div className="variants-section">
                <h3 className="section-title">Options</h3>
                <div className="variants-grid">
                  {item.variants.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`variant-btn ${selectedVariant === variant.id ? 'active' : ''}`}
                    >
                      <span>{variant.name}</span>
                      <span>${variant.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="quantity-section">
              <h3 className="section-title">Quantity</h3>
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  <Minus size={18} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {item.reviews && item.reviews.length > 0 && (
              <div className="reviews-section">
                <div className="reviews-header">
                  <h3 className="section-title">Reviews</h3>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="add-review-btn"
                  >
                    Write a review
                  </button>
                </div>
                
                <div className="reviews-list">
                  {item.reviews.slice(0, 3).map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <span className="review-author">{review.user?.name}</span>
                        <div className="review-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < review.rating ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="add-to-order-btn">
                Add to Order - ${(currentPrice * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReviewForm && (
        <ReviewFormModal
          itemId={item.id}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </>
  );
};

export default ItemDetailModal;

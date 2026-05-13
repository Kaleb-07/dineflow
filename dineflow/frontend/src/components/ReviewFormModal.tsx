import { useState } from 'react';
import { X, Star } from 'lucide-react';
import api from '../lib/api';

interface ReviewFormModalProps {
  itemId: number;
  onClose: () => void;
}

const ReviewFormModal = ({ itemId, onClose }: ReviewFormModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/reviews', {
        rating,
        comment,
        menuItemId: itemId,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-body">
          <h2 className="modal-title">Write a Review</h2>

          <form onSubmit={handleSubmit} className="review-form">
            {error && (
              <div className="error-message">{error}</div>
            )}

            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="star-btn"
                  >
                    <Star
                      size={32}
                      className={
                        star <= (hoveredRating || rating)
                          ? 'star-filled'
                          : 'star-empty'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading || rating === 0}
              className="submit-review-btn"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewFormModal;

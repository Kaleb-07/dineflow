import { useEffect, useState } from 'react';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import api from '../lib/axios';
import type { Review } from '../types';

const TYPE_LABELS = { HOTEL: 'Hotel', FOOD: 'Food', SERVICE: 'Service' };
const TYPE_COLORS = {
  HOTEL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  FOOD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SERVICE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | Review['type']>('ALL');
  
  const load = async () => {
    const { data } = await api.get('/reviews');
    setReviews(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  
  const toggle = async (id: number, isVisible: boolean) => {
    await api.patch(`/reviews/${id}`, { isVisible: !isVisible });
    setReviews(r => r.map(x => x.id === id ? { ...x, isVisible: !isVisible } : x));
  };
  
  const remove = async (id: number) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}`);
    setReviews(r => r.filter(x => x.id !== id));
  };
  
  const filtered = filter === 'ALL' ? reviews : reviews.filter(r => r.type === filter);
  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '—';
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Reviews</h1>
          <p className="text-gray-400 text-sm mt-0.5">{reviews.length} total · avg {avg} ★</p>
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['ALL', 'HOTEL', 'FOOD', 'SERVICE'].map(f => (
          <button key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-amber-500 text-gray-900'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'ALL' ? 'All' : TYPE_LABELS[f as Review['type']]}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No reviews yet</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id}
              className={`bg-gray-900 border rounded-xl p-4 transition-opacity ${
                r.isVisible ? 'border-gray-800' : 'border-gray-800 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[r.type]}`}>
                      {TYPE_LABELS[r.type]}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={11}
                          className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">
                      {r.guestName || 'Anonymous'}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-gray-300 text-sm leading-relaxed">{r.comment}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => toggle(r.id, r.isVisible)}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors">
                    {r.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => remove(r.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Star, Eye, EyeOff, Trash2, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import api from '../lib/axios';
import type { Review } from '../types';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

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

  // Review Columns
  const reviewColumns: ColumnDef<Review>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className={`text-xs px-2 py-1 rounded-full border ${TYPE_COLORS[row.original.type]}`}>
          {TYPE_LABELS[row.original.type]}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Rating
          <ArrowUpDown size={14} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              size={13}
              className={s <= row.original.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}
            />
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'guestName',
      header: 'Guest',
      cell: ({ row }) => (
        <span className="text-sm text-gray-400">{row.original.guestName || 'Anonymous'}</span>
      ),
    },
    {
      accessorKey: 'comment',
      header: 'Comment',
      cell: ({ row }) => (
        <div className="max-w-md">
          {row.original.comment ? (
            <p className="text-sm text-gray-300 line-clamp-2">{row.original.comment}</p>
          ) : (
            <span className="text-xs text-gray-600 italic">No comment</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown size={14} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'isVisible',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`text-xs px-2 py-1 rounded-full ${
          row.original.isVisible
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-gray-700/50 text-gray-500 border border-gray-700'
        }`}>
          {row.original.isVisible ? 'Visible' : 'Hidden'}
        </span>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const review = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => toggle(review.id, review.isVisible)}>
                {review.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                {review.isVisible ? 'Hide review' : 'Show review'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-400"
                onClick={() => remove(review.id)}
              >
                <Trash2 size={14} /> Delete review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
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
          <Button
            key={f}
            onClick={() => setFilter(f as any)}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
          >
            {f === 'ALL' ? 'All' : TYPE_LABELS[f as Review['type']]}
          </Button>
        ))}
      </div>
      
      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading…</div>
      ) : (
        <DataTable
          columns={reviewColumns}
          data={filtered}
          searchKey="guestName"
          searchPlaceholder="Search by guest name..."
        />
      )}
    </div>
  );
}

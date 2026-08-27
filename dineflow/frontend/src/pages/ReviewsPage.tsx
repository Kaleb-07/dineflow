import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Star, Eye, EyeOff, Trash2, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import api from '../lib/axios';
import type { Review } from '../types';
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

const TYPE_LABELS = { HOTEL: 'Hotel', FOOD: 'Food', SERVICE: 'Service' };
const TYPE_COLORS = {
  HOTEL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  FOOD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SERVICE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function ReviewsPage() {
  const toast = useToast();
  const confirm = useConfirm();
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
    try {
      await api.patch(`/reviews/${id}`, { isVisible: !isVisible });
      setReviews(r => r.map(x => x.id === id ? { ...x, isVisible: !isVisible } : x));
      toast.success(
        isVisible ? 'Review hidden' : 'Review visible',
        isVisible ? 'Review is now hidden from the guest menu' : 'Review is now visible on the guest menu'
      );
    } catch {
      toast.error('Failed to update review status');
    }
  };
  
  const remove = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to permanently delete this review?',
      confirmLabel: 'Delete',
      isDestructive: true,
    });
    if (!confirmed) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(r => r.filter(x => x.id !== id));
      toast.deleted('Review');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const bulkDeleteReviews = async (selectedReviews: Review[]) => {
    const confirmed = await confirm({
      title: 'Delete Multiple Reviews',
      message: `Are you sure you want to delete the ${selectedReviews.length} selected review(s)?`,
      confirmLabel: 'Delete Selected',
      isDestructive: true,
    });
    if (!confirmed) return;
    const toastId = toast.loading(`Deleting ${selectedReviews.length} review(s)…`);
    try {
      await Promise.all(selectedReviews.map(review => api.delete(`/reviews/${review.id}`)));
      const deletedIds = new Set(selectedReviews.map(r => r.id));
      setReviews(p => p.filter(r => !deletedIds.has(r.id)));
      toast.dismiss(toastId);
      toast.success(`${selectedReviews.length} review(s) deleted`);
    } catch (err) {
      console.error("Bulk delete reviews failed", err);
      toast.dismiss(toastId);
      toast.error("Failed to delete some reviews");
      load();
    }
  };
  
  const filtered = filter === 'ALL' ? reviews : reviews.filter(r => r.type === filter);
  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  // Review the Columns
  const reviewColumns: ColumnDef<Review>[] = [
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
        <div className="flex gap-0.5 whitespace-nowrap">
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
        <span className="text-sm text-gray-400 whitespace-nowrap">{row.original.guestName || 'Anonymous'}</span>
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
        <span className="text-sm text-gray-500 whitespace-nowrap">
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
          </div>
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
      
      {/* Filter the tabs */}
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
          onDeleteSelected={bulkDeleteReviews}
        />
      )}
    </div>
  );
}

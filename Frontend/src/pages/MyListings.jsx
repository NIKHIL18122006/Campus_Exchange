import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyListings, updateListingStatus, deleteListing } from '../api/listings.js';
import { formatPrice, timeAgo } from '../lib/format.js';
import Button from '../components/Button.jsx';

export default function MyListings() {
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery({ queryKey: ['my-listings'], queryFn: getMyListings });

  function refresh(id) {
    queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    queryClient.invalidateQueries({ queryKey: ['listing', id] });
  }

  const statusMutation = useMutation({
    mutationFn: updateListingStatus,
    onSuccess: (_data, vars) => refresh(vars.id),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: (_data, id) => {
      refresh(id);
      queryClient.removeQueries({ queryKey: ['listing', id] });
    },
  });

  const busy = statusMutation.isPending || deleteMutation.isPending;
  const actionError = statusMutation.error || deleteMutation.error;

  function handleDelete(listing) {
    if (window.confirm(`Delete "${listing.title}"? This can't be undone.`)) {
      deleteMutation.mutate(listing.id);
    }
  }

  if (isPending) return <p className="text-muted">Loading…</p>;
  if (error) return <p role="alert" className="text-danger">{error.message}</p>;

  const { listings } = data;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">My listings</h1>
        <Link to="/sell" className="text-brand underline">Post an item</Link>
      </div>

      {actionError && (
        <p role="alert" className="mt-3 text-sm text-danger">{actionError.message}</p>
      )}

      {listings.length === 0 ? (
        <div className="mt-4 rounded border border-line bg-white p-6">
          <p className="font-semibold">You haven't posted anything yet.</p>
          <p className="mt-1 text-muted">Got a textbook or cycle you no longer use? List it in a minute.</p>
          <Link to="/sell" className="mt-3 inline-block text-brand underline">Post your first item</Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded border border-line bg-white">
          {listings.map((l) => {
            const sold = l.status === 'sold';
            return (
              <li key={l.id} className="flex gap-4 p-4">
                <Link to={`/listings/${l.id}`} className="shrink-0">
                  <img
                    src={l.cover_image}
                    alt=""
                    className={`h-20 w-20 rounded border border-line object-cover ${sold ? 'opacity-60' : ''}`}
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={`/listings/${l.id}`} className="line-clamp-1 font-semibold hover:underline">
                    {l.title}
                  </Link>
                  <p className="tabular-nums">{formatPrice(l.price)}</p>
                  <p className="text-sm text-muted">
                    {sold ? 'Sold' : 'Available'}, posted {timeAgo(l.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-start">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      statusMutation.mutate({ id: l.id, status: sold ? 'available' : 'sold' })
                    }
                  >
                    {sold ? 'Mark as available' : 'Mark as sold'}
                  </Button>
                  <button
                    onClick={() => handleDelete(l)}
                    disabled={busy}
                    className="px-1 py-1.5 text-sm text-danger underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
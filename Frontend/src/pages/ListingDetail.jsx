import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getListing } from '../api/listings.js';
import { categoryLabel, conditionLabel, formatPrice, timeAgo } from '../lib/format.js';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  const { data, isPending, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
  });

  // go back to the filtered list if we came from it, otherwise to the home page
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));

  if (isPending) return <p className="text-muted">Loading…</p>;

  if (error) {
    const missing = error.status === 404 || error.status === 400;
    return (
      <div>
        <p role="alert" className="text-danger">
          {missing ? "We couldn't find that listing." : error.message}
        </p>
        <Link to="/" className="mt-2 inline-block text-brand underline">Back to listings</Link>
      </div>
    );
  }

  const { listing } = data;

  return (
    <div>
      <button onClick={goBack} className="mb-4 text-sm text-brand underline">
        Back to listings
      </button>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 flex-1">
          <img
            src={listing.images[active]}
            alt={listing.title}
            className="aspect-[4/3] w-full rounded border border-line bg-white object-contain"
          />

          {listing.images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {listing.images.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`h-16 w-16 overflow-hidden rounded border-2 ${
                    i === active ? 'border-brand' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {listing.description && (
            <div className="mt-6">
              <h2 className="mb-1 font-semibold">Description</h2>
              <p className="max-w-prose whitespace-pre-line">{listing.description}</p>
            </div>
          )}
        </div>

        <aside className="w-full shrink-0 md:w-80">
          <div className="rounded border border-line bg-white p-5">
            {listing.status === 'sold' && (
              <p className="mb-3 rounded bg-page px-3 py-2 text-sm font-semibold">
                This item has been sold.
              </p>
            )}

            <p className="text-3xl font-semibold tabular-nums">{formatPrice(listing.price)}</p>
            {listing.negotiable && <p className="text-sm text-muted">Price is negotiable</p>}
            <h1 className="mt-2 text-xl">{listing.title}</h1>

            <dl className="mt-4 grid grid-cols-[6rem_1fr] gap-y-1.5 text-[15px]">
              <dt className="text-muted">Category</dt>
              <dd>{categoryLabel(listing.category)}</dd>
              <dt className="text-muted">Condition</dt>
              <dd>{conditionLabel(listing.condition)}</dd>
              <dt className="text-muted">Posted</dt>
              <dd>{timeAgo(listing.created_at)}</dd>
              <dt className="text-muted">Seller</dt>
              <dd>{listing.seller.name}</dd>
            </dl>

            {listing.isOwner && (
              <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
                This is your listing. You can manage it under{' '}
                <Link to="/my-listings" className="text-brand underline">My listings</Link>.
              </p>
            )}

            {/* Step 5: the "I'm interested" button for buyers goes here */}
          </div>
        </aside>
      </div>
    </div>
  );
}
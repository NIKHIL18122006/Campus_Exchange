import { Link } from 'react-router-dom';
import { formatPrice, conditionLabel, timeAgo } from '../lib/format.js';

export default function ListingCard({ listing }) {
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-md border border-line bg-white hover:border-ink/30"
    >
      <div className="relative">
        <img
          src={listing.cover_image}
          alt=""
          loading="lazy"
          className="aspect-square w-full bg-page object-cover"
        />
        <span className="absolute left-2 top-2 rounded bg-white px-2 py-0.5 text-xs font-semibold">
          {conditionLabel(listing.condition)}
        </span>
      </div>

      <div className="p-3">
        <p className="text-xl font-semibold tabular-nums">{formatPrice(listing.price)}</p>
        <h2 className="mt-0.5 line-clamp-2 text-[15px] leading-snug group-hover:underline">
          {listing.title}
        </h2>
        <div className="mt-2 flex justify-between text-sm text-muted">
          <span>{listing.negotiable ? 'Negotiable' : ''}</span>
          <span>{timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
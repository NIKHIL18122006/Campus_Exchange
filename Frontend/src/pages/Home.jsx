import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { browseListings } from '../api/listings.js';
import ListingCard from '../components/ListingCard.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import PriceFilter from '../components/PriceFilter.jsx';
import Container from '../components/Container.jsx';
import Button from '../components/Button.jsx';

const college = import.meta.env.VITE_COLLEGE_NAME;
const gridClass =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-6';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page')) || 1;

  const filters = {
    q: params.get('q') || '',
    category: params.get('category') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
  };
  const hasFilters = Object.values(filters).some(Boolean);

  const [search, setSearch] = useState(filters.q);
  useEffect(() => setSearch(filters.q), [filters.q]);

  const { data, isPending, error, isPlaceholderData } = useQuery({
    queryKey: ['listings', filters, page],
    queryFn: () => browseListings({ ...filters, page }),
    placeholderData: keepPreviousData,
  });

  // Merge changes into the URL; any filter change goes back to page 1
  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  }

  function goToPage(n) {
    update({ page: n > 1 ? String(n) : '' });
    window.scrollTo({ top: 0 });
  }

  function handleSearch(e) {
    e.preventDefault();
    update({ q: search.trim() });
  }

  const clearFilters = () => setParams({});

  return (
    <>
      {/* Header band: continues the navbar colour */}
      <section className="bg-brand pb-7 pt-2 sm:pb-9 sm:pt-3">
        <Container>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
            Buy and sell with students at {college}
          </h1>
          <p className="mt-1 max-w-2xl text-white/80">
            Textbooks, cycles, calculators and more, from people you can meet on campus.
          </p>

          <form onSubmit={handleSearch} className="mt-5 flex max-w-4xl gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search listings"
              placeholder="Search for a textbook, cycle, calculator…"
              className="min-w-0 flex-1 rounded bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-white/70"
            />
            <button
              type="submit"
              className="shrink-0 rounded bg-ink px-5 py-3 font-semibold text-white hover:bg-black sm:px-6"
            >
              Search
            </button>
          </form>
        </Container>
      </section>

      <Container className="py-6">
        <CategoryChips value={filters.category} onChange={(category) => update({ category })} />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-semibold">Latest listings</h2>
            {data && (
              <span className="text-sm text-muted">
                {data.total} {data.total === 1 ? 'item' : 'items'}
              </span>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-brand underline">
                Clear filters
              </button>
            )}
          </div>

          <PriceFilter
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onApply={update}
          />
        </div>

        <section className="mt-4">
          {isPending && (
            <div className={gridClass}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-md bg-line/60" />
              ))}
            </div>
          )}

          {error && <p role="alert" className="text-danger">{error.message}</p>}

          {data && data.listings.length === 0 && (
            <div className="rounded border border-line bg-white p-6">
              {hasFilters ? (
                <>
                  <p className="font-semibold">No items match these filters.</p>
                  <button onClick={clearFilters} className="mt-2 text-brand underline">
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold">Nothing has been posted yet.</p>
                  <Link to="/sell" className="mt-2 inline-block text-brand underline">
                    Post the first item
                  </Link>
                </>
              )}
            </div>
          )}

          {data && data.listings.length > 0 && (
            <>
              <div className={`${gridClass} ${isPlaceholderData ? 'opacity-60' : ''}`}>
                {data.listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <Button variant="secondary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page >= data.totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </Container>
    </>
  );
}
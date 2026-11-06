import { useEffect, useState } from 'react';
import Button from './Button.jsx';
import { CATEGORIES } from '../lib/format.js';

const digits = (value) => value.replace(/\D/g, '');

export default function Filters({ filters, hasFilters, onChange, onClear }) {
  const [price, setPrice] = useState({ min: filters.minPrice, max: filters.maxPrice });
  const [priceError, setPriceError] = useState('');

  // keep the inputs in step with the URL (for example after "Clear filters")
  useEffect(() => {
    setPrice({ min: filters.minPrice, max: filters.maxPrice });
    setPriceError('');
  }, [filters.minPrice, filters.maxPrice]);

  function applyPrice(e) {
    e.preventDefault();
    if (price.min && price.max && Number(price.min) > Number(price.max)) {
      setPriceError("Minimum can't be higher than maximum.");
      return;
    }
    setPriceError('');
    onChange({ minPrice: price.min, maxPrice: price.max });
  }

  const categoryClass = (active) =>
    `block w-full border-l-2 py-1 pl-3 text-left text-[15px] ${
      active ? 'border-brand font-semibold text-ink' : 'border-transparent text-muted hover:text-ink'
    }`;

  const priceInput =
    'w-full rounded border border-line bg-white px-2 py-1.5 text-[15px] outline-none focus:border-brand focus:ring-1 focus:ring-brand';

  return (
    <aside className="w-full shrink-0 md:w-52">
      <h2 className="mb-2 text-sm font-semibold">Category</h2>
      <ul>
        <li>
          <button onClick={() => onChange({ category: '' })} className={categoryClass(!filters.category)}>
            All categories
          </button>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c.value}>
            <button
              onClick={() => onChange({ category: c.value })}
              className={categoryClass(filters.category === c.value)}
            >
              {c.label}
            </button>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 mt-6 text-sm font-semibold">Price (₹)</h2>
      <form onSubmit={applyPrice}>
        <div className="flex items-center gap-2">
          <input
            aria-label="Minimum price" inputMode="numeric" placeholder="Min" className={priceInput}
            value={price.min} onChange={(e) => setPrice({ ...price, min: digits(e.target.value) })}
          />
          <span className="text-muted">to</span>
          <input
            aria-label="Maximum price" inputMode="numeric" placeholder="Max" className={priceInput}
            value={price.max} onChange={(e) => setPrice({ ...price, max: digits(e.target.value) })}
          />
        </div>
        {priceError && <p role="alert" className="mt-1 text-sm text-danger">{priceError}</p>}
        <Button type="submit" variant="secondary" className="mt-2 w-full">Apply</Button>
      </form>

      {hasFilters && (
        <button onClick={onClear} className="mt-6 text-sm text-brand underline">
          Clear all filters
        </button>
      )}
    </aside>
  );
}
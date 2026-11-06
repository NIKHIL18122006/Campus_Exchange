import { useEffect, useState } from 'react';
import Button from './Button.jsx';

const digits = (value) => value.replace(/\D/g, '');
const box =
  'w-24 rounded border border-line bg-white px-2 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand';

export default function PriceFilter({ minPrice, maxPrice, onApply }) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const [error, setError] = useState('');

  // follow the URL, for example after "Clear filters"
  useEffect(() => {
    setMin(minPrice);
    setMax(maxPrice);
    setError('');
  }, [minPrice, maxPrice]);

  function handleSubmit(e) {
    e.preventDefault();
    if (min && max && Number(min) > Number(max)) {
      setError("Minimum can't be higher than maximum.");
      return;
    }
    setError('');
    onApply({ minPrice: min, maxPrice: max });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted">Price ₹</span>
      <input
        aria-label="Minimum price" inputMode="numeric" placeholder="Min" className={box}
        value={min} onChange={(e) => setMin(digits(e.target.value))}
      />
      <span className="text-muted">to</span>
      <input
        aria-label="Maximum price" inputMode="numeric" placeholder="Max" className={box}
        value={max} onChange={(e) => setMax(digits(e.target.value))}
      />
      <Button type="submit" variant="secondary" size="sm">Apply</Button>
      {error && <p role="alert" className="w-full text-danger">{error}</p>}
    </form>
  );
}
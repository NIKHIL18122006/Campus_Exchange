import { CATEGORIES } from '../lib/format.js';

export default function CategoryChips({ value, onChange }) {
  const chip = (active) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-[15px] ${
      active ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-ink/40'
    }`;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <button onClick={() => onChange('')} aria-pressed={!value} className={chip(!value)}>
        All
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          aria-pressed={value === c.value}
          className={chip(value === c.value)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
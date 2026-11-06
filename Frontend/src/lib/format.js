export const CATEGORIES = [
  { value: 'books', label: 'Books' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'stationery', label: 'Stationery' },
  { value: 'cycles', label: 'Cycles' },
  { value: 'other', label: 'Other' },
];

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'used', label: 'Used' },
  { value: 'heavily_used', label: 'Heavily used' },
];

const labelOf = (list, value) => list.find((i) => i.value === value)?.label ?? value;
export const categoryLabel = (value) => labelOf(CATEGORIES, value);
export const conditionLabel = (value) => labelOf(CONDITIONS, value);

const priceFormat = new Intl.NumberFormat('en-IN');
export const formatPrice = (amount) => `₹${priceFormat.format(amount)}`;

export function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? 'yesterday' : `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
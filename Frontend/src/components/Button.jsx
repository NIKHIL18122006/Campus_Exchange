export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white hover:bg-brand-dark'
      : 'border border-line bg-white text-ink hover:bg-page';
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-[15px]';

  return (
    <button
      className={`rounded font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${sizes} ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
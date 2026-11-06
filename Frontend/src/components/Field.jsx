const inputClass =
  'w-full rounded border border-line bg-white px-3 py-2 text-[15px] outline-none focus:border-brand focus:ring-1 focus:ring-brand';

function Wrapper({ label, id, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export default function Field({ label, id, hint, className = '', ...props }) {
  return (
    <Wrapper label={label} id={id} hint={hint}>
      <input id={id} className={`${inputClass} ${className}`} {...props} />
    </Wrapper>
  );
}

export function Select({ label, id, hint, className = '', children, ...props }) {
  return (
    <Wrapper label={label} id={id} hint={hint}>
      <select id={id} className={`${inputClass} ${className}`} {...props}>{children}</select>
    </Wrapper>
  );
}

export function Textarea({ label, id, hint, className = '', ...props }) {
  return (
    <Wrapper label={label} id={id} hint={hint}>
      <textarea id={id} className={`${inputClass} ${className}`} {...props} />
    </Wrapper>
  );
}
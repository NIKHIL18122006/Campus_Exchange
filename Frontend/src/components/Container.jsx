export default function Container({ className = '', children }) {
  return (
    <div className={`mx-auto w-full max-w-[88rem] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
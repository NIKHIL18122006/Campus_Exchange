import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const navLink = ({ isActive }) =>
  `border-b-2 px-0.5 py-1 text-[15px] ${
    isActive ? 'border-white text-white' : 'border-transparent text-white/80 hover:text-white'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-brand">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="mr-2 text-lg font-semibold text-white">
          Campus Exchange
        </Link>

        {user ? (
          <>
            <NavLink to="/messages" className={navLink}>Messages</NavLink>
            <NavLink to="/my-listings" className={navLink}>My listings</NavLink>

            <div className="ml-auto flex items-center gap-4">
              <Link
                to="/sell"
                className="rounded bg-accent px-3.5 py-1.5 text-sm font-semibold text-ink hover:brightness-95"
              >
                Sell an item
              </Link>
              <span className="text-sm text-white/80">{user.name}</span>
              <button onClick={handleLogout} className="text-sm text-white/80 hover:text-white">
                Log out
              </button>
            </div>
          </>
        ) : (
          <div className="ml-auto flex items-center gap-4">
            <NavLink to="/login" className={navLink}>Log in</NavLink>
            <NavLink to="/signup" className={navLink}>Sign up</NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
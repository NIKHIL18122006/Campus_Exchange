import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { getUnreadCount } from '../api/conversations.js';

const navLink = ({ isActive }) =>
  `whitespace-nowrap border-b-2 px-0.5 py-1 text-[15px] ${
    isActive ? 'border-white text-white' : 'border-transparent text-white/80 hover:text-white'
  }`;

const menuLink = ({ isActive }) =>
  `block border-b border-white/15 py-3 text-[15px] ${
    isActive ? 'font-semibold text-white' : 'text-white/85'
  }`;

function UnreadBadge({ count }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 rounded-full bg-white px-1.5 py-0.5 text-xs font-semibold text-brand">
      {count}
    </span>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // kept fresh by LiveUpdates, which refetches this when a message arrives
  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount,
    enabled: Boolean(user),
  });
  const unread = unreadData?.count ?? 0;

  // close the menu whenever the page changes
  useEffect(() => setMenuOpen(false), [location.pathname]);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-brand">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:gap-6">
        <Link
          to="/"
          className="whitespace-nowrap text-lg font-semibold text-white md:mr-2 md:text-xl"
        >
          Campus Exchange
        </Link>

        {user ? (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              <NavLink to="/messages" className={navLink}>
                Messages
                <UnreadBadge count={unread} />
              </NavLink>
              <NavLink to="/my-listings" className={navLink}>My listings</NavLink>
            </nav>

            <div className="ml-auto flex items-center gap-3 md:gap-4">
              <Link
                to="/sell"
                className="whitespace-nowrap rounded bg-accent px-3 py-1.5 text-sm font-semibold text-ink hover:brightness-95 md:px-3.5"
              >
                <span className="md:hidden">Sell</span>
                <span className="hidden md:inline">Sell an item</span>
              </Link>

              <span className="hidden text-sm text-white/80 md:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="hidden whitespace-nowrap text-sm text-white/80 hover:text-white md:inline"
              >
                Log out
              </button>

              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="flex items-center whitespace-nowrap rounded border border-white/40 px-3 py-1.5 text-sm text-white md:hidden"
              >
                Menu
                <UnreadBadge count={unread} />
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

      {user && menuOpen && (
        <nav id="mobile-menu" className="border-t border-white/15 md:hidden">
          <div className="mx-auto max-w-6xl px-4 pb-2">
            <NavLink to="/messages" className={menuLink}>
              Messages
              <UnreadBadge count={unread} />
            </NavLink>
            <NavLink to="/my-listings" className={menuLink}>My listings</NavLink>
            <p className="pt-3 text-sm text-white/70">Signed in as {user.name}</p>
            <button onClick={handleLogout} className="py-3 text-[15px] text-white">
              Log out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
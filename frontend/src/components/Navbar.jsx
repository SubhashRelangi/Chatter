import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, MessageCircle, User, LogOut, Palette, Settings } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useUIStore } from '../store/useUIStore.js';
import { useChatStore } from '../store/useChatStore.js';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { selectedUser } = useChatStore();
  const [theme, setTheme] = useState('cupcake');
  const { openSidebar, closeSidebar } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  const hideNavbarPaths = ['/login', '/signup'];
  if (hideNavbarPaths.includes(location.pathname)) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-base-100 shadow-md flex items-center justify-between border-b border-base-300">
      {/* Left: Chat Logo */}
      <div className="flex items-center gap-2 sm:hidden">
        {selectedUser && (
          <button onClick={openSidebar} className="btn btn-ghost btn-circle" aria-label="Open contacts">
            <Menu className="size-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2 text-base-content hover:text-primary transition">
          <MessageCircle className="size-6" />
          <span className="font-semibold text-lg">Chatter</span>
        </Link>
      </div>
      <Link to="/" className="hidden sm:flex items-center gap-2 text-base-content hover:text-primary transition">
        <MessageCircle className="size-7" />
        <span className="font-semibold text-xl">Chatter</span>
      </Link>

      {/* Right: Icons */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Settings Dropdown (Mobile) */}
        <div className="dropdown dropdown-end sm:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <Settings className="size-5" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li className="menu-title"><span>Themes</span></li>
                <li><a onClick={() => setTheme('light')}>Light</a></li>
                <li><a onClick={() => setTheme('dark')}>Dark</a></li>
                <li><a onClick={() => setTheme('cupcake')}>Cupcake</a></li>
                <div className="divider"></div>
                <li><Link to="/profile">Profile</Link></li>
                <li><a onClick={handleLogout}>Logout</a></li>
            </ul>
        </div>

        {/* Themes Dropdown (Desktop) */}
        <div className="hidden sm:flex dropdown dropdown-end">
          <div tabIndex={0} role="button" className="flex items-center gap-2 border border-base-300 rounded-full px-3 py-2 hover:border-primary transition">
            <Palette className="size-5" />
            <span className="hidden md:inline text-sm">Themes</span>
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a onClick={() => setTheme('light')}>Light</a></li>
            <li><a onClick={() => setTheme('dark')}>Dark</a></li>
            <li><a onClick={() => setTheme('cupcake')}>Cupcake</a></li>
          </ul>
        </div>

        {/* Profile (Desktop) */}
        <Link
          to="/profile"
          className="hidden sm:flex items-center gap-2 border border-base-300 rounded-full px-3 py-2 hover:border-primary transition"
        >
          <User className="size-5" />
          <span className="hidden md:inline text-sm">Profile</span>
        </Link>

        {/* Logout (Desktop) */}
        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center gap-2 border border-base-300 rounded-full px-3 py-2 hover:border-error transition"
        >
          <LogOut className="size-5" />
          <span className="hidden md:inline text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Settings, User, Code2, Briefcase, GraduationCap,
  Award, Image, FileText, MessageSquare, Link2, Upload, BarChart2,
  Star, Layers, Menu, X, LogOut, ExternalLink,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/settings',     label: 'Settings',     icon: Settings },
  { to: '/profile',      label: 'Profile',      icon: User },
  { to: '/skills',       label: 'Skills',       icon: Code2 },
  { to: '/services',     label: 'Services',     icon: Briefcase },
  { to: '/projects',     label: 'Projects',     icon: Layers },
  { to: '/education',    label: 'Education',    icon: GraduationCap },
  { to: '/experience',   label: 'Experience',   icon: Briefcase },
  { to: '/certificates', label: 'Certificates', icon: Award },
  { to: '/gallery',      label: 'Gallery',      icon: Image },
  { to: '/blog',         label: 'Blog',         icon: FileText },
  { to: '/testimonials', label: 'Testimonials', icon: Star },
  { to: '/messages',     label: 'Messages',     icon: MessageSquare },
  { to: '/social-links', label: 'Social Links', icon: Link2 },
  { to: '/resume',       label: 'Resume',       icon: Upload },
  { to: '/analytics',   label: 'Analytics',    icon: BarChart2 },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <span className="text-xl font-bold text-primary">Admin Panel</span>
          <button className="lg:hidden text-muted" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-muted hover:bg-border hover:text-text'}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
          >
            <ExternalLink size={14} /> View Portfolio
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button className="lg:hidden text-muted" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {user?.avatar && (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            )}
            <span className="text-sm text-muted">{user?.name}</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Mountain, Sparkles, ClipboardList, Star, Mail, Ticket,
  Menu, X, ExternalLink, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import Seo from '../components/Seo';
import { clearAdminSession } from '../utils/adminAuth';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, description: 'Overview' },
  { name: 'Tours', href: '/admin/tours', icon: Compass, description: 'Tour packages' },
  { name: 'Treks', href: '/admin/treks', icon: Mountain, description: 'Adventure treks' },
  { name: 'Bookings', href: '/admin/bookings', icon: ClipboardList, description: 'Customer reservations' },
  { name: 'Custom Bookings', href: '/admin/custom-bookings', icon: Sparkles, description: 'Personalised packages' },
  { name: 'Enquiries', href: '/admin/enquiries', icon: Mail, description: 'Customer questions' },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Star, description: 'Reviews to approve' },
  { name: 'Extras', href: '/admin/extras', icon: Ticket, description: 'Coupons, blogs, history' },
];

const colors = { primary: '#1E9ABF', secondary: '#E66926', background: '#F8FAFC', text: '#1F2937', textLight: '#6B7280', border: '#E5E7EB' };

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile off-canvas menu
  const [collapsed, setCollapsed] = useState(false); // desktop icon-only sidebar
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const current = navigation.find((item) => location.pathname === item.href || location.pathname.startsWith(`${item.href}/`));
  const subPage = location.pathname.endsWith('/new') ? 'New' : location.pathname.includes('/edit/') ? 'Edit' : null;

  // Close menus on navigation, Escape, or a click outside the user menu
  useEffect(() => {
    setDrawerOpen(false);
    setUserMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setUserMenuOpen(false);
      }
    };
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const signOut = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  const renderNav = (isCollapsed) => (
    <ul className="space-y-1">
      {navigation.map(({ name, href, icon: Icon, description }) => (
        <li key={name}>
          <NavLink
            to={href}
            title={isCollapsed ? name : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
            style={({ isActive }) => (isActive ? { backgroundColor: colors.primary } : undefined)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="min-w-0">
                <span className="block leading-tight">{name}</span>
                <span className="block text-[11px] font-normal opacity-70 truncate">{description}</span>
              </span>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <Seo title="Admin" noindex />

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: colors.border }}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" style={{ color: colors.primary }} />
            </button>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:inline-flex p-2 -ml-2 rounded-lg hover:bg-gray-100"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5" style={{ color: colors.primary }} /> : <PanelLeftClose className="w-5 h-5" style={{ color: colors.primary }} />}
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: colors.primary }}>A</span>
              <span className="hidden sm:block min-w-0">
                <span className="block text-base font-bold leading-tight truncate" style={{ color: colors.primary }}>Aarohan Holidays</span>
                <span className="block text-xs" style={{ color: colors.textLight }}>Admin panel</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              <ExternalLink className="w-4 h-4" /> View website
            </a>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 p-1.5 pr-2 rounded-lg hover:bg-gray-100"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: colors.secondary }}>A</span>
                <span className="hidden md:block text-sm font-medium" style={{ color: colors.text }}>Admin</span>
                <ChevronDown className="w-4 h-4" style={{ color: colors.textLight }} />
              </button>
              {userMenuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50" style={{ borderColor: colors.border }}>
                  <a href="/" target="_blank" rel="noopener noreferrer" role="menuitem" className="sm:hidden flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                    <ExternalLink className="w-4 h-4" /> View website
                  </a>
                  <button onClick={signOut} role="menuitem" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <nav
          aria-label="Admin sections"
          className={`hidden lg:block bg-white border-r sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-shrink-0 transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-64'}`}
          style={{ borderColor: colors.border }}
        >
          <div className="p-3">{renderNav(collapsed)}</div>
        </nav>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Admin menu">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <nav className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderColor: colors.border }}>
                <span className="font-bold" style={{ color: colors.primary }}>Menu</span>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3">{renderNav(false)}</div>
            </nav>
          </div>
        )}

        {/* Page */}
        <main className="flex-1 min-w-0">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: colors.textLight }} aria-label="Breadcrumb">
              <Link to="/admin/dashboard" className="hover:underline">Admin</Link>
              <span>/</span>
              {current ? (
                <>
                  <Link to={current.href} className={subPage ? 'hover:underline' : 'font-medium'} style={subPage ? undefined : { color: colors.primary }}>{current.name}</Link>
                  {subPage && (
                    <>
                      <span>/</span>
                      <span className="font-medium" style={{ color: colors.primary }}>{subPage}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="font-medium" style={{ color: colors.primary }}>Page</span>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border min-h-[500px]" style={{ borderColor: colors.border }}>
              <Outlet />
            </div>

            <p className="mt-6 text-center text-xs" style={{ color: colors.textLight }}>
              © {new Date().getFullYear()} Aarohan Holidays · Admin panel
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

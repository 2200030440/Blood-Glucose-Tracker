import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getTodayString, formatDisplayDate } from '../utils/dateUtils.js';
import AddEditReadingModal from '../features/readings/AddEditReadingModal.jsx';
import Button from '../components/ui/Button.jsx';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  Heart,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const todayStr = getTodayString();
  const todayFormatted = formatDisplayDate(todayStr);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/readings', label: 'My Readings', icon: ClipboardList },
    { to: '/reports/daily', label: 'Daily Report', icon: CalendarDays },
    { to: '/reports/month-to-date', label: 'Month-to-Date', icon: CalendarRange },
    { to: '/reports/previous-month', label: 'Previous Month', icon: CalendarCheck },
    { to: '/profile', label: 'Profile & Account', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-surface-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-deep to-primary flex items-center justify-center text-white shadow-sm shadow-primary/30">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-content-primary tracking-tight">SWEETY</span>
            <span className="block text-[10px] text-content-secondary -mt-1 font-medium">Glucose Tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 rounded-xl bg-primary-light text-primary-deep hover:bg-lavender transition-colors"
            title="Log Reading"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-content-primary/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-border p-6 flex flex-col justify-between z-50 shadow-2xl"
            >
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-deep to-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
                    <Heart className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-content-primary tracking-tight">SWEETY</h2>
                    <p className="text-[11px] text-content-secondary font-medium">A healthier you starts here</p>
                  </div>
                </div>

                <nav className="space-y-1.5">
                  {navLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-sm shadow-primary/30'
                            : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary-deep font-bold flex items-center justify-center text-sm border border-primary/20">
                    {getInitials(user?.name)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-content-primary truncate">{user?.name}</p>
                    <p className="text-xs text-content-secondary truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-health-danger hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-white border-r border-border p-6 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Logo & Tagline */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-deep to-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h1 className="font-black text-2xl text-content-primary tracking-tight leading-none">SWEETY</h1>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Health SaaS</span>
              </div>
            </div>
            <p className="text-xs text-content-secondary italic font-normal pl-0.5">
              "A healthier you starts with understanding."
            </p>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile Card */}
        <div className="pt-6 border-t border-border">
          <div className="p-3 rounded-2xl bg-surface-subtle/70 border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary-deep font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                {getInitials(user?.name)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-content-primary truncate">{user?.name}</p>
                <p className="text-[11px] text-content-secondary truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-content-muted hover:text-health-danger hover:bg-rose-50 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-md border-b border-border sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
              Welcome back, <span className="text-primary-deep">{user?.name || 'Friend'}</span>!
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            </h2>
            <p className="text-xs text-content-secondary mt-0.5">{todayFormatted}</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              size="md"
              icon={Plus}
              className="shadow-sm shadow-primary/20"
            >
              Log Reading
            </Button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl hover:bg-surface-subtle border border-border/80 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-xl bg-lavender text-primary-deep font-bold flex items-center justify-center text-xs">
                  {getInitials(user?.name)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-content-secondary" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-border shadow-dropdown p-2 z-30"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-border/60 mb-1">
                      <p className="text-xs font-bold text-content-primary">{user?.name}</p>
                      <p className="text-[11px] text-content-secondary truncate">{user?.email}</p>
                    </div>
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-content-secondary hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Account Settings
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-health-danger hover:bg-rose-50 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openAddModal: () => setIsAddModalOpen(true) }} />
        </main>
      </div>

      {/* Global Add/Edit Reading Modal */}
      <AddEditReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // Trigger route refresh / custom event
          window.dispatchEvent(new CustomEvent('sweety:reading-created'));
        }}
      />
    </div>
  );
};

export default DashboardLayout;


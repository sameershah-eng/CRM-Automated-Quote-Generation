import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Globe, 
  PanelLeft, 
  Briefcase, 
  ShoppingBag, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { useAppStore } from '../data/useAppStore';

export const TopBar: React.FC = () => {
  const { 
    toggleSidebar, 
    searchQuery, 
    setSearchQuery, 
    language, 
    setLanguage, 
    activeModule, 
    setActiveModule,
    notifications,
    markNotificationsRead,
    showNotificationTray,
    setShowNotificationTray
  } = useAppStore();

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header 
      id="app-topbar"
      className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0"
    >
      {/* Left side: Toggle button + Stateless indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          id="btn-sidebar-toggle"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle sidebar"
          aria-label="Toggle sidebar navigation"
        >
          <PanelLeft className="w-4.5 h-4.5" />
        </button>

        {/* Stateless Mode Pill Badge matching screenshots */}
        <div 
          id="badge-stateless-mode"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-[12px] font-medium text-amber-900 shadow-2xs"
          title="Running in high-speed responsive browser state with API fallback"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>Stateless Mode: Active</span>
        </div>
      </div>

      {/* Center: Global Search Input */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Customers, bids, projects..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-blue-500 focus:outline-none text-[13px] text-slate-800 placeholder-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right side: User & Module Controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <span className="hidden lg:inline text-[13px] text-slate-500">
          Signed in as <span className="font-medium text-slate-700">guest@</span>
        </span>

        {/* Language selector */}
        <div className="relative">
          <button
            id="btn-lang-selector"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Switch language"
            aria-label="Switch interface language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language}</span>
          </button>

          {showLangDropdown && (
            <div 
              id="lang-dropdown-menu"
              className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-[13px]"
            >
              <button
                onClick={() => { setLanguage('EN'); setShowLangDropdown(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  language === 'EN' ? 'font-semibold text-blue-600' : 'text-slate-700'
                }`}
              >
                <span>🇺🇸 English</span>
                {language === 'EN' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setLanguage('DE'); setShowLangDropdown(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  language === 'DE' ? 'font-semibold text-blue-600' : 'text-slate-700'
                }`}
              >
                <span>🇩🇪 Deutsch</span>
                {language === 'DE' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="btn-notifications-bell"
            onClick={() => {
              setShowNotificationTray(!showNotificationTray);
              if (!showNotificationTray && unreadCount > 0) {
                markNotificationsRead();
              }
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotificationTray && (
            <div 
              id="notifications-tray"
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
            >
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[11px] text-slate-400">Marked as read</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <p className="text-[12px] font-medium text-slate-800 leading-snug">{n.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User initials circle matching screenshot */}
        <div className="flex items-center gap-1.5">
          <div 
            id="topbar-user-badge"
            className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-semibold shadow-xs"
            title="Mark (Sales Director)"
          >
            G
          </div>
          <span className="hidden sm:inline text-xs font-medium text-slate-700">guest</span>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Top-Right Module Switcher: Sales vs Purchasing matching screenshots */}
        <div 
          id="module-toggle-group"
          className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-[12px]"
        >
          <button
            id="btn-module-sales"
            onClick={() => setActiveModule('sales')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeModule === 'sales'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Sales</span>
          </button>
          <button
            id="btn-module-purchasing"
            onClick={() => setActiveModule('purchasing')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeModule === 'purchasing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Purchasing & supplier sourcing module"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Purchasing</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { 
  LayoutDashboard, 
  FileDiff, 
  Users, 
  FileText, 
  Briefcase, 
  BarChart3, 
  Settings,
  UserCheck
} from 'lucide-react';
import { useAppStore, NavTab } from '../data/useAppStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarOpen } = useAppStore();

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'revision-check', label: 'Revision check', icon: FileDiff },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'bids', label: 'Bids', icon: FileText },
    { id: 'deals', label: 'Deals', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!sidebarOpen) {
    return (
      <aside 
        id="app-sidebar-collapsed"
        aria-label="Application Navigation (Collapsed)"
        className="w-16 border-r border-slate-200 bg-white flex flex-col justify-between py-5 shrink-0 transition-all duration-200"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <div className="w-8 h-px bg-slate-200" />
          <nav className="flex flex-col items-center space-y-1 w-full px-2" aria-label="Quick links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-icon-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-slate-100 text-slate-900 font-semibold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center px-2">
          <div 
            id="sidebar-user-avatar-collapsed"
            className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-semibold"
            title="guest (guest@example.com)"
          >
            G
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      id="app-sidebar"
      aria-label="Application Navigation"
      className="w-60 border-r border-slate-200 bg-white flex flex-col justify-between py-4 shrink-0 transition-all duration-200"
    >
      <div>
        {/* Navigation Category Label matching screenshots */}
        <div className="px-5 pb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-0.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-slate-100/90 text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom user badge matching screenshot */}
      <div className="px-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
            g
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-800 truncate">guest</p>
            <p className="text-[11px] text-slate-400 truncate">guest@</p>
          </div>
          <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        </div>
      </div>
    </aside>
  );
};

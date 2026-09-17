import React from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/views/DashboardView';
import { RevisionCheckView } from './components/views/RevisionCheckView';
import { CustomersView } from './components/views/CustomersView';
import { BidsView } from './components/views/BidsView';
import { DealsView } from './components/views/DealsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { QuoteBuilderModal } from './components/QuoteBuilderModal';
import { useAppStore } from './data/useAppStore';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, activeModule, setActiveModule, setActiveTab } = useAppStore();

  const renderContent = () => {
    if (activeModule === 'purchasing') {
      return (
        <div id="purchasing-module-view" className="space-y-6">
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-xs text-center max-w-2xl mx-auto my-12">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Purchasing & Raw Material Sourcing
            </h2>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              Automated vendor RFQ dispatch, raw billet stock procurement, and supplier spend analytics. Sourcing operations link directly with active sales quotes.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveModule('sales');
                  setActiveTab('analytics');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Inspect Supplier Spend in Analytics
              </button>
              <button
                onClick={() => setActiveModule('sales')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Return to Sales CRM
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'revision-check':
        return <RevisionCheckView />;
      case 'customers':
        return <CustomersView />;
      case 'bids':
        return <BidsView />;
      case 'deals':
        return <DealsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* TopBar */}
      <TopBar />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Dynamic Content Body */}
        <main 
          id="main-content-scroll"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
        >
          {renderContent()}
        </main>
      </div>

      {/* Global Modals */}
      <QuoteBuilderModal />
    </div>
  );
};

export default App;

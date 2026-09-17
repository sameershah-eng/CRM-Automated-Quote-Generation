import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../../data/useAppStore';
import { CHURN_RISK_SIGNALS } from '../../data/initialData';

export const AnalyticsView: React.FC = () => {
  const { analyticsCustomers, updateAnalyticsCustomerDelta } = useAppStore();
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'revenue' | 'spend' | 'profit'>('revenue');
  const [drilldownCustomer, setDrilldownCustomer] = useState<string | null>(null);
  const [churnActionFeedback, setChurnActionFeedback] = useState<string | null>(null);

  const handleAction = (customerName: string, actionType: string) => {
    if (actionType === 'Fix') {
      setChurnActionFeedback(`Re-engagement campaign dispatched for ${customerName} (automated RFQ invitation & volume discount offer).`);
    } else if (actionType === 'Grow') {
      setChurnActionFeedback(`Tier 1 Expansion plan initiated for ${customerName} (+15% allocated capacity).`);
    } else {
      setDrilldownCustomer(customerName);
    }
    setTimeout(() => {
      setChurnActionFeedback(null);
    }, 4000);
  };

  return (
    <div id="analytics-view" className="space-y-6">
      {/* Header section matching screenshot */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Spend & Revenue Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Customer revenue, supplier spend and combined profit view — with drilldown.
        </p>

        {/* View Tabs matching screenshot */}
        <div className="mt-4 inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-medium">
          <button
            id="tab-customer-revenue"
            onClick={() => setActiveAnalyticsTab('revenue')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeAnalyticsTab === 'revenue'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer revenue</span>
          </button>
          <button
            id="tab-supplier-spend"
            onClick={() => setActiveAnalyticsTab('spend')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeAnalyticsTab === 'spend'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Supplier spend</span>
          </button>
          <button
            id="tab-profit-view"
            onClick={() => setActiveAnalyticsTab('profit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeAnalyticsTab === 'profit'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Profit view</span>
          </button>
        </div>
      </div>

      {/* Notification banner if action was triggered */}
      {churnActionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{churnActionFeedback}</span>
        </div>
      )}

      {/* 4 Stat Cards matching screenshot 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: REVENUE YTD */}
        <div 
          id="metric-revenue-ytd"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Revenue YTD
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              €312,000
            </span>
            <p className="text-xs font-semibold text-amber-700 mt-1">
              ↑ 8.4 % YoY
            </p>
          </div>
        </div>

        {/* Card 2: ACTIVE CUSTOMERS */}
        <div 
          id="metric-active-customers"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Customers
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              14
            </span>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              +2 new
            </p>
          </div>
        </div>

        {/* Card 3: AT-RISK REVENUE */}
        <div 
          id="metric-at-risk-revenue"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            At-risk Revenue
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">
              €74,000
            </span>
            <p className="text-xs font-semibold text-rose-600 mt-1">
              ↓ ≥ 2 quarters
            </p>
          </div>
        </div>

        {/* Card 4: TOP-3 CONCENTRATION */}
        <div 
          id="metric-top3-concentration"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Top-3 Concentration
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
              68 %
            </span>
            <p className="text-xs font-semibold text-amber-700 mt-1">
              ≥ 30% threshold
            </p>
          </div>
        </div>
      </div>

      {/* Main Two Columns matching screenshot 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Revenue per customer (7 cols on lg) */}
        <div 
          id="card-revenue-per-customer"
          className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Revenue per customer
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Revenue YTD</th>
                  <th className="py-3 px-4 text-center">Share</th>
                  <th className="py-3 px-6">12-month trend</th>
                  <th className="py-3 px-4">Δ YoY</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyticsCustomers.map((cust) => {
                  const isNegative = cust.deltaYoy < 0;

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Customer name */}
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {cust.customerName}
                      </td>

                      {/* Revenue YTD */}
                      <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                        €{cust.revenueYtd.toLocaleString()}
                      </td>

                      {/* Share Mini Bar */}
                      <td className="py-4 px-4 text-center">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                          <div 
                            className="h-full bg-slate-900 rounded-full"
                            style={{ width: `${cust.sharePercent * 2}%` }}
                          />
                        </div>
                      </td>

                      {/* 12-Month Sparkline Bars matching screenshot */}
                      <td className="py-4 px-6">
                        <div className="flex items-end gap-1 h-5">
                          {cust.trend.map((val, idx) => {
                            const heightPercent = Math.min(100, Math.max(20, (val / 18) * 100));
                            const isDown = cust.trendType === 'down';
                            return (
                              <div
                                key={idx}
                                className={`w-1 rounded-xs transition-all ${
                                  isDown ? 'bg-rose-500' : 'bg-amber-500'
                                }`}
                                style={{ height: `${heightPercent}%` }}
                              />
                            );
                          })}
                        </div>
                      </td>

                      {/* Delta YoY */}
                      <td className="py-4 px-4 font-semibold">
                        <span className={isNegative ? 'text-rose-600' : 'text-amber-700'}>
                          {isNegative ? `↓ ${Math.abs(cust.deltaYoy)} %` : `↑ ${cust.deltaYoy} %`}
                        </span>
                      </td>

                      {/* Action Button matching screenshot */}
                      <td className="py-4 px-6 text-right">
                        {cust.actionType === 'Fix' ? (
                          <button
                            onClick={() => handleAction(cust.customerName, 'Fix')}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Fix
                          </button>
                        ) : cust.actionType === 'Grow' ? (
                          <button
                            onClick={() => handleAction(cust.customerName, 'Grow')}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Grow
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(cust.customerName, 'Detail')}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Detail
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Churn risk signals & Revenue concentration (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Churn risk signals matching screenshot */}
          <div 
            id="card-churn-risk-signals"
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Churn risk signals
              </h2>
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {CHURN_RISK_SIGNALS.map((sig) => (
                <div 
                  key={sig.id}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        sig.actionType === 're-engage' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <span className="font-semibold text-slate-900 text-xs">{sig.customerName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sig.signal}</p>
                  </div>

                  <button
                    onClick={() => handleAction(sig.customerName, sig.actionType === 're-engage' ? 'Fix' : 'Grow')}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    {sig.actionText}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 mt-4 italic">
              Churn score = revenue trend + order frequency + avg. order size
            </p>
          </div>

          {/* Card: Revenue concentration matching screenshot */}
          <div 
            id="card-revenue-concentration"
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Revenue concentration
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                High
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {/* Top 1 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Top 1 (Kessler Metall)</span>
                  <span className="font-bold text-slate-900">29 %</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: '29%' }} />
                </div>
              </div>

              {/* Top 3 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Top 3 customers</span>
                  <span className="font-bold text-slate-900">68 %</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              {/* Others */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Others (3)</span>
                  <span className="font-bold text-slate-900">32 %</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: '32%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drilldown Modal */}
      {drilldownCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setDrilldownCustomer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900">
              {drilldownCustomer} Revenue Detail
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Historical machining orders, margin trajectory and quote win ratios.
            </p>
            <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Margin Target:</span>
                <span className="font-semibold text-slate-900">22.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quotes Won / Sent:</span>
                <span className="font-semibold text-slate-900">8 / 11 (72.7%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Avg. Payment Terms:</span>
                <span className="font-semibold text-slate-900">Net 30 Days</span>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDrilldownCustomer(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  FileText, 
  FileCheck2, 
  Trophy, 
  Timer, 
  Percent,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { useAppStore } from '../../data/useAppStore';

const MONTHLY_BIDS_DATA = [
  { month: 'May', value: 210000, display: '$210k' },
  { month: 'Jun', value: 285000, display: '$285k' },
  { month: 'Jul', value: 345000, display: '$345k' },
  { month: 'Aug', value: 310000, display: '$310k' },
  { month: 'Sep', value: 440000, display: '$440k' },
  { month: 'Oct', value: 505000, display: '$505k' },
];

export const DashboardView: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'30days' | 'quarter' | 'year'>('30days');
  const { setActiveTab, openQuoteModal, openNewCheckModal } = useAppStore();

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Header section with Welcome text and Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, Mark
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your operations control center · Last 30 days
          </p>
        </div>

        {/* Time filters matching screenshot */}
        <div 
          id="dashboard-time-filters"
          className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs font-medium self-start sm:self-auto"
        >
          <button
            id="filter-last-30-days"
            onClick={() => setTimeFilter('30days')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeFilter === '30days'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 days
          </button>
          <button
            id="filter-quarter"
            onClick={() => setTimeFilter('quarter')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeFilter === 'quarter'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quarter
          </button>
          <button
            id="filter-year"
            onClick={() => setTimeFilter('year')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeFilter === 'year'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Row of 4 Metric Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Margin saved */}
        <div 
          id="metric-card-margin-saved"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500">Margin saved</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              $13,700
            </span>
            <p className="text-xs font-medium text-amber-800 mt-1 flex items-center gap-1">
              <span>↑ +18% vs. last month</span>
            </p>
          </div>
        </div>

        {/* Card 2: Time saved */}
        <div 
          id="metric-card-time-saved"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500">Time saved</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              84h
            </span>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
              <span>↑ +12h vs. last month</span>
            </p>
          </div>
        </div>

        {/* Card 3: Open bids */}
        <div 
          id="metric-card-open-bids"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => setActiveTab('bids')}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500">Open bids</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              12
            </span>
            <span className="text-xs text-slate-400 font-normal">|</span>
            <span className="text-xs font-medium text-slate-500">$495,000</span>
          </div>
        </div>

        {/* Card 4: Revisions analyzed */}
        <div 
          id="metric-card-revisions-analyzed"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => setActiveTab('revision-check')}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500">Revisions analyzed</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileCheck2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              156
            </span>
            <p className="text-xs font-medium text-amber-800 mt-1 flex items-center gap-1">
              <span>↑ +24 this week</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Row matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bids in market chart (7 cols on lg) */}
        <div 
          id="card-bids-in-market"
          className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bids in market
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative value of sent bids (last 6 months)
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_BIDS_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity={0.95} />
                    <stop offset="60%" stopColor="#b45309" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                  domain={[0, 600000]}
                  ticks={[0, 150000, 300000, 450000, 600000]}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
                          <p className="font-semibold">{item.month} 2026</p>
                          <p className="text-amber-300 mt-0.5">${item.value.toLocaleString()} in market</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {MONTHLY_BIDS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#goldBarGradient)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Deals & conversion (5 cols on lg) */}
        <div 
          id="card-deals-conversion"
          className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Deals & conversion
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Performance overview, current quarter
                </p>
              </div>
              <button
                onClick={() => setActiveTab('deals')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Mini metric cards matching screenshot */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-6">
              {/* Mini Card 1: Won */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1 text-slate-600 text-[11px] font-medium">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span>Won</span>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-bold text-slate-900">38</span>
                  <span className="block text-[11px] text-slate-400 font-normal">jobs</span>
                </div>
              </div>

              {/* Mini Card 2: Avg. duration */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1 text-slate-600 text-[11px] font-medium">
                  <Timer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Avg. duration</span>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-bold text-slate-900">17</span>
                  <span className="block text-[11px] text-slate-400 font-normal">days to close</span>
                </div>
              </div>

              {/* Mini Card 3: Rate */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1 text-slate-600 text-[11px] font-medium">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rate</span>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-bold text-slate-900">24%</span>
                  <span className="block text-[11px] text-slate-400 font-normal">close rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar matching screenshot */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Quarterly goal: 50 deals</span>
              <span className="text-slate-900 font-bold">38/50</span>
            </div>
            {/* Progress bar rail */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 rounded-full transition-all duration-500"
                style={{ width: `${(38 / 50) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-right">
              76% completed · 12 deals remaining
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
            <button
              id="btn-quick-new-bid"
              onClick={() => openQuoteModal()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Quote</span>
            </button>
            <button
              id="btn-quick-revision-check"
              onClick={() => openNewCheckModal()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Compare RFQ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

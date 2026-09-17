import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowRight, 
  Copy, 
  GitFork, 
  Calculator, 
  CheckCircle, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../data/useAppStore';
import { BidItem } from '../../data/initialData';

export const BidsView: React.FC = () => {
  const { 
    bids, 
    openQuoteModal, 
    duplicateBid, 
    versionBid, 
    updateBidStatus 
  } = useAppStore();

  const [bidSearch, setBidSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredBids = bids.filter((b) => {
    const matchesSearch = 
      b.customerName.toLowerCase().includes(bidSearch.toLowerCase()) ||
      b.projectName.toLowerCase().includes(bidSearch.toLowerCase()) ||
      b.note.toLowerCase().includes(bidSearch.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && b.status === statusFilter;
  });

  return (
    <div id="bids-view" className="space-y-6">
      {/* Header section matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bids
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Full overview of every sent and open bid.
          </p>
        </div>

        {/* Search, Filter, and + New Bid Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-48 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="bid-search-input"
              type="text"
              value={bidSearch}
              onChange={(e) => setBidSearch(e.target.value)}
              placeholder="Search bid..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="relative">
            <button
              id="btn-bid-filter"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>

            {showFilterDropdown && (
              <div 
                id="bid-filter-dropdown"
                className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs"
              >
                <button
                  onClick={() => { setStatusFilter('all'); setShowFilterDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  All statuses
                </button>
                <button
                  onClick={() => { setStatusFilter('Sent'); setShowFilterDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  Sent
                </button>
                <button
                  onClick={() => { setStatusFilter('In negotiation'); setShowFilterDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  In negotiation
                </button>
                <button
                  onClick={() => { setStatusFilter('Follow-up needed'); setShowFilterDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  Follow-up needed
                </button>
                <button
                  onClick={() => { setStatusFilter('Accepted'); setShowFilterDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  Accepted
                </button>
              </div>
            )}
          </div>

          <button
            id="btn-new-bid"
            onClick={() => openQuoteModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New bid</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Open bids */}
        <div 
          id="metric-open-bids"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Open bids</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">9</span>
          </div>
        </div>

        {/* Card 2: Total volume */}
        <div 
          id="metric-total-volume"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Total volume</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              $2,605,200
            </span>
          </div>
        </div>

        {/* Card 3: Avg. turnaround */}
        <div 
          id="metric-avg-turnaround"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Avg. turnaround</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">13 d</span>
          </div>
        </div>

        {/* Card 4: Avg. bid value */}
        <div 
          id="metric-avg-bid-value"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Avg. bid value</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              $289,467
            </span>
          </div>
        </div>
      </div>

      {/* Main Table: All bids matching screenshot */}
      <div 
        id="card-all-bids"
        className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            All bids
          </h2>
          <button
            onClick={() => openQuoteModal(bids[0]?.id)}
            className="text-xs font-semibold text-slate-800 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Open drilldown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer / Project</th>
                <th className="py-3.5 px-6">Volume</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Open since</th>
                <th className="py-3.5 px-6">Note</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBids.map((bid) => {
                const isSent = bid.status === 'Sent';
                const isNegotiating = bid.status === 'In negotiation';
                const isFollowUp = bid.status === 'Follow-up needed';
                const isAccepted = bid.status === 'Accepted';

                return (
                  <tr 
                    key={bid.id} 
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    onClick={() => openQuoteModal(bid.id)}
                  >
                    {/* Customer / Project */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {bid.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{bid.projectName}</span>
                        {bid.version > 1 && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            v{bid.version}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-4 px-6 font-bold text-slate-900">
                      ${bid.volume.toLocaleString()}
                    </td>

                    {/* Status Badge matching screenshot */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isSent
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : isNegotiating
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                          : isFollowUp
                          ? 'bg-orange-50 text-orange-800 border border-orange-200/80'
                          : isAccepted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {bid.status}
                      </span>
                    </td>

                    {/* Open since (red highlight for 16 d as in screenshot) */}
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${
                        bid.openDays >= 14 ? 'text-rose-600 font-bold' : 'text-slate-600'
                      }`}>
                        {bid.openDays} d
                      </span>
                    </td>

                    {/* Note */}
                    <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                      {bid.note}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            versionBid(bid.id);
                          }}
                          className="p-1 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Create next version (v2)"
                        >
                          <GitFork className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateBid(bid.id);
                          }}
                          className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Duplicate bid"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuoteModal(bid.id);
                          }}
                          className="p-1 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                          title="Open Pricing Calculator & Line Items"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

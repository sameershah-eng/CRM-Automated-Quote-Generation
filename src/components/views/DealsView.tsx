import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Trophy, 
  Calendar, 
  Award,
  ArrowUpRight
} from 'lucide-react';
import { TOP_SALES_REPS, RECENTLY_WON_JOBS } from '../../data/initialData';

export const DealsView: React.FC = () => {
  return (
    <div id="deals-view" className="space-y-6">
      {/* Header section matching screenshot */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Deals
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Won jobs, margin trend, and conversion.
        </p>
      </div>

      {/* 4 Stat Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Deals (year) */}
        <div 
          id="metric-deals-year"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Deals (year)</span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">47</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Award className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 2: Order volume */}
        <div 
          id="metric-order-volume"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Order volume</span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                $2.84M
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 3: Win rate */}
        <div 
          id="metric-win-rate"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Win rate</span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                38%
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Trophy className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 4: Avg. days to close */}
        <div 
          id="metric-avg-days-to-close"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Avg. days to close</span>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                21 d
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Calendar className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Two columns: Quarterly target & Top sales reps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quarterly target (5 cols on lg) */}
        <div 
          id="card-quarterly-target"
          className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <h2 className="text-sm font-bold text-slate-900">
            Quarterly target
          </h2>

          <div className="mt-6 space-y-6">
            {/* Achieved metric */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Achieved</span>
                <span className="font-bold text-slate-900">$1.12M / $1.50M</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full" style={{ width: '75%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                75% of Q2 target reached
              </p>
            </div>

            {/* Avg. margin metric */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Avg. margin</span>
                <span className="font-bold text-slate-900">20.6%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full" style={{ width: '82%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Above industry avg. (17%)
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
            Target review cycle: end of fiscal quarter Q2.
          </div>
        </div>

        {/* Right Column: Top sales reps (7 cols on lg) */}
        <div 
          id="card-top-sales-reps"
          className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Top sales reps
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Employee</th>
                  <th className="py-3 px-6 text-center">Deals</th>
                  <th className="py-3 px-6">Volume</th>
                  <th className="py-3 px-6 text-right">Avg. margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TOP_SALES_REPS.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {rep.name}
                    </td>
                    <td className="py-3.5 px-6 text-center font-medium text-slate-700">
                      {rep.deals}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      ${rep.volume.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold text-slate-800">
                      {rep.avgMargin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recently won jobs matching screenshot 5 & 6 */}
      <div 
        id="card-recently-won-jobs"
        className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Recently won jobs
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer / Project</th>
                <th className="py-3.5 px-6">Volume</th>
                <th className="py-3.5 px-6">Margin</th>
                <th className="py-3.5 px-6">Source</th>
                <th className="py-3.5 px-6">Sales rep</th>
                <th className="py-3.5 px-6 text-right">Closed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENTLY_WON_JOBS.map((job) => {
                const isExisting = job.source === 'Existing';
                return (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{job.customerName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{job.projectName}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      ${job.volume.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {job.margin}%
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isExisting 
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/80' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {job.source}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {job.salesRep}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-500 font-mono text-[11px]">
                      {job.closedDate}
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

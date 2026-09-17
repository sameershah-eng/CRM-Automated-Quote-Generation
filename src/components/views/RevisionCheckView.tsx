import React, { useState } from 'react';
import { 
  FileCheck, 
  FileText, 
  Download, 
  Plus, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle,
  UploadCloud,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useAppStore } from '../../data/useAppStore';
import { RevisionCheck, RevisionItem } from '../../data/initialData';

export const RevisionCheckView: React.FC = () => {
  const { 
    revisions, 
    activeRevisionId, 
    setActiveRevisionId, 
    addRevisionCheck,
    isNewCheckModalOpen,
    openNewCheckModal,
    closeNewCheckModal
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline'>('side-by-side');
  const [isExporting, setIsExporting] = useState(false);

  // Active check
  const activeCheck = revisions.find(r => r.id === activeRevisionId) || revisions[0];

  // New check state
  const [checkTitle, setCheckTitle] = useState('Anfrage Zeichnung & LV Rev C');
  const [fileA, setFileA] = useState('Projektanfrage RFQ Rev B.pdf');
  const [fileB, setFileB] = useState('Projektanfrage RFQ Rev C.pdf');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStartCheck = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const newCheck: RevisionCheck = {
        id: `rev-${Date.now()}`,
        title: checkTitle || 'New Spec Comparison',
        fileA: fileA || 'Drawing_Rev_1.pdf',
        fileB: fileB || 'Drawing_Rev_2.pdf',
        date: new Date().toISOString().split('T')[0],
        riskLevel: 'Medium',
        itemsAdded: 2,
        itemsRemoved: 0,
        itemsChanged: 3,
        diffItems: [
          {
            id: `diff-${Date.now()}-1`,
            title: 'Hardness specification',
            category: 'material',
            status: 'Changed',
            revA: '45-48 HRC Case depth 0.8mm',
            revB: '58-62 HRC Vacuum through-hardened',
            risk: 'Medium',
            note: 'Through-hardening requires special heat-treatment partner.',
          },
          {
            id: `diff-${Date.now()}-2`,
            title: 'Threaded inserts',
            category: 'material',
            status: '+ Added',
            revA: '–',
            revB: '8x Helicoil Free-Running M6x1.5D stainless inserts',
            risk: 'Low',
            note: 'Standard installation tooling in stock.',
          },
          {
            id: `diff-${Date.now()}-3`,
            title: 'Delivery timeframe',
            category: 'delivery',
            status: 'Changed',
            revA: '6 weeks standard delivery',
            revB: '3 weeks expedited production slot',
            risk: 'High',
            note: 'Requires 1.35x overtime expedite multiplier.',
          }
        ]
      };
      addRevisionCheck(newCheck);
      setIsAnalyzing(false);
      closeNewCheckModal();
    }, 900);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 400);
  };

  return (
    <div id="revision-check-view" className="space-y-6">
      {/* Header section matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Revisions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            PDF comparison, diff analysis and risk assessment of your specifications.
          </p>
        </div>

        {/* Action buttons matching screenshot */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-export-pdf"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isExporting ? 'Preparing...' : 'Export as PDF'}</span>
          </button>
          <button
            id="btn-start-new-check"
            onClick={openNewCheckModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start a new check</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Active checks */}
        <div 
          id="metric-active-checks"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Active checks</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">8</span>
            <span className="text-xs font-medium text-slate-500">in progress</span>
          </div>
        </div>

        {/* Card 2: Analyzed this week */}
        <div 
          id="metric-analyzed-this-week"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Analyzed this week</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">24</span>
            <span className="text-xs font-medium text-slate-500">revisions</span>
          </div>
        </div>

        {/* Card 3: Items found */}
        <div 
          id="metric-items-found"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Δ Items found</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">1,412</span>
            <span className="text-xs font-medium text-slate-500">year to date</span>
          </div>
        </div>
      </div>

      {/* Main Card: Revision Comparison matching screenshot */}
      <div 
        id="card-revision-comparison"
        className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
      >
        {/* Comparison Header with title, subtitle, badges */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Revision comparison
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Side-by-side diff with clear change markings between Rev A and Rev B.
              </p>
            </div>

            {/* Badges row matching screenshot */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                + {activeCheck.itemsAdded} added
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                - {activeCheck.itemsRemoved} removed
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                {activeCheck.itemsChanged} changed
              </span>

              {/* File comparison badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                <span>{activeCheck.fileA}</span>
                <ArrowLeftRight className="w-3 h-3 text-slate-400" />
                <span>{activeCheck.fileB}</span>
              </span>

              {/* Risk badge matching screenshot */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                {activeCheck.riskLevel}
              </span>
            </div>
          </div>

          {/* Toggle buttons: Side-by-side vs Inline matching screenshot */}
          <div className="mt-5 flex items-center">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-medium">
              <button
                id="btn-view-side-by-side"
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Side-by-side
              </button>
              <button
                id="btn-view-inline"
                onClick={() => setViewMode('inline')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'inline'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Inline
              </button>
            </div>
          </div>
        </div>

        {/* Diff Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6 w-1/2">Revision A</th>
                <th className="py-3 px-6 w-1/2">Revision B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {activeCheck.diffItems.map((item) => {
                const isChanged = item.status === 'Changed';
                const isAdded = item.status === '+ Added';
                const isRemoved = item.status === '- Removed';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Column Revision A */}
                    <td className="py-4 px-6 align-top border-r border-slate-100">
                      <div className="font-sans mb-1.5 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          isAdded ? 'bg-emerald-500' : isRemoved ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                      </div>
                      <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                        isRemoved 
                          ? 'bg-rose-50 text-rose-900 border border-rose-100' 
                          : isChanged
                          ? 'bg-rose-50/60 text-slate-800 border border-rose-100/70'
                          : 'text-slate-500'
                      }`}>
                        {item.revA}
                      </div>
                    </td>

                    {/* Column Revision B */}
                    <td className="py-4 px-6 align-top">
                      <div className="font-sans mb-1.5 flex items-center justify-end">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isAdded
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isRemoved
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                        isAdded 
                          ? 'bg-emerald-50 text-emerald-950 border border-emerald-100 font-medium' 
                          : isChanged
                          ? 'bg-emerald-50/60 text-slate-900 border border-emerald-100/70 font-medium'
                          : 'text-slate-500'
                      }`}>
                        {item.revB}
                      </div>
                      {item.note && (
                        <p className="font-sans text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="font-semibold text-slate-700">Commercial impact: </span>
                          {item.note}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Check Modal */}
      {isNewCheckModalOpen && (
        <div 
          id="modal-new-check"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={closeNewCheckModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              Start New Specification Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload two revisions (PDF, STP, or Drawing Notes) for automatic diff and tolerance detection.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comparison Title / RFQ Ref
                </label>
                <input
                  type="text"
                  value={checkTitle}
                  onChange={(e) => setCheckTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Revision A (Baseline)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 cursor-pointer">
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="block text-[11px] font-medium text-slate-700 mt-1 truncate">
                      {fileA}
                    </span>
                    <span className="text-[10px] text-slate-400">Click or drop</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Revision B (Updated)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 cursor-pointer">
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="block text-[11px] font-medium text-slate-700 mt-1 truncate">
                      {fileB}
                    </span>
                    <span className="text-[10px] text-slate-400">Click or drop</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                <span className="font-semibold">AI Tolerance Extractor:</span> Automatically detects changes in ISO tolerances, materials, surface finishes, and liquidated damage penalty clauses.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={closeNewCheckModal}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCheck}
                disabled={isAnalyzing}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 cursor-pointer flex items-center gap-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing differences...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Run Diff Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Globe, 
  Ruler, 
  Percent, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import { useAppStore } from '../../data/useAppStore';

export const SettingsView: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    units, 
    setUnits, 
    settings, 
    updateSettings,
    machines,
    updateMachine,
    materials,
    updateMaterial
  } = useAppStore();

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
    }, 2500);
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-5xl">
      {/* Header section matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Company info, language, units, notifications, security and team.
          </p>
        </div>

        <button
          id="btn-save-settings"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          {savedFeedback ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Row 1: Language & Measurement Units (matching screenshot 8) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Card matching screenshot */}
        <div 
          id="card-settings-language"
          className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs"
        >
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Globe className="w-4 h-4 text-blue-700" />
            <span>Language</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Choose system display language and quote export terminology.
          </p>

          <div className="mt-5 space-y-3">
            <label 
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                language === 'DE' 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🇩🇪</span>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Deutsch</p>
                  <p className="text-[11px] text-slate-400">Standard für europäische Angebote (DIN/ISO)</p>
                </div>
              </div>
              <input
                type="radio"
                name="lang-radio"
                checked={language === 'DE'}
                onChange={() => setLanguage('DE')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
            </label>

            <label 
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                language === 'EN' 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🇺🇸</span>
                <div>
                  <p className="text-xs font-semibold text-slate-900">English (US)</p>
                  <p className="text-[11px] text-slate-400">North American export & aerospace standards</p>
                </div>
              </div>
              <input
                type="radio"
                name="lang-radio"
                checked={language === 'EN'}
                onChange={() => setLanguage('EN')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Measurement Units Card matching screenshot */}
        <div 
          id="card-settings-units"
          className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs"
        >
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Ruler className="w-4 h-4 text-blue-700" />
            <span>Measurement Units</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard tolerances, raw material stock density and dimensions.
          </p>

          <div className="mt-5 space-y-3">
            <label 
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                units === 'metric' 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-900">Metric (m, cm, mm)</p>
                <p className="text-[11px] text-slate-400">Dimensions in mm, density in g/cm³, stock in kg</p>
              </div>
              <input
                type="radio"
                name="units-radio"
                checked={units === 'metric'}
                onChange={() => setUnits('metric')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
            </label>

            <label 
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                units === 'imperial' 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-900">Imperial (ft, in)</p>
                <p className="text-[11px] text-slate-400">Dimensions in inches, density in lbs/in³, stock in lbs</p>
              </div>
              <input
                type="radio"
                name="units-radio"
                checked={units === 'imperial'}
                onChange={() => setUnits('imperial')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Row 2: Deterministic Pricing Engine Parameters */}
      <div 
        id="card-settings-pricing-params"
        className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs"
      >
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Percent className="w-4 h-4 text-blue-700" />
          <span>Shop Floor Overhead & Margin Defaults</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          These rates directly power the automated deterministic quote formula.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              General Overhead (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={settings.default_overhead_percent}
                onChange={(e) => updateSettings({ default_overhead_percent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Electricity, QA & facility</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Gross Margin (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={settings.default_margin_percent}
                onChange={(e) => updateSettings({ default_margin_percent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Standard production target</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Scrap Buffer (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                value={settings.default_scrap_percent}
                onChange={(e) => updateSettings({ default_scrap_percent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Chip-off and setup chips</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rush / Expedite Multiplier
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="3.0"
                value={settings.expedite_multiplier}
                onChange={(e) => updateSettings({ expedite_multiplier: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">x</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">&lt; 2 weeks expedited delivery</span>
          </div>
        </div>
      </div>

      {/* Row 3: Machine Hourly Rates */}
      <div 
        id="card-settings-machines"
        className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Cpu className="w-4 h-4 text-blue-700" />
              <span>Machine Fleet Hourly Rates</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cost per hour for setup and cutting cycle time across each work center.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {machines.map((mach) => (
            <div key={mach.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-900">{mach.name}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{mach.code}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-[11px] text-slate-500">Rate ($/hr):</label>
                <input
                  type="number"
                  value={mach.hourly_rate}
                  onChange={(e) => updateMachine(mach.id, { hourly_rate: Number(e.target.value) })}
                  className="w-20 px-2 py-1 text-xs rounded border border-slate-300 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Raw Material Stock Catalog */}
      <div 
        id="card-settings-materials"
        className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>Raw Material Stock Catalog</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live billet/sheet raw material pricing per kilogram and mass density.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="py-2 px-3">Grade / Material</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Density (g/cm³)</th>
                <th className="py-2 px-3">Unit Price ($/kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((mat) => (
                <tr key={mat.id}>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{mat.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{mat.category}</td>
                  <td className="py-2.5 px-3 font-mono">{mat.density_g_cm3}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      step="0.1"
                      value={mat.cost_per_kg}
                      onChange={(e) => updateMaterial(mat.id, { cost_per_kg: Number(e.target.value) })}
                      className="w-20 px-2 py-0.5 text-xs rounded border border-slate-300 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

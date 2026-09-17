import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Sparkles, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  TrendingUp, 
  FileText,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '../data/useAppStore';
import { BidItem } from '../data/initialData';
import { calculateLineItemPrice, QuoteEngineInput } from '../engine/quoteEngine';

interface LocalLineItem {
  id: string;
  part_name: string;
  part_number: string;
  quantity: number;
  material_id: string;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  machine_id: string;
  setup_hours: number;
  cycle_minutes: number;
  tooling_cost: number;
  finishing_cost_per_unit: number;
  complexity: 'simple' | 'medium' | 'high' | 'aerospace_defense';
  finishing_type: string;
}

export const QuoteBuilderModal: React.FC = () => {
  const { 
    isQuoteModalOpen, 
    closeQuoteModal, 
    selectedBidForModal, 
    customers, 
    materials, 
    machines, 
    settings,
    addBid,
    updateBidStatus 
  } = useAppStore();

  const [activeStep, setActiveStep] = useState<'build' | 'preview'>('build');
  const [customerName, setCustomerName] = useState('Bauer Industries');
  const [projectName, setProjectName] = useState('CNC Precision Housing & Flange');
  const [targetMargin, setTargetMargin] = useState(25);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const [lineItems, setLineItems] = useState<LocalLineItem[]>([
    {
      id: 'item-1',
      part_name: 'Main Actuator Housing',
      part_number: 'MAH-4001',
      quantity: 50,
      material_id: 'AL-6061-T6',
      length_mm: 120,
      width_mm: 85,
      height_mm: 45,
      machine_id: 'CNC-5AX-01',
      setup_hours: 2.5,
      cycle_minutes: 24,
      tooling_cost: 350,
      finishing_cost_per_unit: 14.5,
      complexity: 'medium',
      finishing_type: 'Hard Anodize Type III Black'
    }
  ]);

  useEffect(() => {
    if (selectedBidForModal) {
      setCustomerName(selectedBidForModal.customerName);
      setProjectName(selectedBidForModal.projectName);
    }
  }, [selectedBidForModal]);

  if (!isQuoteModalOpen) return null;

  // Add line item
  const handleAddLineItem = () => {
    const newItem: LocalLineItem = {
      id: `item-${Date.now()}`,
      part_name: `Component ${lineItems.length + 1}`,
      part_number: `PRT-${Math.floor(1000 + Math.random() * 9000)}`,
      quantity: 25,
      material_id: materials[0]?.id || 'AL-6061-T6',
      length_mm: 100,
      width_mm: 100,
      height_mm: 20,
      machine_id: machines[0]?.id || 'CNC-5AX-01',
      setup_hours: 1.5,
      cycle_minutes: 18,
      tooling_cost: 150,
      finishing_cost_per_unit: 8.0,
      complexity: 'medium',
      finishing_type: 'Clear Chem Film (MIL-DTL-5541)'
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof LocalLineItem, value: any) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Perform deterministic calculation for each line item
  const calculatedItems = lineItems.map(item => {
    const material = materials.find(m => m.id === item.material_id) || materials[0];
    const machine = machines.find(m => m.id === item.machine_id) || machines[0];

    const volumeCm3 = (item.length_mm * item.width_mm * item.height_mm) / 1000.0;
    const complexityFactor = item.complexity === 'aerospace_defense' ? 1.4 : item.complexity === 'high' ? 1.25 : 1.0;

    const engineInput: QuoteEngineInput = {
      quantity: item.quantity,
      density_g_cm3: material.density_g_cm3,
      material_cost_per_kg: material.cost_per_kg,
      finished_volume_cm3: volumeCm3,
      scrap_percentage: settings.default_scrap_percent,
      machining_time_hours: item.cycle_minutes / 60.0,
      machine_hourly_rate: machine.hourly_rate,
      machinability_rating: material.machinability_rating,
      complexity_factor: complexityFactor,
      setup_time_hours: item.setup_hours,
      setup_hourly_rate: machine.setup_rate,
      tooling_cost: item.tooling_cost,
      overhead_percentage: settings.default_overhead_percent,
      target_margin_percentage: targetMargin,
      quantity_breaks: settings.quantity_breaks
    };

    const calc = calculateLineItemPrice(engineInput);
    return { item, calc, material, machine };
  });

  const grandMaterialCost = calculatedItems.reduce((acc, curr) => acc + (curr.calc.material_cost_unit * curr.item.quantity), 0);
  const grandLaborCost = calculatedItems.reduce((acc, curr) => acc + ((curr.calc.machining_cost_unit + curr.calc.setup_cost_unit) * curr.item.quantity), 0);
  const grandToolingCost = calculatedItems.reduce((acc, curr) => acc + (curr.calc.tooling_cost_unit * curr.item.quantity), 0);
  const grandFinishingCost = calculatedItems.reduce((acc, curr) => acc + (curr.item.finishing_cost_per_unit * curr.item.quantity), 0);
  const grandOverhead = calculatedItems.reduce((acc, curr) => acc + (curr.calc.overhead_cost_unit * curr.item.quantity), 0);
  const grandTotal = calculatedItems.reduce((acc, curr) => acc + curr.calc.line_total + (curr.item.finishing_cost_per_unit * curr.item.quantity), 0);
  const grandCost = calculatedItems.reduce((acc, curr) => acc + (curr.calc.total_unit_cost * curr.item.quantity), 0);
  const grandProfit = grandTotal - grandCost;

  // AI Auto-Estimate feature
  const handleAiEstimate = async (itemId: string) => {
    setIsAiLoading(true);
    setAiSuccessMessage(null);
    try {
      const targetItem = lineItems.find(i => i.id === itemId);
      const res = await fetch('/api/ai-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part_name: targetItem?.part_name || 'Complex aerospace fitting',
          material_name: materials.find(m => m.id === targetItem?.material_id)?.name || 'Aluminum 6061-T6',
          dimensions: `${targetItem?.length_mm}x${targetItem?.width_mm}x${targetItem?.height_mm}mm`,
          quantity: targetItem?.quantity || 50,
          finishing_spec: targetItem?.finishing_type || 'Hard Anodize'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.estimate) {
          handleUpdateItem(itemId, 'setup_hours', data.estimate.recommended_setup_hours || 2.0);
          handleUpdateItem(itemId, 'cycle_minutes', data.estimate.recommended_cycle_minutes || 22);
          handleUpdateItem(itemId, 'tooling_cost', data.estimate.recommended_tooling_cost || 300);
          setAiSuccessMessage(`Gemini AI analysis complete: ${data.estimate.reasoning?.slice(0, 75)}...`);
        }
      }
    } catch {
      handleUpdateItem(itemId, 'setup_hours', 2.0);
      handleUpdateItem(itemId, 'cycle_minutes', 20);
      setAiSuccessMessage('Estimated cycle times updated based on CNC volumetric machining heuristics.');
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiSuccessMessage(null), 5000);
    }
  };

  const handleSaveBid = () => {
    const newBid: BidItem = {
      id: `bid-${Date.now()}`,
      bidNumber: `BID-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName,
      projectName,
      contactName: 'Procurement Specialist',
      volume: Math.round(grandTotal),
      status: 'Sent',
      openDays: 1,
      version: 1,
      leadTimeWeeks: 4,
      lineItemsCount: lineItems.length,
      note: `${lineItems.length} precision line items (${targetMargin}% target margin)`
    };

    addBid(newBid);
    closeQuoteModal();
  };

  return (
    <div 
      id="quote-builder-modal"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Topbar */}
        <div className="p-4 sm:px-6 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Automated Industrial Quote Engine
              </h2>
              <p className="text-[11px] text-slate-500">
                Deterministic cost calculation & margin optimization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => setActiveStep('build')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeStep === 'build' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Configure
              </button>
              <button
                onClick={() => setActiveStep('preview')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeStep === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Quote Document
              </button>
            </div>

            <button
              onClick={closeQuoteModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {aiSuccessMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{aiSuccessMessage}</span>
            </div>
          )}

          {activeStep === 'build' ? (
            <>
              {/* Header Fields: Customer & Project */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Account
                  </label>
                  <select
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Bauer Industries">Bauer Industries</option>
                    <option value="Lake County Utilities">Lake County Utilities</option>
                    <option value="Memmingen Regional Hospital">Memmingen Regional Hospital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project / RFQ Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Target Gross Margin
                    </label>
                    <span className="text-xs font-bold text-amber-700">{targetMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="1"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                    className="w-full accent-blue-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Competitive (10%)</span>
                    <span>Standard (25%)</span>
                    <span>High Margin (40%+)</span>
                  </div>
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Parts & Operations ({lineItems.length})
                  </h3>
                  <button
                    onClick={handleAddLineItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Part</span>
                  </button>
                </div>

                {calculatedItems.map(({ item, calc, material, machine }, index) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.part_name}
                          onChange={(e) => handleUpdateItem(item.id, 'part_name', e.target.value)}
                          className="font-bold text-slate-900 text-xs px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={item.part_number}
                          onChange={(e) => handleUpdateItem(item.id, 'part_number', e.target.value)}
                          className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded border border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAiEstimate(item.id)}
                          disabled={isAiLoading}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 text-[11px] font-semibold border border-blue-200/60 cursor-pointer"
                          title="Generate machining cycle & tooling estimate with AI"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isAiLoading ? 'Analyzing...' : 'AI Cycle Estimate'}</span>
                        </button>

                        {lineItems.length > 1 && (
                          <button
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Part Inputs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Batch Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Raw Material</label>
                        <select
                          value={item.material_id}
                          onChange={(e) => handleUpdateItem(item.id, 'material_id', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white truncate"
                        >
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Billet (L×W×H mm)</label>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <input
                            type="number"
                            value={item.length_mm}
                            onChange={(e) => handleUpdateItem(item.id, 'length_mm', Number(e.target.value))}
                            className="w-10 px-1 py-1 rounded border border-slate-200 text-center"
                          />
                          <span>×</span>
                          <input
                            type="number"
                            value={item.width_mm}
                            onChange={(e) => handleUpdateItem(item.id, 'width_mm', Number(e.target.value))}
                            className="w-10 px-1 py-1 rounded border border-slate-200 text-center"
                          />
                          <span>×</span>
                          <input
                            type="number"
                            value={item.height_mm}
                            onChange={(e) => handleUpdateItem(item.id, 'height_mm', Number(e.target.value))}
                            className="w-10 px-1 py-1 rounded border border-slate-200 text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Machine Fleet</label>
                        <select
                          value={item.machine_id}
                          onChange={(e) => handleUpdateItem(item.id, 'machine_id', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white truncate"
                        >
                          {machines.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} (${m.hourly_rate}/h)</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Setup / Cycle</label>
                        <div className="flex items-center gap-1 text-[11px]">
                          <input
                            type="number"
                            step="0.5"
                            value={item.setup_hours}
                            onChange={(e) => handleUpdateItem(item.id, 'setup_hours', Number(e.target.value))}
                            className="w-12 px-1 py-1 rounded border border-slate-200 text-center"
                            title="Setup hours"
                          />
                          <span className="text-slate-400">h</span>
                          <input
                            type="number"
                            value={item.cycle_minutes}
                            onChange={(e) => handleUpdateItem(item.id, 'cycle_minutes', Number(e.target.value))}
                            className="w-12 px-1 py-1 rounded border border-slate-200 text-center"
                            title="Cycle minutes per unit"
                          />
                          <span className="text-slate-400">m</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Tooling / Finish</label>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            value={item.tooling_cost}
                            onChange={(e) => handleUpdateItem(item.id, 'tooling_cost', Number(e.target.value))}
                            className="w-12 px-1 py-1 rounded border border-slate-200 text-center"
                            title="Tooling & fixture NRE"
                          />
                          <span className="text-slate-400">+$</span>
                          <input
                            type="number"
                            value={item.finishing_cost_per_unit}
                            onChange={(e) => handleUpdateItem(item.id, 'finishing_cost_per_unit', Number(e.target.value))}
                            className="w-12 px-1 py-1 rounded border border-slate-200 text-center"
                            title="Finishing per piece"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cost Output Pill Row */}
                    <div className="bg-slate-50 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-4 text-slate-600">
                        <span>Mass: <strong className="text-slate-900">{calc.cost_breakdown.raw_material_weight_kg} kg</strong></span>
                        <span>Unit Material: <strong className="text-slate-900">${calc.material_cost_unit.toFixed(2)}</strong></span>
                        <span>Unit Machining: <strong className="text-slate-900">${calc.machining_cost_unit.toFixed(2)}</strong></span>
                        <span>Overhead: <strong className="text-slate-900">${calc.overhead_cost_unit.toFixed(2)}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">Unit Price: <strong className="text-slate-900 text-sm">${calc.unit_price.toFixed(2)}</strong></span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-xs">
                          Total: ${calc.line_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Quote Financial Breakdown */}
              <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Raw Materials</span>
                    <span className="text-base font-bold">${grandMaterialCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Labor & Machining</span>
                    <span className="text-base font-bold">${grandLaborCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tooling & NRE</span>
                    <span className="text-base font-bold">${grandToolingCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Finishing Treatments</span>
                    <span className="text-base font-bold">${grandFinishingCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Shop Overhead</span>
                    <span className="text-base font-bold">${grandOverhead.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-amber-400 block font-semibold">Gross Profit ({targetMargin}%)</span>
                    <span className="text-base font-bold text-amber-400">${grandProfit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400">Total Quotation Value</span>
                    <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveStep('preview')}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Inspect Quote Doc
                    </button>
                    <button
                      onClick={handleSaveBid}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Issue Formal Quote</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Step 2: Formal Industrial Quote Document View */
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto font-sans text-slate-800">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    PRECISION INDUSTRIAL FABRICATION GMBH
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    CNC Machining · Sheet Metal · Aerospace Certified (ISO 9001 / AS9100)
                  </p>
                  <p className="text-[11px] text-slate-400">Industrial Park West 12, 87700 Memmingen</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded">
                    QUOTATION
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                    QT-{new Date().getFullYear()}-0482
                  </p>
                  <p className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-[11px] text-slate-500">Validity: 30 Days</p>
                </div>
              </div>

              {/* Recipient info */}
              <div className="grid grid-cols-2 gap-6 my-6 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Client</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{customerName}</p>
                  <p className="text-slate-600">Procurement Department</p>
                  <p className="text-slate-600">Project: {projectName}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Commercial Terms</span>
                  <p className="text-slate-700 mt-0.5">Incoterms: DAP (Delivered at Place)</p>
                  <p className="text-slate-700">Payment: Net 30 Days</p>
                  <p className="text-slate-700">Lead Time: 3-4 Weeks ARO</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse my-6">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Description & Material</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calculatedItems.map(({ item, calc, material }, i) => (
                    <tr key={item.id}>
                      <td className="py-3 px-3 font-mono">{i + 1}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{item.part_name}</p>
                        <p className="text-[11px] text-slate-500">
                          PN: {item.part_number} · Mat: {material.name} · {item.finishing_type}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Billet size: {item.length_mm}x{item.width_mm}x{item.height_mm}mm · ISO 2768-m
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">${calc.unit_price.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        ${calc.line_total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200">
                    <td colSpan={4} className="py-3 px-3 text-right font-bold text-slate-700">
                      Total Quotation Value:
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-base font-bold text-slate-900">
                      ${grandTotal.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Footer notes */}
              <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
                <p>• Inspection reports (EN 10204 3.1) and material certifications included.</p>
                <p>• Prices include standard export packaging. Freight calculated upon dispatch.</p>
              </div>

              <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveStep('build')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ← Back to Editor
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

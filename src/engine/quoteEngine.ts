/**
 * Industrial Manufacturing Deterministic Quote Calculation Engine
 * Pure, audited, rules-based mathematical pricing engine.
 * 
 * Flow:
 * material_cost + (machining_time * machine_rate * complexity)
 * + (setup_time / quantity * setup_rate) + (tooling_cost / quantity) + overhead
 * -> apply gross margin -> apply quantity break discount.
 */

import { CostBreakdown, QuantityBreak } from '../types/database';

export interface QuoteEngineInput {
  quantity: number;
  
  // Material parameters
  density_g_cm3: number;
  material_cost_per_kg: number;
  finished_volume_cm3?: number;
  raw_material_weight_kg?: number;
  scrap_percentage?: number; // e.g., 10 for 10%
  
  // Machining & Operation parameters
  machining_time_hours: number;
  machine_hourly_rate: number;
  machinability_rating?: number; // 1.0 baseline; <1 slower (Titanium), >1 faster (Brass)
  complexity_factor?: number;    // 1.0 - 2.5 multiplier for tight tolerance/geometry
  
  // Setup & Tooling
  setup_time_hours: number;
  setup_hourly_rate?: number;    // Defaults to machine_hourly_rate if omitted
  tooling_cost?: number;         // One-time dedicated fixturing/custom cutters
  
  // Financial parameters
  overhead_percentage: number;   // Shop overhead rate (e.g. 15%)
  target_margin_percentage: number; // Gross margin (e.g. 25%)
  pricing_model?: 'gross_margin' | 'markup'; // default 'gross_margin'
  
  // Tier breaks
  quantity_breaks?: QuantityBreak[];
}

export interface QuoteEngineResult {
  material_cost_unit: number;
  machining_cost_unit: number;
  setup_cost_unit: number;
  tooling_cost_unit: number;
  base_unit_cost: number;
  overhead_cost_unit: number;
  total_unit_cost: number;
  unadjusted_unit_price: number;
  quantity_discount_percent: number;
  unit_price: number;
  line_total: number;
  cost_breakdown: CostBreakdown;
}

const DEFAULT_QUANTITY_BREAKS: QuantityBreak[] = [
  { min_qty: 1, max_qty: 9, discount_percent: 0 },
  { min_qty: 10, max_qty: 49, discount_percent: 5 },
  { min_qty: 50, max_qty: 99, discount_percent: 10 },
  { min_qty: 100, max_qty: 499, discount_percent: 15 },
  { min_qty: 500, max_qty: 999999, discount_percent: 22 },
];

/**
 * Calculates deterministic pricing for a single industrial manufactured line item
 */
export function calculateLineItemPrice(input: QuoteEngineInput): QuoteEngineResult {
  const quantity = Math.max(1, Math.floor(input.quantity));
  const scrapPercent = input.scrap_percentage ?? 10.0;
  const complexityFactor = Math.max(0.5, input.complexity_factor ?? 1.0);
  const machinability = Math.max(0.1, input.machinability_rating ?? 1.0);
  const setupRate = input.setup_hourly_rate ?? input.machine_hourly_rate;
  const toolingCost = Math.max(0, input.tooling_cost ?? 0);
  const overheadPercent = Math.max(0, input.overhead_percentage);
  const targetMarginPercent = Math.min(95, Math.max(0, input.target_margin_percentage));
  const pricingModel = input.pricing_model ?? 'gross_margin';
  const quantityBreaks = input.quantity_breaks && input.quantity_breaks.length > 0
    ? input.quantity_breaks
    : DEFAULT_QUANTITY_BREAKS;

  // 1. RAW MATERIAL WEIGHT & COST
  let rawWeightKg = input.raw_material_weight_kg ?? 0;
  if (rawWeightKg <= 0 && input.finished_volume_cm3 && input.density_g_cm3) {
    // Weight (kg) = Volume (cm3) * Density (g/cm3) / 1000
    // Factor in standard rectangular billet stock vs finished envelope (+25% stock envelope before scrap)
    const finishedKg = (input.finished_volume_cm3 * input.density_g_cm3) / 1000.0;
    rawWeightKg = finishedKg * 1.25;
  }
  rawWeightKg = Number(rawWeightKg.toFixed(4));

  const baseMaterialCost = rawWeightKg * input.material_cost_per_kg;
  const scrapAllowanceCost = baseMaterialCost * (scrapPercent / 100.0);
  const materialCostUnit = Number((baseMaterialCost + scrapAllowanceCost).toFixed(2));

  // 2. MACHINING RUN TIME & COST
  // Machining time adjustment: if machinability rating < 1, machine feed/speed is adjusted
  // Effective machine rate considers complexity multiplier
  const effectiveMachineRate = input.machine_hourly_rate * complexityFactor;
  // If machinability is not 1.0, normalize standard run hours: hours / machinability
  const adjustedMachiningHours = input.machining_time_hours / (machinability > 0 ? machinability : 1.0);
  const machiningCostUnit = Number((adjustedMachiningHours * effectiveMachineRate).toFixed(2));

  // 3. SETUP AMORTIZATION
  const totalSetupCost = input.setup_time_hours * setupRate;
  const setupCostUnit = Number((totalSetupCost / quantity).toFixed(2));

  // 4. TOOLING AMORTIZATION
  const toolingCostUnit = Number((toolingCost / quantity).toFixed(2));

  // 5. BASE UNIT COST
  const baseUnitCost = Number(
    (materialCostUnit + machiningCostUnit + setupCostUnit + toolingCostUnit).toFixed(2)
  );

  // 6. SHOP OVERHEAD
  const overheadCostUnit = Number((baseUnitCost * (overheadPercent / 100.0)).toFixed(2));

  // 7. TOTAL UNIT COST
  const totalUnitCost = Number((baseUnitCost + overheadCostUnit).toFixed(2));

  // 8. TARGET MARGIN PRICING
  let unadjustedUnitPrice: number;
  let marginAmount: number;

  if (pricingModel === 'gross_margin') {
    // Price = Cost / (1 - Margin%)
    // e.g., $100 cost at 25% margin = $100 / 0.75 = $133.33
    const divisor = 1.0 - (targetMarginPercent / 100.0);
    unadjustedUnitPrice = divisor > 0.05 ? totalUnitCost / divisor : totalUnitCost * 1.5;
    marginAmount = unadjustedUnitPrice - totalUnitCost;
  } else {
    // Markup model: Price = Cost * (1 + Markup%)
    marginAmount = totalUnitCost * (targetMarginPercent / 100.0);
    unadjustedUnitPrice = totalUnitCost + marginAmount;
  }
  unadjustedUnitPrice = Number(unadjustedUnitPrice.toFixed(2));
  marginAmount = Number(marginAmount.toFixed(2));

  // 9. QUANTITY BREAK DISCOUNT
  let matchedTier: QuantityBreak | null = null;
  let discountPercent = 0;

  for (const tier of quantityBreaks) {
    if (quantity >= tier.min_qty && quantity <= tier.max_qty) {
      matchedTier = tier;
      discountPercent = tier.discount_percent;
      break;
    }
  }

  const discountAmount = Number((unadjustedUnitPrice * (discountPercent / 100.0)).toFixed(2));
  const finalUnitPrice = Number(Math.max(0.01, unadjustedUnitPrice - discountAmount).toFixed(2));
  const lineTotal = Number((finalUnitPrice * quantity).toFixed(2));

  const costBreakdown: CostBreakdown = {
    raw_material_weight_kg: rawWeightKg,
    raw_material_cost: Number(baseMaterialCost.toFixed(2)),
    scrap_allowance_cost: Number(scrapAllowanceCost.toFixed(2)),
    machining_time_hours: Number(input.machining_time_hours.toFixed(3)),
    effective_machine_rate: Number(effectiveMachineRate.toFixed(2)),
    machining_cost: machiningCostUnit,
    setup_time_hours: Number(input.setup_time_hours.toFixed(3)),
    setup_cost_amortized: setupCostUnit,
    tooling_cost_amortized: toolingCostUnit,
    base_unit_cost: baseUnitCost,
    overhead_percent: overheadPercent,
    overhead_cost: overheadCostUnit,
    total_unit_cost: totalUnitCost,
    target_margin_percent: targetMarginPercent,
    margin_amount: marginAmount,
    unadjusted_unit_price: unadjustedUnitPrice,
    quantity_break_applied: matchedTier,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    final_unit_price: finalUnitPrice,
    extended_total: lineTotal,
    audit_timestamp: new Date().toISOString(),
  };

  return {
    material_cost_unit: materialCostUnit,
    machining_cost_unit: machiningCostUnit,
    setup_cost_unit: setupCostUnit,
    tooling_cost_unit: toolingCostUnit,
    base_unit_cost: baseUnitCost,
    overhead_cost_unit: overheadCostUnit,
    total_unit_cost: totalUnitCost,
    unadjusted_unit_price: unadjustedUnitPrice,
    quantity_discount_percent: discountPercent,
    unit_price: finalUnitPrice,
    line_total: lineTotal,
    cost_breakdown: costBreakdown,
  };
}

/**
 * Calculates multi-item total and aggregate margin/cost metrics for an entire Quote
 */
export interface QuoteTotalsSummary {
  subtotal: number;
  total_material_cost: number;
  total_machining_cost: number;
  total_setup_cost: number;
  total_tooling_cost: number;
  total_overhead_cost: number;
  total_shop_cost: number;
  total_gross_profit: number;
  aggregate_margin_percent: number;
  item_count: number;
  total_quantity: number;
}

export function calculateQuoteTotals(lineResults: QuoteEngineResult[]): QuoteTotalsSummary {
  let subtotal = 0;
  let totalMaterial = 0;
  let totalMachining = 0;
  let totalSetup = 0;
  let totalTooling = 0;
  let totalOverhead = 0;
  let totalShopCost = 0;
  let totalQuantity = 0;

  for (const item of lineResults) {
    const qty = item.cost_breakdown.quantity_break_applied?.min_qty ?? 1; // quantity represented in breakdown
    subtotal += item.line_total;
    totalMaterial += item.material_cost_unit * (item.line_total / (item.unit_price || 1));
    totalMachining += item.machining_cost_unit * (item.line_total / (item.unit_price || 1));
    totalSetup += item.setup_cost_unit * (item.line_total / (item.unit_price || 1));
    totalTooling += item.tooling_cost_unit * (item.line_total / (item.unit_price || 1));
    totalOverhead += item.overhead_cost_unit * (item.line_total / (item.unit_price || 1));
    totalShopCost += item.total_unit_cost * (item.line_total / (item.unit_price || 1));
    totalQuantity += Math.round(item.line_total / (item.unit_price || 1));
  }

  const grossProfit = Math.max(0, subtotal - totalShopCost);
  const aggregateMargin = subtotal > 0 ? (grossProfit / subtotal) * 100 : 0;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    total_material_cost: Number(totalMaterial.toFixed(2)),
    total_machining_cost: Number(totalMachining.toFixed(2)),
    total_setup_cost: Number(totalSetup.toFixed(2)),
    total_tooling_cost: Number(totalTooling.toFixed(2)),
    total_overhead_cost: Number(totalOverhead.toFixed(2)),
    total_shop_cost: Number(totalShopCost.toFixed(2)),
    total_gross_profit: Number(grossProfit.toFixed(2)),
    aggregate_margin_percent: Number(aggregateMargin.toFixed(1)),
    item_count: lineResults.length,
    total_quantity: totalQuantity,
  };
}

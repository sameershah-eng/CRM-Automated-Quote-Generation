/**
 * Unit Tests for Industrial Manufacturing Quote Engine
 * Run with: `npm test` or `tsx src/engine/quoteEngine.test.ts`
 */

import { calculateLineItemPrice, calculateQuoteTotals, QuoteEngineInput } from './quoteEngine';

function assert(condition: boolean, testName: string, details?: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    throw new Error(`Test failed: ${testName}`);
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
}

function runTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING INDUSTRIAL QUOTE ENGINE TESTS');
  console.log('========================================\n');

  // TEST 1: Basic Aluminum CNC Milling - Single Part (Qty 1)
  {
    const input: QuoteEngineInput = {
      quantity: 1,
      density_g_cm3: 2.70, // AL 6061
      material_cost_per_kg: 8.00,
      raw_material_weight_kg: 2.0, // 2 kg billet
      scrap_percentage: 10,
      machining_time_hours: 1.5, // 90 mins
      machine_hourly_rate: 100.00,
      setup_time_hours: 2.0, // 2 hrs setup
      setup_hourly_rate: 80.00,
      tooling_cost: 200.00,
      complexity_factor: 1.0,
      overhead_percentage: 15.0,
      target_margin_percentage: 25.0,
    };

    const res = calculateLineItemPrice(input);

    // Expected values:
    // material = 2.0 * 8.00 * 1.10 = $17.60
    assert(res.material_cost_unit === 17.60, 'Test 1: Material cost includes 10% scrap allowance', `Got ${res.material_cost_unit}`);
    
    // machining = 1.5 * 100 * 1.0 = $150.00
    assert(res.machining_cost_unit === 150.00, 'Test 1: Machining cost calculation', `Got ${res.machining_cost_unit}`);
    
    // setup for qty 1 = (2.0 * 80) / 1 = $160.00
    assert(res.setup_cost_unit === 160.00, 'Test 1: Setup cost for qty 1 is full setup cost', `Got ${res.setup_cost_unit}`);
    
    // tooling for qty 1 = 200 / 1 = $200.00
    assert(res.tooling_cost_unit === 200.00, 'Test 1: Tooling cost for qty 1', `Got ${res.tooling_cost_unit}`);
    
    // base_unit_cost = 17.60 + 150 + 160 + 200 = $527.60
    assert(res.base_unit_cost === 527.60, 'Test 1: Base unit cost matches sum of material + machine + setup + tooling', `Got ${res.base_unit_cost}`);
    
    // overhead = 527.60 * 0.15 = $79.14
    assert(res.overhead_cost_unit === 79.14, 'Test 1: 15% shop overhead on base cost', `Got ${res.overhead_cost_unit}`);
    
    // total_unit_cost = 527.60 + 79.14 = $606.74
    assert(res.total_unit_cost === 606.74, 'Test 1: Total unit cost with overhead', `Got ${res.total_unit_cost}`);
    
    // unadjusted_unit_price = 606.74 / (1 - 0.25) = $808.99
    assert(res.unadjusted_unit_price === 808.99, 'Test 1: Gross margin (25%) price calculation', `Got ${res.unadjusted_unit_price}`);
    
    // Qty 1 has 0% discount
    assert(res.quantity_discount_percent === 0, 'Test 1: Qty 1 has 0% quantity discount');
    assert(res.unit_price === 808.99, 'Test 1: Final unit price matches unadjusted');
  }

  // TEST 2: Amortization & Quantity Break Discount (Qty 100)
  {
    const inputQty100: QuoteEngineInput = {
      quantity: 100,
      density_g_cm3: 2.70,
      material_cost_per_kg: 8.00,
      raw_material_weight_kg: 2.0,
      scrap_percentage: 10,
      machining_time_hours: 1.5,
      machine_hourly_rate: 100.00,
      setup_time_hours: 2.0,
      setup_hourly_rate: 80.00,
      tooling_cost: 200.00,
      complexity_factor: 1.0,
      overhead_percentage: 15.0,
      target_margin_percentage: 25.0,
    };

    const res100 = calculateLineItemPrice(inputQty100);

    // Setup amortized: 160 / 100 = $1.60
    assert(res100.setup_cost_unit === 1.60, 'Test 2: Setup cost amortized over 100 parts is $1.60', `Got ${res100.setup_cost_unit}`);
    
    // Tooling amortized: 200 / 100 = $2.00
    assert(res100.tooling_cost_unit === 2.00, 'Test 2: Tooling cost amortized over 100 parts is $2.00', `Got ${res100.tooling_cost_unit}`);
    
    // Base unit cost = 17.60 + 150 + 1.60 + 2.00 = 171.20
    assert(res100.base_unit_cost === 171.20, 'Test 2: Base unit cost dramatic drop due to batch amortization', `Got ${res100.base_unit_cost}`);

    // Quantity break discount for 100 pcs = 15%
    assert(res100.quantity_discount_percent === 15, 'Test 2: Tier discount for 100 pcs is 15%');
    
    // Price should be significantly lower per unit than qty 1
    assert(res100.unit_price < 250, 'Test 2: Economies of scale reflect in unit price', `Unit price: $${res100.unit_price}`);
  }

  // TEST 3: High-Complexity Titanium Aerospace Part with Machinability Factor
  {
    const tiInput: QuoteEngineInput = {
      quantity: 25,
      density_g_cm3: 4.43, // Ti-6Al-4V
      material_cost_per_kg: 65.00,
      raw_material_weight_kg: 1.5,
      scrap_percentage: 15,
      machining_time_hours: 2.0,
      machine_hourly_rate: 160.00,
      machinability_rating: 0.40, // 40% speed of standard aluminum
      complexity_factor: 1.30,   // Tight +/- 0.005mm tolerances
      setup_time_hours: 4.0,
      setup_hourly_rate: 120.00,
      tooling_cost: 500.00,
      overhead_percentage: 20.0,
      target_margin_percentage: 30.0,
    };

    const tiRes = calculateLineItemPrice(tiInput);

    assert(tiRes.cost_breakdown.raw_material_cost === 97.50, 'Test 3: Ti raw material cost', `Got ${tiRes.cost_breakdown.raw_material_cost}`);
    assert(tiRes.cost_breakdown.scrap_allowance_cost === 14.63, 'Test 3: Ti scrap allowance cost 15%', `Got ${tiRes.cost_breakdown.scrap_allowance_cost}`);
    // adjusted machining hours = 2.0 / 0.4 = 5.0 hours
    // effective machine rate = 160 * 1.3 = 208
    // machining cost = 5.0 * 208 = 1040.00
    assert(tiRes.machining_cost_unit === 1040.00, 'Test 3: Machining cost includes machinability & complexity scaling', `Got ${tiRes.machining_cost_unit}`);
    assert(tiRes.unit_price > 0 && tiRes.line_total > 0, 'Test 3: Successfully produced full quote breakdown');
  }

  // TEST 4: Multi-item Quote Aggregation
  {
    const item1 = calculateLineItemPrice({
      quantity: 10,
      density_g_cm3: 2.7,
      material_cost_per_kg: 10,
      raw_material_weight_kg: 1.0,
      machining_time_hours: 0.5,
      machine_hourly_rate: 90,
      setup_time_hours: 1.0,
      overhead_percentage: 15,
      target_margin_percentage: 20,
    });

    const item2 = calculateLineItemPrice({
      quantity: 50,
      density_g_cm3: 7.85,
      material_cost_per_kg: 6,
      raw_material_weight_kg: 3.0,
      machining_time_hours: 1.0,
      machine_hourly_rate: 110,
      setup_time_hours: 2.0,
      overhead_percentage: 15,
      target_margin_percentage: 25,
    });

    const totals = calculateQuoteTotals([item1, item2]);
    assert(totals.item_count === 2, 'Test 4: Total item count is 2');
    assert(totals.subtotal > 0, 'Test 4: Total subtotal calculated');
    assert(totals.total_gross_profit > 0, 'Test 4: Aggregate gross profit calculated');
    assert(totals.aggregate_margin_percent > 0, 'Test 4: Aggregate margin calculated');
  }

  console.log('\n========================================');
  console.log('🎉 ALL 4 TEST SUITES PASSED FLAWLESSLY!');
  console.log('========================================\n');
}

runTests();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { calculateLineItemPrice, calculateQuoteTotals, QuoteEngineInput } from './src/engine/quoteEngine';
import { 
  Customer, Contact, Lead, Quote, QuoteLineItem, 
  Material, Machine, Part, PricingSettings, User, LeadStatus, QuoteStatus 
} from './src/types/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// =========================================================================
// IN-MEMORY SEEDED DATABASE REPOSITORY (Industrial Manufacturing)
// =========================================================================

let usersDb: User[] = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'marcus.vance@aeromachining.com', full_name: 'Marcus Vance', role: 'Sales Manager', phone: '+1 (555) 234-5678', created_at: '2026-01-01T00:00:00Z' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'elena.rostova@aeromachining.com', full_name: 'Elena Rostova', role: 'Sales Rep', phone: '+1 (555) 345-6789', created_at: '2026-01-01T00:00:00Z' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'dave.miller@aeromachining.com', full_name: 'Dave Miller', role: 'Estimator', phone: '+1 (555) 456-7890', created_at: '2026-01-01T00:00:00Z' },
  { id: '44444444-4444-4444-4444-444444444444', email: 'admin@aeromachining.com', full_name: 'Sarah Jenkins', role: 'Admin', phone: '+1 (555) 567-8901', created_at: '2026-01-01T00:00:00Z' },
];

let settingsDb: PricingSettings = {
  id: '99999999-9999-9999-9999-999999999999',
  shop_name: 'Precision AeroMachining Inc.',
  default_overhead_percent: 15.00,
  default_margin_percent: 25.00,
  default_scrap_percent: 10.00,
  expedite_multiplier: 1.35,
  quantity_breaks: [
    { min_qty: 1, max_qty: 9, discount_percent: 0 },
    { min_qty: 10, max_qty: 49, discount_percent: 5 },
    { min_qty: 50, max_qty: 99, discount_percent: 10 },
    { min_qty: 100, max_qty: 499, discount_percent: 15 },
    { min_qty: 500, max_qty: 999999, discount_percent: 22 },
  ],
  updated_at: new Date().toISOString(),
};

let materialsDb: Material[] = [
  { id: 'a0000001-0000-0000-0000-000000000001', code: 'AL-6061-T6', name: 'Aluminum 6061-T6 (Aerospace Grade)', category: 'Aluminum', density_g_cm3: 2.70, cost_per_kg: 7.80, machinability_rating: 1.00, stock_status: 'In Stock', scrap_credit_per_kg: 1.50, created_at: '2026-01-01T00:00:00Z' },
  { id: 'a0000002-0000-0000-0000-000000000002', code: 'AL-7075-T651', name: 'Aluminum 7075-T651 (High-Strength Aircraft)', category: 'Aluminum', density_g_cm3: 2.81, cost_per_kg: 14.20, machinability_rating: 0.85, stock_status: 'In Stock', scrap_credit_per_kg: 1.80, created_at: '2026-01-01T00:00:00Z' },
  { id: 'a0000003-0000-0000-0000-000000000003', code: 'SS-316L', name: 'Stainless Steel 316L (Medical / Marine)', category: 'Stainless Steel', density_g_cm3: 8.00, cost_per_kg: 12.50, machinability_rating: 0.55, stock_status: 'In Stock', scrap_credit_per_kg: 2.10, created_at: '2026-01-01T00:00:00Z' },
  { id: 'a0000004-0000-0000-0000-000000000004', code: 'SS-17-4PH', name: 'Stainless 17-4 PH Condition H1025', category: 'Stainless Steel', density_g_cm3: 7.80, cost_per_kg: 18.00, machinability_rating: 0.50, stock_status: 'Available on Order', scrap_credit_per_kg: 2.20, created_at: '2026-01-01T00:00:00Z' },
  { id: 'a0000005-0000-0000-0000-000000000005', code: 'TI-6AL-4V', name: 'Titanium Grade 5 (Ti-6Al-4V)', category: 'Titanium', density_g_cm3: 4.43, cost_per_kg: 62.00, machinability_rating: 0.35, stock_status: 'Available on Order', scrap_credit_per_kg: 8.50, created_at: '2026-01-01T00:00:00Z' },
  { id: 'a0000006-0000-0000-0000-000000000006', code: 'STEEL-4140', name: 'Alloy Steel 4140 (Pre-hardened QT)', category: 'Alloy Steel', density_g_cm3: 7.85, cost_per_kg: 6.20, machinability_rating: 0.70, stock_status: 'In Stock', scrap_credit_per_kg: 0.80, created_at: '2026-01-01T00:00:00Z' },
  { id: 'a0000007-0000-0000-0000-000000000007', code: 'BRASS-C360', name: 'Free-Cutting Brass C36000', category: 'Brass & Bronze', density_g_cm3: 8.50, cost_per_kg: 11.00, machinability_rating: 1.80, stock_status: 'In Stock', scrap_credit_per_kg: 3.50, created_at: '2026-01-01T00:00:00Z' },
  { id: 'a0000008-0000-0000-0000-000000000008', code: 'PLASTIC-PEEK', name: 'Virgin PEEK (Polyetheretherketone)', category: 'Engineering Plastic', density_g_cm3: 1.32, cost_per_kg: 115.00, machinability_rating: 1.10, stock_status: 'Lead Time 2 Weeks', scrap_credit_per_kg: 0.00, created_at: '2026-01-01T00:00:00Z' },
];

let machinesDb: Machine[] = [
  { id: 'b0000001-0000-0000-0000-000000000001', code: 'CNC-5AX-01', name: 'Hermle C42U 5-Axis Machining Center', type: '5-Axis CNC Mill', hourly_rate: 165.00, setup_rate: 120.00, max_part_dimensions: '800 x 800 x 550 mm', tolerance_rating: '+/- 0.003 mm', status: 'Operational', created_at: '2026-01-01T00:00:00Z' },
  { id: 'b0000002-0000-0000-0000-000000000002', code: 'CNC-3AX-01', name: 'Haas VF-4SS Super Speed Vertical Mill', type: '3-Axis CNC Mill', hourly_rate: 95.00, setup_rate: 75.00, max_part_dimensions: '1270 x 660 x 635 mm', tolerance_rating: '+/- 0.010 mm', status: 'Operational', created_at: '2026-01-01T00:00:00Z' },
  { id: 'b0000003-0000-0000-0000-000000000003', code: 'LATHE-LIVE-01', name: 'Mazak Integrex i-200H Multi-Tasking Lathe', type: 'CNC Lathe with Live Tooling', hourly_rate: 135.00, setup_rate: 95.00, max_part_dimensions: 'Dia 658 x 1011 mm', tolerance_rating: '+/- 0.005 mm', status: 'Operational', created_at: '2026-01-01T00:00:00Z' },
  { id: 'b0000004-0000-0000-0000-000000000004', code: 'EDM-WIRE-01', name: 'Mitsubishi MV2400-S Wire EDM', type: 'Wire EDM', hourly_rate: 110.00, setup_rate: 85.00, max_part_dimensions: '600 x 400 x 310 mm', tolerance_rating: '+/- 0.002 mm', status: 'Operational', created_at: '2026-01-01T00:00:00Z' },
  { id: 'b0000005-0000-0000-0000-000000000005', code: 'LASER-FIBER-01', name: 'Amada Ensis 3015AJ 6kW Fiber Laser', type: 'Fiber Laser Cutter', hourly_rate: 140.00, setup_rate: 60.00, max_part_dimensions: '3000 x 1500 mm Plate', tolerance_rating: '+/- 0.050 mm', status: 'Operational', created_at: '2026-01-01T00:00:00Z' },
];

let customersDb: Customer[] = [
  { id: 'c0000001-0000-0000-0000-000000000001', company_name: 'Apex Aerodynamics LLC', industry: 'Aerospace & Defense', tier: 'Tier 1', tax_id: 'US-94-2819201', website: 'https://apexaero-mfg.com', phone: '+1 (206) 555-0142', billing_address: '8200 Boeing Access Rd, Seattle, WA 98108', shipping_address: '8200 Boeing Access Rd, Dock 4, Seattle, WA 98108', payment_terms: 'Net 45', credit_limit: 150000.00, status: 'Active', created_by: '11111111-1111-1111-1111-111111111111', created_at: '2026-01-10T00:00:00Z' },
  { id: 'c0000002-0000-0000-0000-000000000002', company_name: 'Vanguard Propulsion Systems', industry: 'Aerospace & Defense', tier: 'Tier 1', tax_id: 'US-82-3928172', website: 'https://vanguardpropulsion.com', phone: '+1 (310) 555-0189', billing_address: '1400 Rocket Rd, Hawthorne, CA 90250', shipping_address: '1400 Rocket Rd, Bldg C, Hawthorne, CA 90250', payment_terms: 'Net 30', credit_limit: 250000.00, status: 'Active', created_by: '22222222-2222-2222-2222-222222222222', created_at: '2026-01-12T00:00:00Z' },
  { id: 'c0000003-0000-0000-0000-000000000003', company_name: 'NexDrive Electric Powertrains', industry: 'Automotive', tier: 'Tier 1', tax_id: 'US-38-1928374', website: 'https://nexdrive-auto.com', phone: '+1 (248) 555-0199', billing_address: '450 Technology Dr, Troy, MI 48083', shipping_address: '450 Technology Dr, Troy, MI 48083', payment_terms: 'Net 60', credit_limit: 100000.00, status: 'Active', created_by: '22222222-2222-2222-2222-222222222222', created_at: '2026-01-15T00:00:00Z' },
  { id: 'c0000004-0000-0000-0000-000000000004', company_name: 'OmniMed Surgical Robotics', industry: 'Medical Devices', tier: 'Tier 2', tax_id: 'US-41-9283746', website: 'https://omnimed-robotics.com', phone: '+1 (612) 555-0177', billing_address: '1000 Innovation Way, Plymouth, MN 55441', shipping_address: '1000 Innovation Way, Plymouth, MN 55441', payment_terms: 'Net 30', credit_limit: 75000.00, status: 'Active', created_by: '11111111-1111-1111-1111-111111111111', created_at: '2026-02-01T00:00:00Z' },
  { id: 'c0000005-0000-0000-0000-000000000005', company_name: 'Titan TurboMachinery Corp', industry: 'Energy & Power', tier: 'Tier 2', tax_id: 'US-73-8273645', website: 'https://titanturbomach.com', phone: '+1 (713) 555-0155', billing_address: '5000 Energy Blvd, Houston, TX 77041', shipping_address: '5000 Energy Blvd, Houston, TX 77041', payment_terms: 'Net 30', credit_limit: 60000.00, status: 'Active', created_by: '22222222-2222-2222-2222-222222222222', created_at: '2026-02-10T00:00:00Z' },
];

let contactsDb: Contact[] = [
  { id: 'd0000001-0000-0000-0000-000000000001', customer_id: 'c0000001-0000-0000-0000-000000000001', first_name: 'Robert', last_name: 'Sterling', email: 'rsterling@apexaero-mfg.com', phone: '+1 (206) 555-0143', title: 'Director of Supply Chain', department: 'Procurement', is_primary: true, created_at: '2026-01-10T00:00:00Z' },
  { id: 'd0000002-0000-0000-0000-000000000001', customer_id: 'c0000001-0000-0000-0000-000000000001', first_name: 'Annette', last_name: 'Kovacs', email: 'akovacs@apexaero-mfg.com', phone: '+1 (206) 555-0144', title: 'Senior Lead Mechanical Engineer', department: 'Engineering', is_primary: false, created_at: '2026-01-10T00:00:00Z' },
  { id: 'd0000003-0000-0000-0000-000000000002', customer_id: 'c0000002-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Chen', email: 'mchen@vanguardpropulsion.com', phone: '+1 (310) 555-0191', title: 'VP Procurement & Sourcing', department: 'Procurement', is_primary: true, created_at: '2026-01-12T00:00:00Z' },
  { id: 'd0000004-0000-0000-0000-000000000003', customer_id: 'c0000003-0000-0000-0000-000000000003', first_name: 'Derek', last_name: 'Hansen', email: 'dhansen@nexdrive-auto.com', phone: '+1 (248) 555-0201', title: 'Lead Sourcing Specialist', department: 'Procurement', is_primary: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'd0000005-0000-0000-0000-000000000004', customer_id: 'c0000004-0000-0000-0000-000000000004', first_name: 'Dr. Claire', last_name: 'Fontaine', email: 'cfontaine@omnimed-robotics.com', phone: '+1 (612) 555-0178', title: 'Chief Robotics Engineer', department: 'R&D', is_primary: true, created_at: '2026-02-01T00:00:00Z' },
];

let partsDb: Part[] = [
  { id: 'e0000001-0000-0000-0000-000000000001', customer_id: 'c0000001-0000-0000-0000-000000000001', part_number: 'APX-701-FLG', revision: 'C', name: 'Actuator Mounting Flange', description: 'Aerospace 5-axis lightened pocketed mounting flange with AS9100 tolerances', material_id: 'a0000001-0000-0000-0000-000000000001', recommended_machine_id: 'b0000001-0000-0000-0000-000000000001', bounding_box_x_mm: 180.0, bounding_box_y_mm: 140.0, bounding_box_z_mm: 45.0, finished_volume_cm3: 315.0, finished_weight_kg: 0.851, cad_file_name: 'apx_701_flg_rev_c.stp', created_at: '2026-01-11T00:00:00Z' },
  { id: 'e0000002-0000-0000-0000-000000000002', customer_id: 'c0000002-0000-0000-0000-000000000002', part_number: 'VNG-GIMBAL-BRK', revision: 'B', name: 'Turbopump Gimbal Bracket', description: 'Ti-6Al-4V high-vibration engine mount bracket EDM profiled & CNC finished', material_id: 'a0000005-0000-0000-0000-000000000005', recommended_machine_id: 'b0000001-0000-0000-0000-000000000001', bounding_box_x_mm: 120.0, bounding_box_y_mm: 95.0, bounding_box_z_mm: 60.0, finished_volume_cm3: 210.0, finished_weight_kg: 0.930, cad_file_name: 'vng_gimbal_brk_rev_b.stp', created_at: '2026-01-13T00:00:00Z' },
  { id: 'e0000003-0000-0000-0000-000000000003', customer_id: 'c0000003-0000-0000-0000-000000000003', part_number: 'NXD-ROTOR-SHFT', revision: 'A', name: 'EV Inverter Output Rotor Shaft', description: 'Case-hardened 4140 multi-splined shaft with ground bearing journals', material_id: 'a0000006-0000-0000-0000-000000000006', recommended_machine_id: 'b0000003-0000-0000-0000-000000000003', bounding_box_x_mm: 60.0, bounding_box_y_mm: 60.0, bounding_box_z_mm: 320.0, finished_volume_cm3: 580.0, finished_weight_kg: 4.553, cad_file_name: 'nxd_rotor_shaft_rev_a.step', created_at: '2026-01-16T00:00:00Z' },
  { id: 'e0000004-0000-0000-0000-000000000004', customer_id: 'c0000004-0000-0000-0000-000000000004', part_number: 'OMN-END-EFF', revision: 'D', name: 'Micro-Surgical Articulated Wrist Housing', description: 'Medical-grade SS316L passivation ready surgical robot articulation body', material_id: 'a0000003-0000-0000-0000-000000000003', recommended_machine_id: 'b0000004-0000-0000-0000-000000000004', bounding_box_x_mm: 35.0, bounding_box_y_mm: 28.0, bounding_box_z_mm: 75.0, finished_volume_cm3: 42.0, finished_weight_kg: 0.336, cad_file_name: 'omnimed_wrist_housing.stp', created_at: '2026-02-02T00:00:00Z' },
];

let leadsDb: Lead[] = [
  {
    id: 'f0000001-0000-0000-0000-000000000001',
    title: 'Commercial Jet Wing Actuator Flange Batch (250 pcs)',
    customer_id: 'c0000001-0000-0000-0000-000000000001',
    contact_id: 'd0000001-0000-0000-0000-000000000001',
    assigned_to: '22222222-2222-2222-2222-222222222222',
    status: 'Won',
    estimated_value: 68500.00,
    win_probability: 100,
    source: 'Inbound RFQ',
    rfq_number: 'RFQ-APX-2026-091',
    target_delivery_date: '2026-10-30',
    notes: 'Customer awarded contract for initial 250 units with potential quarterly recurring order.',
    created_at: '2026-08-15T10:00:00Z',
    updated_at: '2026-09-01T14:30:00Z',
  },
  {
    id: 'f0000002-0000-0000-0000-000000000002',
    title: 'Upper Stage Rocket Engine Gimbal Prototype & Run',
    customer_id: 'c0000002-0000-0000-0000-000000000002',
    contact_id: 'd0000003-0000-0000-0000-000000000002',
    assigned_to: '11111111-1111-1111-1111-111111111111',
    status: 'Quoted',
    estimated_value: 142000.00,
    win_probability: 75,
    source: 'Referral',
    rfq_number: 'RFQ-VNG-8832',
    target_delivery_date: '2026-11-15',
    notes: 'Quote Q-2026-002 sent. Awaiting engineering team sign-off on CMM inspection criteria.',
    created_at: '2026-08-20T09:15:00Z',
    updated_at: '2026-09-08T11:20:00Z',
  },
  {
    id: 'f0000003-0000-0000-0000-000000000003',
    title: 'EV Inverter Splined Shaft High-Volume Pilot',
    customer_id: 'c0000003-0000-0000-0000-000000000003',
    contact_id: 'd0000004-0000-0000-0000-000000000003',
    assigned_to: '22222222-2222-2222-2222-222222222222',
    status: 'Contacted',
    estimated_value: 89500.00,
    win_probability: 50,
    source: 'Trade Show',
    rfq_number: 'RFQ-NXD-019',
    target_delivery_date: '2026-12-01',
    notes: 'Reviewed print with Derek. Need to confirm heat-treat spec before locking setup time.',
    created_at: '2026-09-02T16:40:00Z',
    updated_at: '2026-09-12T10:00:00Z',
  },
  {
    id: 'f0000004-0000-0000-0000-000000000004',
    title: 'Robotic Surgical Wrist Precision Components',
    customer_id: 'c0000004-0000-0000-0000-000000000004',
    contact_id: 'd0000005-0000-0000-0000-000000000004',
    assigned_to: '11111111-1111-1111-1111-111111111111',
    status: 'New',
    estimated_value: 45000.00,
    win_probability: 20,
    source: 'Direct Outreach',
    rfq_number: 'RFQ-OMN-2026-002',
    target_delivery_date: '2026-11-01',
    notes: 'Received STP file. High tolerance requirements (+/- 0.002mm) suitable for Wire EDM.',
    created_at: '2026-09-14T11:00:00Z',
    updated_at: '2026-09-14T11:00:00Z',
  },
  {
    id: 'f0000005-0000-0000-0000-000000000005',
    title: 'Gas Turbine Stator Ring Prototype Segment',
    customer_id: 'c0000005-0000-0000-0000-000000000005',
    contact_id: null,
    assigned_to: '22222222-2222-2222-2222-222222222222',
    status: 'Lost',
    estimated_value: 52000.00,
    win_probability: 0,
    source: 'Inbound RFQ',
    rfq_number: 'RFQ-TTN-941',
    target_delivery_date: '2026-09-15',
    lost_reason: 'Competitor had dedicated EDM rotary tooling in-house, beating lead time by 10 days.',
    notes: 'Lost to competitor who had existing EDM specialized rotary tooling in-house.',
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-25T15:00:00Z',
  },
];

let lineItemsDb: QuoteLineItem[] = [
  {
    id: '20000001-0000-0000-0000-000000000001',
    quote_id: '10000001-0000-0000-0000-000000000001',
    item_order: 1,
    part_id: 'e0000001-0000-0000-0000-000000000001',
    part_number: 'APX-701-FLG',
    description: 'Actuator Mounting Flange (AL 6061-T6)',
    material_id: 'a0000001-0000-0000-0000-000000000001',
    machine_id: 'b0000001-0000-0000-0000-000000000001',
    quantity: 250,
    raw_material_weight_kg: 3.06,
    machining_time_hours: 1.15,
    setup_time_hours: 4.0,
    tooling_cost: 650.00,
    complexity_factor: 1.10,
    machine_hourly_rate: 165.00,
    margin_percent: 25.00,
    overhead_percent: 15.00,
    material_cost_unit: 26.27,
    machining_cost_unit: 208.73,
    setup_cost_unit: 1.92,
    tooling_cost_unit: 2.60,
    overhead_cost_unit: 35.93,
    total_cost_unit: 275.45,
    unit_price: 274.00,
    line_total: 68500.00,
    cost_breakdown: {
      raw_material_weight_kg: 3.06,
      raw_material_cost: 23.87,
      scrap_allowance_cost: 2.40,
      machining_time_hours: 1.15,
      effective_machine_rate: 181.50,
      machining_cost: 208.73,
      setup_time_hours: 4.0,
      setup_cost_amortized: 1.92,
      tooling_cost_amortized: 2.60,
      base_unit_cost: 239.52,
      overhead_percent: 15.0,
      overhead_cost: 35.93,
      total_unit_cost: 275.45,
      target_margin_percent: 25.0,
      margin_amount: 91.82,
      unadjusted_unit_price: 367.27,
      quantity_break_applied: { min_qty: 100, max_qty: 499, discount_percent: 15 },
      discount_percent: 15,
      discount_amount: 55.09,
      final_unit_price: 274.00,
      extended_total: 68500.00,
      audit_timestamp: '2026-08-28T14:00:00Z',
    },
    created_at: '2026-08-28T14:00:00Z',
  },
  {
    id: '20000002-0000-0000-0000-000000000002',
    quote_id: '10000002-0000-0000-0000-000000000002',
    item_order: 1,
    part_id: 'e0000002-0000-0000-0000-000000000002',
    part_number: 'VNG-GIMBAL-BRK',
    description: 'Turbopump Gimbal Bracket (Ti-6Al-4V)',
    material_id: 'a0000005-0000-0000-0000-000000000005',
    machine_id: 'b0000001-0000-0000-0000-000000000001',
    quantity: 50,
    raw_material_weight_kg: 1.45,
    machining_time_hours: 4.20,
    setup_time_hours: 6.0,
    tooling_cost: 1500.00,
    complexity_factor: 1.35,
    machine_hourly_rate: 165.00,
    margin_percent: 28.00,
    overhead_percent: 15.00,
    material_cost_unit: 98.89,
    machining_cost_unit: 935.55,
    setup_cost_unit: 14.40,
    tooling_cost_unit: 30.00,
    overhead_cost_unit: 161.83,
    total_cost_unit: 1240.67,
    unit_price: 2840.00,
    line_total: 142000.00,
    cost_breakdown: {
      raw_material_weight_kg: 1.45,
      raw_material_cost: 89.90,
      scrap_allowance_cost: 8.99,
      machining_time_hours: 4.20,
      effective_machine_rate: 222.75,
      machining_cost: 935.55,
      setup_time_hours: 6.0,
      setup_cost_amortized: 14.40,
      tooling_cost_amortized: 30.00,
      base_unit_cost: 1078.84,
      overhead_percent: 15.0,
      overhead_cost: 161.83,
      total_unit_cost: 1240.67,
      target_margin_percent: 28.0,
      margin_amount: 482.48,
      unadjusted_unit_price: 1723.15,
      quantity_break_applied: { min_qty: 50, max_qty: 99, discount_percent: 10 },
      discount_percent: 10,
      discount_amount: 172.32,
      final_unit_price: 2840.00,
      extended_total: 142000.00,
      audit_timestamp: '2026-09-05T10:00:00Z',
    },
    created_at: '2026-09-05T10:00:00Z',
  },
  {
    id: '20000003-0000-0000-0000-000000000003',
    quote_id: '10000003-0000-0000-0000-000000000003',
    item_order: 1,
    part_id: 'e0000004-0000-0000-0000-000000000004',
    part_number: 'OMN-END-EFF',
    description: 'Micro-Surgical Articulated Wrist Housing (SS 316L)',
    material_id: 'a0000003-0000-0000-0000-000000000003',
    machine_id: 'b0000004-0000-0000-0000-000000000004',
    quantity: 100,
    raw_material_weight_kg: 0.55,
    machining_time_hours: 1.80,
    setup_time_hours: 5.0,
    tooling_cost: 800.00,
    complexity_factor: 1.25,
    machine_hourly_rate: 110.00,
    margin_percent: 25.00,
    overhead_percent: 15.00,
    material_cost_unit: 7.56,
    machining_cost_unit: 247.50,
    setup_cost_unit: 4.25,
    tooling_cost_unit: 8.00,
    overhead_cost_unit: 40.10,
    total_cost_unit: 307.41,
    unit_price: 378.00,
    line_total: 37800.00,
    cost_breakdown: {
      raw_material_weight_kg: 0.55,
      raw_material_cost: 6.87,
      scrap_allowance_cost: 0.69,
      machining_time_hours: 1.80,
      effective_machine_rate: 137.50,
      machining_cost: 247.50,
      setup_time_hours: 5.0,
      setup_cost_amortized: 4.25,
      tooling_cost_amortized: 8.00,
      base_unit_cost: 267.31,
      overhead_percent: 15.0,
      overhead_cost: 40.10,
      total_unit_cost: 307.41,
      target_margin_percent: 25.0,
      margin_amount: 102.47,
      unadjusted_unit_price: 409.88,
      quantity_break_applied: { min_qty: 100, max_qty: 499, discount_percent: 15 },
      discount_percent: 15,
      discount_amount: 61.48,
      final_unit_price: 378.00,
      extended_total: 37800.00,
      audit_timestamp: '2026-09-15T09:00:00Z',
    },
    created_at: '2026-09-15T09:00:00Z',
  }
];

let quotesDb: Quote[] = [
  {
    id: '10000001-0000-0000-0000-000000000001',
    quote_number: 'Q-2026-001',
    version: 1,
    customer_id: 'c0000001-0000-0000-0000-000000000001',
    contact_id: 'd0000001-0000-0000-0000-000000000001',
    lead_id: 'f0000001-0000-0000-0000-000000000001',
    assigned_to: '22222222-2222-2222-2222-222222222222',
    status: 'Accepted',
    currency: 'USD',
    subtotal: 68500.00,
    tax_rate_percent: 0.00,
    tax_amount: 0.00,
    expedited_shipping: 0.00,
    total_amount: 68500.00,
    lead_time_days: 18,
    valid_until: '2026-10-15',
    payment_terms: 'Net 45',
    notes: 'Includes CMM inspection report and material certs per AS9100 Rev D.',
    internal_notes: 'Machining slot confirmed on Hermle 5-axis. Raw billet PO sent to Kaiser Aluminum.',
    created_at: '2026-08-28T14:00:00Z',
    updated_at: '2026-09-01T15:00:00Z',
  },
  {
    id: '10000002-0000-0000-0000-000000000002',
    quote_number: 'Q-2026-002',
    version: 1,
    customer_id: 'c0000002-0000-0000-0000-000000000002',
    contact_id: 'd0000003-0000-0000-0000-000000000002',
    lead_id: 'f0000002-0000-0000-0000-000000000002',
    assigned_to: '11111111-1111-1111-1111-111111111111',
    status: 'Sent',
    currency: 'USD',
    subtotal: 142000.00,
    tax_rate_percent: 0.00,
    tax_amount: 0.00,
    expedited_shipping: 0.00,
    total_amount: 142000.00,
    lead_time_days: 24,
    valid_until: '2026-10-25',
    payment_terms: 'Net 30',
    notes: 'Titanium billet sourcing secured. 5-Axis Hermle machine slot reserved.',
    internal_notes: 'Critical high-margin defense account. Marcus handling VP follow-up.',
    created_at: '2026-09-05T10:00:00Z',
    updated_at: '2026-09-05T11:00:00Z',
  },
  {
    id: '10000003-0000-0000-0000-000000000003',
    quote_number: 'Q-2026-003',
    version: 1,
    customer_id: 'c0000004-0000-0000-0000-000000000004',
    contact_id: 'd0000005-0000-0000-0000-000000000004',
    lead_id: 'f0000004-0000-0000-0000-000000000004',
    assigned_to: '11111111-1111-1111-1111-111111111111',
    status: 'Draft',
    currency: 'USD',
    subtotal: 37800.00,
    tax_rate_percent: 0.00,
    tax_amount: 0.00,
    expedited_shipping: 0.00,
    total_amount: 37800.00,
    lead_time_days: 14,
    valid_until: '2026-10-31',
    payment_terms: 'Net 30',
    notes: 'Drafting initial prototype estimate for micro surgical robot components.',
    internal_notes: 'Wire EDM cycle time estimated using fine brass wire. Pending fixture design.',
    created_at: '2026-09-15T09:00:00Z',
    updated_at: '2026-09-15T09:00:00Z',
  }
];

// Helper to hydrate Quote with customer, contact, lead, and line items
function hydrateQuote(q: Quote): Quote {
  const customer = customersDb.find(c => c.id === q.customer_id);
  const contact = contactsDb.find(c => c.id === q.contact_id);
  const lead = leadsDb.find(l => l.id === q.lead_id);
  const assigned_user = usersDb.find(u => u.id === q.assigned_to);
  const items = lineItemsDb
    .filter(item => item.quote_id === q.id)
    .sort((a, b) => a.item_order - b.item_order)
    .map(item => ({
      ...item,
      material: materialsDb.find(m => m.id === item.material_id),
      machine: machinesDb.find(m => m.id === item.machine_id),
    }));

  return {
    ...q,
    customer,
    contact,
    lead,
    assigned_user,
    line_items: items,
  };
}

// Helper to hydrate Lead
function hydrateLead(l: Lead): Lead {
  return {
    ...l,
    customer: customersDb.find(c => c.id === l.customer_id),
    contact: contactsDb.find(c => c.id === l.contact_id),
    assigned_user: usersDb.find(u => u.id === l.assigned_to),
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // USERS
  app.get('/api/users', (req, res) => {
    res.json(usersDb);
  });

  // SETTINGS
  app.get('/api/settings', (req, res) => {
    res.json(settingsDb);
  });

  app.put('/api/settings', (req, res) => {
    settingsDb = {
      ...settingsDb,
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    res.json(settingsDb);
  });

  // MATERIALS
  app.get('/api/materials', (req, res) => {
    res.json(materialsDb);
  });

  app.post('/api/materials', (req, res) => {
    const newMat: Material = {
      id: `mat-${Date.now()}`,
      ...req.body,
      created_at: new Date().toISOString(),
    };
    materialsDb.push(newMat);
    res.status(201).json(newMat);
  });

  app.put('/api/materials/:id', (req, res) => {
    const index = materialsDb.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Material not found' });
    materialsDb[index] = { ...materialsDb[index], ...req.body };
    res.json(materialsDb[index]);
  });

  // MACHINES
  app.get('/api/machines', (req, res) => {
    res.json(machinesDb);
  });

  app.post('/api/machines', (req, res) => {
    const newMach: Machine = {
      id: `mach-${Date.now()}`,
      ...req.body,
      created_at: new Date().toISOString(),
    };
    machinesDb.push(newMach);
    res.status(201).json(newMach);
  });

  app.put('/api/machines/:id', (req, res) => {
    const index = machinesDb.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Machine not found' });
    machinesDb[index] = { ...machinesDb[index], ...req.body };
    res.json(machinesDb[index]);
  });

  // PARTS
  app.get('/api/parts', (req, res) => {
    const parts = partsDb.map(p => ({
      ...p,
      material: materialsDb.find(m => m.id === p.material_id),
      recommended_machine: machinesDb.find(m => m.id === p.recommended_machine_id),
    }));
    res.json(parts);
  });

  app.post('/api/parts', (req, res) => {
    const newPart: Part = {
      id: `part-${Date.now()}`,
      ...req.body,
      created_at: new Date().toISOString(),
    };
    partsDb.push(newPart);
    res.status(201).json(newPart);
  });

  // CUSTOMERS
  app.get('/api/customers', (req, res) => {
    res.json(customersDb);
  });

  app.post('/api/customers', (req, res) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customersDb.unshift(newCust);
    res.status(201).json(newCust);
  });

  app.put('/api/customers/:id', (req, res) => {
    const index = customersDb.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Customer not found' });
    customersDb[index] = { ...customersDb[index], ...req.body, updated_at: new Date().toISOString() };
    res.json(customersDb[index]);
  });

  // CONTACTS
  app.get('/api/contacts', (req, res) => {
    const customerId = req.query.customer_id as string | undefined;
    if (customerId) {
      return res.json(contactsDb.filter(c => c.customer_id === customerId));
    }
    res.json(contactsDb);
  });

  app.post('/api/contacts', (req, res) => {
    const newContact: Contact = {
      id: `cont-${Date.now()}`,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    contactsDb.push(newContact);
    res.status(201).json(newContact);
  });

  // LEADS
  app.get('/api/leads', (req, res) => {
    const status = req.query.status as LeadStatus | undefined;
    const leads = status ? leadsDb.filter(l => l.status === status) : leadsDb;
    res.json(leads.map(hydrateLead));
  });

  app.post('/api/leads', (req, res) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      title: req.body.title || 'Untitled RFQ Lead',
      customer_id: req.body.customer_id,
      contact_id: req.body.contact_id || null,
      assigned_to: req.body.assigned_to || null,
      status: req.body.status || 'New',
      estimated_value: Number(req.body.estimated_value) || 0,
      win_probability: Number(req.body.win_probability) || 20,
      source: req.body.source || 'Inbound RFQ',
      rfq_number: req.body.rfq_number || `RFQ-${Date.now().toString().slice(-4)}`,
      target_delivery_date: req.body.target_delivery_date || null,
      notes: req.body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    leadsDb.unshift(newLead);
    res.status(201).json(hydrateLead(newLead));
  });

  app.put('/api/leads/:id', (req, res) => {
    const index = leadsDb.findIndex(l => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Lead not found' });
    leadsDb[index] = { ...leadsDb[index], ...req.body, updated_at: new Date().toISOString() };
    res.json(hydrateLead(leadsDb[index]));
  });

  app.patch('/api/leads/:id/status', (req, res) => {
    const index = leadsDb.findIndex(l => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Lead not found' });
    leadsDb[index].status = req.body.status;
    if (req.body.status === 'Won') leadsDb[index].win_probability = 100;
    if (req.body.status === 'Lost') leadsDb[index].win_probability = 0;
    leadsDb[index].updated_at = new Date().toISOString();
    res.json(hydrateLead(leadsDb[index]));
  });

  // QUOTES
  app.get('/api/quotes', (req, res) => {
    res.json(quotesDb.map(hydrateQuote));
  });

  app.get('/api/quotes/:id', (req, res) => {
    const q = quotesDb.find(item => item.id === req.params.id);
    if (!q) return res.status(404).json({ error: 'Quote not found' });
    res.json(hydrateQuote(q));
  });

  app.post('/api/quotes', (req, res) => {
    const count = quotesDb.length + 1;
    const quoteNumber = req.body.quote_number || `Q-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    const quoteId = `quote-${Date.now()}`;

    const newQuote: Quote = {
      id: quoteId,
      quote_number: quoteNumber,
      version: 1,
      parent_quote_id: null,
      customer_id: req.body.customer_id,
      contact_id: req.body.contact_id || null,
      lead_id: req.body.lead_id || null,
      assigned_to: req.body.assigned_to || null,
      status: req.body.status || 'Draft',
      currency: req.body.currency || 'USD',
      subtotal: Number(req.body.subtotal) || 0,
      tax_rate_percent: Number(req.body.tax_rate_percent) || 0,
      tax_amount: Number(req.body.tax_amount) || 0,
      expedited_shipping: Number(req.body.expedited_shipping) || 0,
      total_amount: Number(req.body.total_amount) || 0,
      lead_time_days: Number(req.body.lead_time_days) || 15,
      valid_until: req.body.valid_until || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      payment_terms: req.body.payment_terms || 'Net 30',
      notes: req.body.notes || '',
      internal_notes: req.body.internal_notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    quotesDb.unshift(newQuote);

    // Save line items
    if (Array.isArray(req.body.line_items)) {
      req.body.line_items.forEach((item: any, idx: number) => {
        const lineItem: QuoteLineItem = {
          id: `line-${Date.now()}-${idx}`,
          quote_id: quoteId,
          item_order: idx + 1,
          part_id: item.part_id || null,
          part_number: item.part_number || `PART-${idx + 1}`,
          description: item.description || 'Machined Component',
          material_id: item.material_id || null,
          machine_id: item.machine_id || null,
          quantity: Number(item.quantity) || 1,
          raw_material_weight_kg: Number(item.raw_material_weight_kg) || 1,
          machining_time_hours: Number(item.machining_time_hours) || 1,
          setup_time_hours: Number(item.setup_time_hours) || 1,
          tooling_cost: Number(item.tooling_cost) || 0,
          complexity_factor: Number(item.complexity_factor) || 1,
          machine_hourly_rate: Number(item.machine_hourly_rate) || 100,
          margin_percent: Number(item.margin_percent) || 25,
          overhead_percent: Number(item.overhead_percent) || 15,
          material_cost_unit: Number(item.material_cost_unit) || 0,
          machining_cost_unit: Number(item.machining_cost_unit) || 0,
          setup_cost_unit: Number(item.setup_cost_unit) || 0,
          tooling_cost_unit: Number(item.tooling_cost_unit) || 0,
          overhead_cost_unit: Number(item.overhead_cost_unit) || 0,
          total_cost_unit: Number(item.total_cost_unit) || 0,
          unit_price: Number(item.unit_price) || 0,
          line_total: Number(item.line_total) || 0,
          cost_breakdown: item.cost_breakdown,
          created_at: new Date().toISOString(),
        };
        lineItemsDb.push(lineItem);
      });
    }

    // If associated with a lead, update lead to Quoted
    if (newQuote.lead_id) {
      const lead = leadsDb.find(l => l.id === newQuote.lead_id);
      if (lead && lead.status === 'New') {
        lead.status = 'Quoted';
        lead.estimated_value = newQuote.total_amount;
        lead.win_probability = 60;
      }
    }

    res.status(201).json(hydrateQuote(newQuote));
  });

  app.put('/api/quotes/:id', (req, res) => {
    const index = quotesDb.findIndex(q => q.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Quote not found' });

    quotesDb[index] = {
      ...quotesDb[index],
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    // If line items updated
    if (Array.isArray(req.body.line_items)) {
      // Remove old line items
      lineItemsDb = lineItemsDb.filter(li => li.quote_id !== req.params.id);
      req.body.line_items.forEach((item: any, idx: number) => {
        lineItemsDb.push({
          ...item,
          id: item.id || `line-${Date.now()}-${idx}`,
          quote_id: req.params.id,
          item_order: idx + 1,
        });
      });
    }

    res.json(hydrateQuote(quotesDb[index]));
  });

  app.patch('/api/quotes/:id/status', (req, res) => {
    const index = quotesDb.findIndex(q => q.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Quote not found' });
    const status: QuoteStatus = req.body.status;
    quotesDb[index].status = status;
    quotesDb[index].updated_at = new Date().toISOString();

    // If Accepted, also mark related lead as Won!
    if (status === 'Accepted' && quotesDb[index].lead_id) {
      const lead = leadsDb.find(l => l.id === quotesDb[index].lead_id);
      if (lead) {
        lead.status = 'Won';
        lead.win_probability = 100;
        lead.estimated_value = quotesDb[index].total_amount;
      }
    }

    res.json(hydrateQuote(quotesDb[index]));
  });

  // Duplicate quote
  app.post('/api/quotes/:id/duplicate', (req, res) => {
    const sourceQuote = quotesDb.find(q => q.id === req.params.id);
    if (!sourceQuote) return res.status(404).json({ error: 'Source quote not found' });

    const newQuoteId = `quote-${Date.now()}`;
    const newNumber = `Q-${new Date().getFullYear()}-${String(quotesDb.length + 1).padStart(3, '0')}`;

    const duplicatedQuote: Quote = {
      ...sourceQuote,
      id: newQuoteId,
      quote_number: newNumber,
      version: 1,
      parent_quote_id: null,
      status: 'Draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    quotesDb.unshift(duplicatedQuote);

    // Duplicate line items
    const sourceItems = lineItemsDb.filter(li => li.quote_id === sourceQuote.id);
    sourceItems.forEach((item, idx) => {
      lineItemsDb.push({
        ...item,
        id: `line-${Date.now()}-${idx}`,
        quote_id: newQuoteId,
      });
    });

    res.status(201).json(hydrateQuote(duplicatedQuote));
  });

  // Version quote (e.g. Q-2026-001 v1 -> v2)
  app.post('/api/quotes/:id/version', (req, res) => {
    const sourceQuote = quotesDb.find(q => q.id === req.params.id);
    if (!sourceQuote) return res.status(404).json({ error: 'Source quote not found' });

    const newQuoteId = `quote-${Date.now()}`;
    const nextVersion = sourceQuote.version + 1;

    const versionedQuote: Quote = {
      ...sourceQuote,
      id: newQuoteId,
      version: nextVersion,
      parent_quote_id: sourceQuote.id,
      status: 'Draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    quotesDb.unshift(versionedQuote);

    // Copy line items
    const sourceItems = lineItemsDb.filter(li => li.quote_id === sourceQuote.id);
    sourceItems.forEach((item, idx) => {
      lineItemsDb.push({
        ...item,
        id: `line-${Date.now()}-${idx}`,
        quote_id: newQuoteId,
      });
    });

    res.status(201).json(hydrateQuote(versionedQuote));
  });

  // DETERMINISTIC CALCULATION ENGINE ENDPOINT
  app.post('/api/quote-engine/calculate', (req, res) => {
    try {
      const input: QuoteEngineInput = req.body;
      const result = calculateLineItemPrice(input);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Calculation error' });
    }
  });

  // AGGREGATE TOTALS ENDPOINT
  app.post('/api/quote-engine/totals', (req, res) => {
    try {
      const items = req.body.items || [];
      const totals = calculateQuoteTotals(items);
      res.json(totals);
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'Aggregation error' });
    }
  });

  // OPTIONAL AI-ASSIST LAYER: Smart Machining & Setup Estimator
  app.post('/api/ai-estimate', async (req, res) => {
    const ai = getGemini();
    const { part_name, description, material_category, dimensions_mm, tolerance_requirement } = req.body;

    if (!ai) {
      // Fallback heuristics if Gemini API key not configured
      const vol = dimensions_mm 
        ? ((dimensions_mm.x || 100) * (dimensions_mm.y || 100) * (dimensions_mm.z || 25)) / 1000 
        : 250;
      return res.json({
        machining_time_hours: Number(Math.max(0.5, (vol / 150) * 0.8).toFixed(2)),
        setup_time_hours: 2.0,
        complexity_factor: 1.15,
        tooling_cost_estimate: 350.00,
        recommended_machine_type: '5-Axis CNC Mill',
        reasoning: 'Heuristic estimate based on part bounding volume and standard aerospace CNC pocketing cycles.',
        source: 'Heuristic Estimator',
      });
    }

    try {
      const prompt = `You are a senior CNC Manufacturing Estimator for high-precision metal fabrication, aerospace, and medical parts.
Analyze the following part specifications and provide realistic industrial cycle times:
Part Name: ${part_name || 'Machined Component'}
Description: ${description || 'Precision CNC machined part with pocketing, drilling, and tapping'}
Material: ${material_category || 'Aluminum'}
Dimensions (mm): X=${dimensions_mm?.x || 100}, Y=${dimensions_mm?.y || 100}, Z=${dimensions_mm?.z || 25}
Tolerances: ${tolerance_requirement || '+/- 0.010 mm'}

Estimate:
1. Machining cycle time per unit in decimal hours (e.g. 1.25 for 75 mins)
2. Setup time in hours (CAM programming, workholding fixture setup, tool probing)
3. Complexity factor multiplier (1.0 = standard 3-axis, 1.15 = 5-axis lightened, 1.35+ = thin walls/deep pockets/tight aerospace specs)
4. Dedicated tooling or custom soft-jaw fixturing cost ($)
5. Recommended machine type
6. Concise technical justification note

Return strictly a JSON object.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              machining_time_hours: { type: Type.NUMBER },
              setup_time_hours: { type: Type.NUMBER },
              complexity_factor: { type: Type.NUMBER },
              tooling_cost_estimate: { type: Type.NUMBER },
              recommended_machine_type: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ['machining_time_hours', 'setup_time_hours', 'complexity_factor', 'recommended_machine_type', 'reasoning'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        ...parsed,
        source: 'Gemini AI Precision Estimator',
      });
    } catch (err: any) {
      console.error('AI Estimator error:', err);
      res.json({
        machining_time_hours: 1.2,
        setup_time_hours: 2.5,
        complexity_factor: 1.10,
        tooling_cost_estimate: 400.00,
        recommended_machine_type: '3-Axis CNC Mill',
        reasoning: 'Fallback standard estimate based on volume envelope.',
        source: 'Heuristic Fallback',
      });
    }
  });

  // -------------------------------------------------------------------------
  // VITE MIDDLEWARE (Development) OR STATIC ASSETS (Production)
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Industrial B2B CRM & Quote Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

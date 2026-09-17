/**
 * Supabase PostgreSQL Database Type Definitions
 * Auto-compatible with @supabase/supabase-js typed client
 */

export type UserRole = 'Sales Rep' | 'Sales Manager' | 'Estimator' | 'Admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export type IndustryType =
  | 'Aerospace & Defense'
  | 'Automotive'
  | 'Medical Devices'
  | 'Industrial Equipment'
  | 'Energy & Power'
  | 'Electronics'
  | 'Metal Fabrication';

export interface Customer {
  id: string;
  company_name: string;
  industry: IndustryType;
  tier: string;
  tax_id?: string | null;
  website?: string | null;
  phone?: string | null;
  billing_address?: string | null;
  shipping_address?: string | null;
  payment_terms: string;
  credit_limit: number;
  status: 'Active' | 'Inactive' | 'Credit Hold';
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Contact {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  title: string;
  department: string;
  is_primary: boolean;
  created_at: string;
  updated_at?: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Quoted' | 'Won' | 'Lost';
export type LeadSource = 'Inbound RFQ' | 'Referral' | 'Trade Show' | 'Direct Outreach' | 'Repeat Order';

export interface Lead {
  id: string;
  title: string;
  customer_id: string;
  contact_id?: string | null;
  assigned_to?: string | null;
  status: LeadStatus;
  estimated_value: number;
  win_probability: number;
  source: LeadSource;
  rfq_number?: string | null;
  target_delivery_date?: string | null;
  lost_reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  // Joins
  customer?: Customer;
  contact?: Contact;
  assigned_user?: User;
}

export type MaterialCategory =
  | 'Aluminum'
  | 'Stainless Steel'
  | 'Alloy Steel'
  | 'Titanium'
  | 'Brass & Bronze'
  | 'Engineering Plastic';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  density_g_cm3: number;
  cost_per_kg: number;
  machinability_rating: number;
  stock_status: 'In Stock' | 'Available on Order' | 'Lead Time 2 Weeks';
  scrap_credit_per_kg: number;
  created_at: string;
}

export type MachineType =
  | '3-Axis CNC Mill'
  | '5-Axis CNC Mill'
  | 'CNC Lathe with Live Tooling'
  | 'Wire EDM'
  | 'Fiber Laser Cutter'
  | 'CNC Press Brake';

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: MachineType;
  hourly_rate: number;
  setup_rate: number;
  max_part_dimensions?: string | null;
  tolerance_rating: string;
  status: 'Operational' | 'Maintenance' | 'Booked';
  created_at: string;
}

export interface Part {
  id: string;
  customer_id?: string | null;
  part_number: string;
  revision: string;
  name: string;
  description?: string | null;
  material_id?: string | null;
  recommended_machine_id?: string | null;
  bounding_box_x_mm: number;
  bounding_box_y_mm: number;
  bounding_box_z_mm: number;
  finished_volume_cm3: number;
  finished_weight_kg: number;
  cad_file_name?: string | null;
  cad_file_url?: string | null;
  created_at: string;
  // Joins
  material?: Material;
  recommended_machine?: Machine;
}

export interface QuantityBreak {
  min_qty: number;
  max_qty: number;
  discount_percent: number;
}

export interface PricingSettings {
  id: string;
  shop_name: string;
  default_overhead_percent: number;
  default_margin_percent: number;
  default_scrap_percent: number;
  expedite_multiplier: number;
  quantity_breaks: QuantityBreak[];
  updated_at: string;
}

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected';

export interface Quote {
  id: string;
  quote_number: string;
  version: number;
  parent_quote_id?: string | null;
  customer_id: string;
  contact_id?: string | null;
  lead_id?: string | null;
  assigned_to?: string | null;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  tax_rate_percent: number;
  tax_amount: number;
  expedited_shipping: number;
  total_amount: number;
  lead_time_days: number;
  valid_until: string;
  payment_terms: string;
  notes?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at?: string;
  // Joins
  customer?: Customer;
  contact?: Contact;
  lead?: Lead;
  assigned_user?: User;
  line_items?: QuoteLineItem[];
}

export interface CostBreakdown {
  raw_material_weight_kg: number;
  raw_material_cost: number;
  scrap_allowance_cost: number;
  machining_time_hours: number;
  effective_machine_rate: number;
  machining_cost: number;
  setup_time_hours: number;
  setup_cost_amortized: number;
  tooling_cost_amortized: number;
  base_unit_cost: number;
  overhead_percent: number;
  overhead_cost: number;
  total_unit_cost: number;
  target_margin_percent: number;
  margin_amount: number;
  unadjusted_unit_price: number;
  quantity_break_applied?: QuantityBreak | null;
  discount_percent: number;
  discount_amount: number;
  final_unit_price: number;
  extended_total: number;
  audit_timestamp: string;
}

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  item_order: number;
  part_id?: string | null;
  part_number: string;
  description: string;
  material_id?: string | null;
  machine_id?: string | null;
  quantity: number;
  
  // Cost inputs
  raw_material_weight_kg: number;
  machining_time_hours: number;
  setup_time_hours: number;
  tooling_cost: number;
  complexity_factor: number;
  machine_hourly_rate: number;
  margin_percent: number;
  overhead_percent: number;
  
  // Unit calculations
  material_cost_unit: number;
  machining_cost_unit: number;
  setup_cost_unit: number;
  tooling_cost_unit: number;
  overhead_cost_unit: number;
  total_cost_unit: number;
  unit_price: number;
  line_total: number;
  
  cost_breakdown: CostBreakdown;
  created_at?: string;
  
  // Joins
  material?: Material;
  machine?: Machine;
}

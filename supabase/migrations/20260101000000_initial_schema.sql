-- =====================================================================
-- B2B INDUSTRIAL CRM & QUOTE GENERATION ENGINE - SUPABASE POSTGRESQL SCHEMA
-- Target Industries: Metal Fabrication, CNC Machining, Automotive, Aerospace
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Sales team & Estimators)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Sales Rep', 'Sales Manager', 'Estimator', 'Admin')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS (Manufacturing OEMs, Tier 1/2 Suppliers, Defense Contractors)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL CHECK (industry IN ('Aerospace & Defense', 'Automotive', 'Medical Devices', 'Industrial Equipment', 'Energy & Power', 'Electronics', 'Metal Fabrication')),
    tier TEXT DEFAULT 'Tier 2',
    tax_id TEXT,
    website TEXT,
    phone TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    payment_terms TEXT DEFAULT 'Net 30',
    credit_limit NUMERIC(12, 2) DEFAULT 50000.00,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Credit Hold')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTACTS (Engineers, Buyers, Procurement Managers)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    title TEXT NOT NULL,
    department TEXT DEFAULT 'Procurement',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEADS (Sales Pipeline)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Quoted', 'Won', 'Lost')),
    estimated_value NUMERIC(12, 2) DEFAULT 0.00,
    win_probability INTEGER DEFAULT 20 CHECK (win_probability BETWEEN 0 AND 100),
    source TEXT DEFAULT 'Inbound RFQ' CHECK (source IN ('Inbound RFQ', 'Referral', 'Trade Show', 'Direct Outreach', 'Repeat Order')),
    rfq_number TEXT,
    target_delivery_date DATE,
    lost_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATERIALS CATALOG (Stock bars, plates, billets with machinability & density)
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Aluminum', 'Stainless Steel', 'Alloy Steel', 'Titanium', 'Brass & Bronze', 'Engineering Plastic')),
    density_g_cm3 NUMERIC(6, 3) NOT NULL, -- e.g., 2.70 for AL 6061, 7.85 for 4140, 4.43 for Ti-6Al-4V
    cost_per_kg NUMERIC(10, 2) NOT NULL,
    machinability_rating NUMERIC(4, 2) NOT NULL DEFAULT 1.0, -- relative speed factor (e.g. 1.0 baseline, 0.4 for Ti, 1.8 for Brass)
    stock_status TEXT DEFAULT 'In Stock' CHECK (stock_status IN ('In Stock', 'Available on Order', 'Lead Time 2 Weeks')),
    scrap_credit_per_kg NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MACHINES CATALOG (Shop floor CNC mills, lathes, EDM, laser cutters)
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('3-Axis CNC Mill', '5-Axis CNC Mill', 'CNC Lathe with Live Tooling', 'Wire EDM', 'Fiber Laser Cutter', 'CNC Press Brake')),
    hourly_rate NUMERIC(10, 2) NOT NULL, -- Shop run rate ($/hr)
    setup_rate NUMERIC(10, 2) NOT NULL,  -- Fixture & CAM setup rate ($/hr)
    max_part_dimensions TEXT,            -- e.g. "1000x500x500 mm"
    tolerance_rating TEXT DEFAULT '+/- 0.005 mm',
    status TEXT DEFAULT 'Operational' CHECK (status IN ('Operational', 'Maintenance', 'Booked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PARTS (Customer Part Catalog & Specs)
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    part_number TEXT NOT NULL,
    revision TEXT DEFAULT 'A',
    name TEXT NOT NULL,
    description TEXT,
    material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    recommended_machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    bounding_box_x_mm NUMERIC(8, 2) NOT NULL DEFAULT 100.0,
    bounding_box_y_mm NUMERIC(8, 2) NOT NULL DEFAULT 100.0,
    bounding_box_z_mm NUMERIC(8, 2) NOT NULL DEFAULT 25.0,
    finished_volume_cm3 NUMERIC(10, 3) NOT NULL,
    finished_weight_kg NUMERIC(10, 3) NOT NULL,
    cad_file_name TEXT,
    cad_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(part_number, revision)
);

-- 8. PRICING SETTINGS (Global and shop-specific rules)
CREATE TABLE IF NOT EXISTS pricing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_name TEXT NOT NULL DEFAULT 'Precision AeroMachining Inc.',
    default_overhead_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    default_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 25.00,
    default_scrap_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    expedite_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.35,
    quantity_breaks JSONB NOT NULL DEFAULT '[
        {"min_qty": 1, "max_qty": 9, "discount_percent": 0},
        {"min_qty": 10, "max_qty": 49, "discount_percent": 5},
        {"min_qty": 50, "max_qty": 99, "discount_percent": 10},
        {"min_qty": 100, "max_qty": 499, "discount_percent": 15},
        {"min_qty": 500, "max_qty": 999999, "discount_percent": 22}
    ]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. QUOTES
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    parent_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Accepted', 'Rejected')),
    currency TEXT NOT NULL DEFAULT 'USD',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate_percent NUMERIC(5, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    expedited_shipping NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    lead_time_days INTEGER DEFAULT 15,
    valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    payment_terms TEXT DEFAULT 'Net 30',
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(quote_number, version)
);

-- 10. QUOTE LINE ITEMS (Automated deterministic breakdown per part)
CREATE TABLE IF NOT EXISTS quote_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL DEFAULT 1,
    part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
    part_number TEXT NOT NULL,
    description TEXT NOT NULL,
    material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    -- Engine Inputs
    raw_material_weight_kg NUMERIC(10, 3) NOT NULL,
    machining_time_hours NUMERIC(8, 3) NOT NULL,
    setup_time_hours NUMERIC(8, 3) NOT NULL,
    tooling_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    complexity_factor NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    machine_hourly_rate NUMERIC(10, 2) NOT NULL,
    margin_percent NUMERIC(5, 2) NOT NULL,
    overhead_percent NUMERIC(5, 2) NOT NULL,
    
    -- Calculated Costs & Pricing
    material_cost_unit NUMERIC(10, 2) NOT NULL,
    machining_cost_unit NUMERIC(10, 2) NOT NULL,
    setup_cost_unit NUMERIC(10, 2) NOT NULL,
    tooling_cost_unit NUMERIC(10, 2) NOT NULL,
    overhead_cost_unit NUMERIC(10, 2) NOT NULL,
    total_cost_unit NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL,
    
    -- Full Auditable Cost Breakdown JSON
    cost_breakdown JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high performance sales queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_id ON quote_line_items(quote_id);

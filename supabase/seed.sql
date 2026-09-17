-- =====================================================================
-- B2B INDUSTRIAL CRM & QUOTE GENERATION ENGINE - SEED DATA
-- =====================================================================

-- 1. USERS
INSERT INTO users (id, email, full_name, role, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'marcus.vance@aeromachining.com', 'Marcus Vance', 'Sales Manager', '+1 (555) 234-5678'),
('22222222-2222-2222-2222-222222222222', 'elena.rostova@aeromachining.com', 'Elena Rostova', 'Sales Rep', '+1 (555) 345-6789'),
('33333333-3333-3333-3333-333333333333', 'dave.miller@aeromachining.com', 'Dave Miller', 'Estimator', '+1 (555) 456-7890'),
('44444444-4444-4444-4444-444444444444', 'admin@aeromachining.com', 'Sarah Jenkins', 'Admin', '+1 (555) 567-8901')
ON CONFLICT (id) DO NOTHING;

-- 2. PRICING SETTINGS
INSERT INTO pricing_settings (id, shop_name, default_overhead_percent, default_margin_percent, default_scrap_percent, expedite_multiplier, quantity_breaks) VALUES
('99999999-9999-9999-9999-999999999999', 'Precision AeroMachining Inc.', 15.00, 25.00, 10.00, 1.35, '[
    {"min_qty": 1, "max_qty": 9, "discount_percent": 0},
    {"min_qty": 10, "max_qty": 49, "discount_percent": 5},
    {"min_qty": 50, "max_qty": 99, "discount_percent": 10},
    {"min_qty": 100, "max_qty": 499, "discount_percent": 15},
    {"min_qty": 500, "max_qty": 999999, "discount_percent": 22}
]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. MATERIALS
INSERT INTO materials (id, code, name, category, density_g_cm3, cost_per_kg, machinability_rating, stock_status, scrap_credit_per_kg) VALUES
('a0000001-0000-0000-0000-000000000001', 'AL-6061-T6', 'Aluminum 6061-T6 (Aerospace Grade)', 'Aluminum', 2.70, 7.80, 1.00, 'In Stock', 1.50),
('a0000002-0000-0000-0000-000000000002', 'AL-7075-T651', 'Aluminum 7075-T651 (High-Strength Aircraft)', 'Aluminum', 2.81, 14.20, 0.85, 'In Stock', 1.80),
('a0000003-0000-0000-0000-000000000003', 'SS-316L', 'Stainless Steel 316L (Medical / Marine)', 'Stainless Steel', 8.00, 12.50, 0.55, 'In Stock', 2.10),
('a0000004-0000-0000-0000-000000000004', 'SS-17-4PH', 'Stainless 17-4 PH Condition H1025', 'Stainless Steel', 7.80, 18.00, 0.50, 'Available on Order', 2.20),
('a0000005-0000-0000-0000-000000000005', 'TI-6AL-4V', 'Titanium Grade 5 (Ti-6Al-4V)', 'Titanium', 4.43, 62.00, 0.35, 'Available on Order', 8.50),
('a0000006-0000-0000-0000-000000000006', 'STEEL-4140', 'Alloy Steel 4140 (Pre-hardened QT)', 'Alloy Steel', 7.85, 6.20, 0.70, 'In Stock', 0.80),
('a0000007-0000-0000-0000-000000000007', 'BRASS-C360', 'Free-Cutting Brass C36000', 'Brass & Bronze', 8.50, 11.00, 1.80, 'In Stock', 3.50),
('a0000008-0000-0000-0000-000000000008', 'PLASTIC-PEEK', 'Virgin PEEK (Polyetheretherketone)', 'Engineering Plastic', 1.32, 115.00, 1.10, 'Lead Time 2 Weeks', 0.00)
ON CONFLICT (id) DO NOTHING;

-- 4. MACHINES
INSERT INTO machines (id, code, name, type, hourly_rate, setup_rate, max_part_dimensions, tolerance_rating, status) VALUES
('b0000001-0000-0000-0000-000000000001', 'CNC-5AX-01', 'Hermle C42U 5-Axis Machining Center', '5-Axis CNC Mill', 165.00, 120.00, '800 x 800 x 550 mm', '+/- 0.003 mm', 'Operational'),
('b0000002-0000-0000-0000-000000000002', 'CNC-3AX-01', 'Haas VF-4SS Super Speed Vertical Mill', '3-Axis CNC Mill', 95.00, 75.00, '1270 x 660 x 635 mm', '+/- 0.010 mm', 'Operational'),
('b0000003-0000-0000-0000-000000000003', 'LATHE-LIVE-01', 'Mazak Integrex i-200H Multi-Tasking Lathe', 'CNC Lathe with Live Tooling', 135.00, 95.00, 'Dia 658 x 1011 mm', '+/- 0.005 mm', 'Operational'),
('b0000004-0000-0000-0000-000000000004', 'EDM-WIRE-01', 'Mitsubishi MV2400-S Wire EDM', 'Wire EDM', 110.00, 85.00, '600 x 400 x 310 mm', '+/- 0.002 mm', 'Operational'),
('b0000005-0000-0000-0000-000000000005', 'LASER-FIBER-01', 'Amada Ensis 3015AJ 6kW Fiber Laser', 'Fiber Laser Cutter', 140.00, 60.00, '3000 x 1500 mm Plate', '+/- 0.050 mm', 'Operational')
ON CONFLICT (id) DO NOTHING;

-- 5. CUSTOMERS
INSERT INTO customers (id, company_name, industry, tier, tax_id, website, phone, billing_address, payment_terms, credit_limit, status, created_by) VALUES
('c0000001-0000-0000-0000-000000000001', 'Apex Aerodynamics LLC', 'Aerospace & Defense', 'Tier 1', 'US-94-2819201', 'https://apexaero-mfg.com', '+1 (206) 555-0142', '8200 Boeing Access Rd, Seattle, WA 98108', 'Net 45', 150000.00, 'Active', '11111111-1111-1111-1111-111111111111'),
('c0000002-0000-0000-0000-000000000002', 'Vanguard Propulsion Systems', 'Aerospace & Defense', 'Tier 1', 'US-82-3928172', 'https://vanguardpropulsion.com', '+1 (310) 555-0189', '1400 Rocket Rd, Hawthorne, CA 90250', 'Net 30', 250000.00, 'Active', '22222222-2222-2222-2222-222222222222'),
('c0000003-0000-0000-0000-000000000003', 'NexDrive Electric Powertrains', 'Automotive', 'Tier 1', 'US-38-1928374', 'https://nexdrive-auto.com', '+1 (248) 555-0199', '450 Technology Dr, Troy, MI 48083', 'Net 60', 100000.00, 'Active', '22222222-2222-2222-2222-222222222222'),
('c0000004-0000-0000-0000-000000000004', 'OmniMed Surgical Robotics', 'Medical Devices', 'Tier 2', 'US-41-9283746', 'https://omnimed-robotics.com', '+1 (612) 555-0177', '1000 Innovation Way, Plymouth, MN 55441', 'Net 30', 75000.00, 'Active', '11111111-1111-1111-1111-111111111111'),
('c0000005-0000-0000-0000-000000000005', 'Titan TurboMachinery Corp', 'Energy & Power', 'Tier 2', 'US-73-8273645', 'https://titanturbomach.com', '+1 (713) 555-0155', '5000 Energy Blvd, Houston, TX 77041', 'Net 30', 60000.00, 'Active', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- 6. CONTACTS
INSERT INTO contacts (id, customer_id, first_name, last_name, email, phone, title, department, is_primary) VALUES
('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Robert', 'Sterling', 'rsterling@apexaero-mfg.com', '+1 (206) 555-0143', 'Director of Supply Chain', 'Procurement', TRUE),
('d0000002-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Annette', 'Kovacs', 'akovacs@apexaero-mfg.com', '+1 (206) 555-0144', 'Senior Lead Mechanical Engineer', 'Engineering', FALSE),
('d0000003-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'Marcus', 'Chen', 'mchen@vanguardpropulsion.com', '+1 (310) 555-0191', 'VP Procurement & Sourcing', 'Procurement', TRUE),
('d0000004-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'Derek', 'Hansen', 'dhansen@nexdrive-auto.com', '+1 (248) 555-0201', 'Lead Sourcing Specialist', 'Procurement', TRUE),
('d0000005-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000004', 'Dr. Claire', 'Fontaine', 'cfontaine@omnimed-robotics.com', '+1 (612) 555-0178', 'Chief Robotics Engineer', 'R&D', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. PARTS
INSERT INTO parts (id, customer_id, part_number, revision, name, description, material_id, recommended_machine_id, bounding_box_x_mm, bounding_box_y_mm, bounding_box_z_mm, finished_volume_cm3, finished_weight_kg) VALUES
('e0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'APX-701-FLG', 'C', 'Actuator Mounting Flange', 'Aerospace 5-axis lightened pocketed mounting flange with AS9100 tolerances', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 180.0, 140.0, 45.0, 315.000, 0.851),
('e0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'VNG-GIMBAL-BRK', 'B', 'Turbopump Gimbal Bracket', 'Ti-6Al-4V high-vibration engine mount bracket EDM profiled & CNC finished', 'a0000005-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000001', 120.0, 95.0, 60.0, 210.000, 0.930),
('e0000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'NXD-ROTOR-SHFT', 'A', 'EV Inverter Output Rotor Shaft', 'Case-hardened 4140 multi-splined shaft with ground bearing journals', 'a0000006-0000-0000-0000-000000000006', 'b0000003-0000-0000-0000-000000000003', 60.0, 60.0, 320.0, 580.000, 4.553),
('e0000004-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000004', 'OMN-END-EFF', 'D', 'Micro-Surgical Articulated Wrist Housing', 'Medical-grade SS316L passivation ready surgical robot articulation body', 'a0000003-0000-0000-0000-000000000003', 'b0000004-0000-0000-0000-000000000004', 35.0, 28.0, 75.0, 42.000, 0.336)
ON CONFLICT (id) DO NOTHING;

-- 8. LEADS (CRM PIPELINE)
INSERT INTO leads (id, title, customer_id, contact_id, assigned_to, status, estimated_value, win_probability, source, rfq_number, target_delivery_date, notes) VALUES
('f0000001-0000-0000-0000-000000000001', 'Commercial Jet Wing Actuator Flange Batch (250 pcs)', 'c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Won', 68500.00, 100, 'Inbound RFQ', 'RFQ-APX-2026-091', '2026-10-30', 'Customer awarded contract for initial 250 units with potential quarterly recurring order.'),
('f0000002-0000-0000-0000-000000000002', 'Upper Stage Rocket Engine Gimbal Prototype & Run', 'c0000002-0000-0000-0000-000000000002', 'd0000003-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Quoted', 142000.00, 75, 'Referral', 'RFQ-VNG-8832', '2026-11-15', 'Quote Q-2026-004 sent. Awaiting engineering team sign-off on CMM inspection criteria.'),
('f0000003-0000-0000-0000-000000000003', 'EV Inverter Splined Shaft High-Volume Pilot', 'c0000003-0000-0000-0000-000000000003', 'd0000004-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Contacted', 89500.00, 50, 'Trade Show', 'RFQ-NXD-019', '2026-12-01', 'Reviewed print with Derek. Need to confirm heat-treat spec before locking setup time.'),
('f0000004-0000-0000-0000-000000000004', 'Robotic Surgical Wrist Precision Components', 'c0000004-0000-0000-0000-000000000004', 'd0000005-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'New', 45000.00, 20, 'Direct Outreach', 'RFQ-OMN-2026-002', '2026-11-01', 'Received STP file. High tolerance requirements (+/- 0.002mm) suitable for Wire EDM.'),
('f0000005-0000-0000-0000-000000000005', 'Gas Turbine Stator Ring Prototype Segment', 'c0000005-0000-0000-0000-000000000005', NULL, '22222222-2222-2222-2222-222222222222', 'Lost', 52000.00, 0, 'Inbound RFQ', 'RFQ-TTN-941', '2026-09-15', 'Lost to competitor who had existing EDM specialized rotary tooling in-house.')
ON CONFLICT (id) DO NOTHING;

-- 9. QUOTES
INSERT INTO quotes (id, quote_number, version, customer_id, contact_id, lead_id, assigned_to, status, subtotal, tax_rate_percent, tax_amount, total_amount, lead_time_days, valid_until, payment_terms, notes) VALUES
('10000001-0000-0000-0000-000000000001', 'Q-2026-001', 1, 'c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Accepted', 68500.00, 0.00, 0.00, 68500.00, 18, '2026-10-15', 'Net 45', 'Includes CMM inspection report and material certs per AS9100 Rev D.'),
('10000002-0000-0000-0000-000000000002', 'Q-2026-002', 1, 'c0000002-0000-0000-0000-000000000002', 'd0000003-0000-0000-0000-000000000002', 'f0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Sent', 142000.00, 0.00, 0.00, 142000.00, 24, '2026-10-25', 'Net 30', 'Titanium billet sourcing secured. 5-Axis Hermle machine slot reserved.'),
('10000003-0000-0000-0000-000000000003', 'Q-2026-003', 1, 'c0000004-0000-0000-0000-000000000004', 'd0000005-0000-0000-0000-000000000004', 'f0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Draft', 37800.00, 0.00, 0.00, 37800.00, 14, '2026-10-31', 'Net 30', 'Drafting initial prototype estimate for micro surgical robot components.')
ON CONFLICT (id) DO NOTHING;

-- 10. QUOTE LINE ITEMS (Automated deterministic calculations stored)
INSERT INTO quote_line_items (
    id, quote_id, item_order, part_id, part_number, description, material_id, machine_id, quantity,
    raw_material_weight_kg, machining_time_hours, setup_time_hours, tooling_cost, complexity_factor, machine_hourly_rate, margin_percent, overhead_percent,
    material_cost_unit, machining_cost_unit, setup_cost_unit, tooling_cost_unit, overhead_cost_unit, total_cost_unit, unit_price, line_total,
    cost_breakdown
) VALUES
(
    '20000001-0000-0000-0000-000000000001',
    '10000001-0000-0000-0000-000000000001',
    1,
    'e0000001-0000-0000-0000-000000000001',
    'APX-701-FLG',
    'Actuator Mounting Flange (AL 6061-T6)',
    'a0000001-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000001',
    250,
    3.060, -- Raw billet weight kg
    1.150, -- Machining time hrs
    4.000, -- Setup time hrs
    650.00, -- Dedicated fixture/tooling
    1.10,
    165.00,
    25.00,
    15.00,
    26.27, -- material_cost_unit
    208.73, -- machining_cost_unit
    1.92, -- setup_cost_unit (4 hrs * $120 / 250)
    2.60, -- tooling_cost_unit ($650 / 250)
    35.93, -- overhead_cost_unit (15%)
    275.45, -- total_cost_unit
    274.00, -- unit_price after 25% margin & 15% quantity break for 250 pcs
    68500.00,
    '{"raw_material_cost": 26.27, "machining_cost": 208.73, "setup_cost": 1.92, "tooling_cost": 2.60, "overhead_cost": 35.93, "total_unit_cost": 275.45, "unadjusted_unit_price": 367.27, "quantity_discount_percent": 15, "final_unit_price": 274.00, "formula": "material + (machining*rate*complexity) + (setup/qty*setup_rate) + (tooling/qty) + overhead + margin - qty_break"}'::jsonb
);

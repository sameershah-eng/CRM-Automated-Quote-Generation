import { Customer, Material, Machine, PricingSettings } from '../types/database';

export interface RevisionItem {
  id: string;
  title: string;
  category: 'material' | 'surface' | 'penalty' | 'tolerance' | 'delivery' | 'certificate';
  status: 'Changed' | '+ Added' | '- Removed';
  revA: string;
  revB: string;
  risk: 'Low' | 'Medium' | 'High';
  note?: string;
}

export interface RevisionCheck {
  id: string;
  title: string;
  fileA: string;
  fileB: string;
  date: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  itemsAdded: number;
  itemsRemoved: number;
  itemsChanged: number;
  diffItems: RevisionItem[];
}

export interface BidItem {
  id: string;
  bidNumber: string;
  customerName: string;
  projectName: string;
  contactName: string;
  volume: number;
  status: 'Draft' | 'Sent' | 'In negotiation' | 'Follow-up needed' | 'Accepted' | 'Declined';
  openDays: number;
  note: string;
  urgent?: boolean;
  leadTimeWeeks: number;
  version: number;
  lineItemsCount: number;
  // Deep details for quote breakdown
  materialId?: string;
  machineId?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface WonDeal {
  id: string;
  customerName: string;
  projectName: string;
  volume: number;
  margin: number;
  source: 'Existing' | 'Tender' | 'Referral' | 'Inbound RFQ';
  salesRep: string;
  closedDate: string;
}

export interface SalesRep {
  id: string;
  name: string;
  deals: number;
  volume: number;
  avgMargin: number;
  avatarUrl?: string;
}

export interface CustomerAnalyticsItem {
  id: string;
  customerName: string;
  revenueYtd: number;
  sharePercent: number;
  trend: number[]; // 6 data points
  trendType: 'up' | 'down' | 'stable';
  deltaYoy: number; // e.g. +14 or -18
  actionType: 'Detail' | 'Fix' | 'Grow';
  actionColor: 'slate' | 'rose' | 'navy';
}

export interface ChurnSignal {
  id: string;
  customerName: string;
  signal: string;
  actionText: string;
  actionType: 're-engage' | 'upsell';
}

export const INITIAL_REVISION_CHECKS: RevisionCheck[] = [
  {
    id: 'rev-001',
    title: 'Projektanfrage RFQ',
    fileA: 'Projektanfrage RFQ A.pdf',
    fileB: 'Projektanfrage RFQ B.pdf',
    date: '2026-09-16',
    riskLevel: 'Low',
    itemsAdded: 1,
    itemsRemoved: 1,
    itemsChanged: 4,
    diffItems: [
      {
        id: 'diff-1',
        title: 'Material change',
        category: 'material',
        status: 'Changed',
        revA: 'S235JR, V2A',
        revB: 'S235JR, V4A (Higher molybdenum content for marine corrosion resistance)',
        risk: 'Low',
        note: 'Requires upgrade to 316L/V4A grade billet. Raw material cost increases by ~18%.'
      },
      {
        id: 'diff-2',
        title: 'Surface change',
        category: 'surface',
        status: 'Changed',
        revA: 'verzinkt (Standard galvanized finish)',
        revB: 'Pulverbeschichtet RAL 7016, UV-beständig nach ISO 12944-C4',
        risk: 'Medium',
        note: 'Powder coating requires external subcontractor processing (+4 working days).'
      },
      {
        id: 'diff-3',
        title: 'Penalty clause',
        category: 'penalty',
        status: '+ Added',
        revA: '– (Standard VOB/B delivery terms without delay penalty)',
        revB: '0.5% der Auftragssumme pro Werktag (Max. 5% Gesamtsumme bei Lieferverzug)',
        risk: 'Medium',
        note: 'Delay penalty added. Machining queue must have 3 days buffer reserved.'
      },
      {
        id: 'diff-4',
        title: 'Dimensional tolerance',
        category: 'tolerance',
        status: 'Changed',
        revA: 'ISO 2768-m (Medium tolerance +/- 0.2mm)',
        revB: 'ISO 2768-f (Fine tolerance +/- 0.05mm on bore locations H7)',
        risk: 'Low',
        note: 'Fine tolerance easily met on 5-Axis Hermle C42U.'
      },
      {
        id: 'diff-5',
        title: 'Inspection certificate',
        category: 'certificate',
        status: '+ Added',
        revA: 'Standard Werksprüfzeugnis 2.2',
        revB: 'Abnahmeprüfzeugnis EN 10204 3.1 mit Schmelzenanalyse',
        risk: 'Low',
        note: '3.1 mill test certificates available from metallurgical supplier.'
      },
      {
        id: 'diff-6',
        title: 'Express shipping clause',
        category: 'delivery',
        status: '- Removed',
        revA: 'Käufer trägt Luftfracht-Expresszuschlag bei Eillieferung',
        revB: '–',
        risk: 'Low',
        note: 'Removed standard freight surcharge clause.'
      }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    company_name: 'Redwood Industrial Corp.',
    industry: 'Industrial Equipment',
    tier: 'Tier 1',
    tax_id: 'US-94-2819201',
    phone: '+1 (415) 555-0192',
    billing_address: '400 Montgomery St, San Francisco, CA',
    shipping_address: '400 Montgomery St, Dock 2, San Francisco, CA',
    payment_terms: 'Net 30',
    credit_limit: 500000,
    status: 'Active',
    created_at: '2025-11-10T00:00:00Z',
  },
  {
    id: 'cust-02',
    company_name: 'Great Lakes Utilities',
    industry: 'Energy & Power',
    tier: 'Tier 1',
    tax_id: 'US-82-3928172',
    phone: '+1 (312) 555-0144',
    billing_address: '200 W Adams St, Chicago, IL',
    shipping_address: 'Substation Yard 4, Gary, IN',
    payment_terms: 'Net 45',
    credit_limit: 750000,
    status: 'Active',
    created_at: '2025-08-15T00:00:00Z',
  },
  {
    id: 'cust-03',
    company_name: 'Midwest Steel Works',
    industry: 'Metal Fabrication',
    tier: 'Tier 2',
    tax_id: 'US-38-1928374',
    phone: '+1 (216) 555-0182',
    billing_address: '1500 Industrial Pkwy, Cleveland, OH',
    shipping_address: '1500 Industrial Pkwy, Cleveland, OH',
    payment_terms: 'Net 30',
    credit_limit: 300000,
    status: 'Active',
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'cust-04',
    company_name: 'Rocky Mountain Brewing Co.',
    industry: 'Industrial Equipment',
    tier: 'Tier 2',
    tax_id: 'US-41-9283746',
    phone: '+1 (303) 555-0167',
    billing_address: '800 Canyon Ave, Boulder, CO',
    shipping_address: '800 Canyon Ave, Boulder, CO',
    payment_terms: 'Net 30',
    credit_limit: 350000,
    status: 'Active',
    created_at: '2025-09-04T00:00:00Z',
  },
  {
    id: 'cust-05',
    company_name: 'Apex Aerodynamics LLC',
    industry: 'Aerospace & Defense',
    tier: 'Tier 1',
    tax_id: 'US-20-4829103',
    phone: '+1 (206) 555-0142',
    billing_address: '8200 Boeing Access Rd, Seattle, WA',
    shipping_address: '8200 Boeing Access Rd, Seattle, WA',
    payment_terms: 'Net 45',
    credit_limit: 1000000,
    status: 'Active',
    created_at: '2025-06-12T00:00:00Z',
  },
  {
    id: 'cust-06',
    company_name: 'Vanguard Propulsion Systems',
    industry: 'Aerospace & Defense',
    tier: 'Tier 1',
    tax_id: 'US-31-8392019',
    phone: '+1 (310) 555-0189',
    billing_address: '1400 Rocket Rd, Hawthorne, CA',
    shipping_address: '1400 Rocket Rd, Hawthorne, CA',
    payment_terms: 'Net 30',
    credit_limit: 600000,
    status: 'Active',
    created_at: '2025-07-22T00:00:00Z',
  }
];

export const CUSTOMER_DISPLAY_ROWS = [
  {
    id: 'cust-01',
    initials: 'RI',
    name: 'Redwood Industrial Corp.',
    email: 'emily.carter@redwood-industrial.com',
    contact: 'Emily Carter',
    industry: 'Plant engineering',
    projects: 4,
    volume: 384500,
    status: 'Active' as const,
    phone: '+1 (415) 555-0192',
  },
  {
    id: 'cust-02',
    initials: 'GL',
    name: 'Great Lakes Utilities',
    email: 't.reynolds@greatlakes-utilities.com',
    contact: 'Dr. Thomas Reynolds',
    industry: 'Energy',
    projects: 2,
    volume: 498000,
    status: 'Existing' as const,
    phone: '+1 (312) 555-0144',
  },
  {
    id: 'cust-03',
    initials: 'MS',
    name: 'Midwest Steel Works',
    email: 's.miller@midweststeel.com',
    contact: 'Steven Miller',
    industry: 'Steel construction',
    projects: 1,
    volume: 224500,
    status: 'Lead' as const,
    phone: '+1 (216) 555-0182',
  },
  {
    id: 'cust-04',
    initials: 'RM',
    name: 'Rocky Mountain Brewing Co.',
    email: 'r.foster@rmbrewing.com',
    contact: 'Rachel Foster',
    industry: 'Food & beverage',
    projects: 3,
    volume: 246700,
    status: 'Active' as const,
    phone: '+1 (303) 555-0167',
  },
  {
    id: 'cust-05',
    initials: 'AA',
    name: 'Apex Aerodynamics LLC',
    email: 'r.sterling@apexaero-mfg.com',
    contact: 'Robert Sterling',
    industry: 'Aerospace & Defense',
    projects: 5,
    volume: 685000,
    status: 'Active' as const,
    phone: '+1 (206) 555-0142',
  },
  {
    id: 'cust-06',
    initials: 'VP',
    name: 'Vanguard Propulsion Systems',
    email: 'm.chen@vanguardpropulsion.com',
    contact: 'Marcus Chen',
    industry: 'Aerospace & Defense',
    projects: 3,
    volume: 426000,
    status: 'Active' as const,
    phone: '+1 (310) 555-0189',
  }
];

export const INITIAL_BIDS: BidItem[] = [
  {
    id: 'bid-001',
    bidNumber: 'BID-2026-081',
    customerName: 'Bauer Industries',
    projectName: 'Hall 4 HVAC Retrofit',
    contactName: 'Klaus Bauer',
    volume: 84500,
    status: 'Sent',
    openDays: 4,
    note: 'Decision expected by week 17',
    leadTimeWeeks: 4,
    version: 1,
    lineItemsCount: 3,
    materialId: 'AL-6061-T6',
    machineId: 'CNC-3AX-01',
    quantity: 120,
    unitPrice: 704.16,
  },
  {
    id: 'bid-002',
    bidNumber: 'BID-2026-082',
    customerName: 'Lake County Utilities',
    projectName: 'South Substation',
    contactName: 'Martin Cooper',
    volume: 142000,
    status: 'In negotiation',
    openDays: 11,
    note: 'Negotiated price reduction -3% offered',
    leadTimeWeeks: 6,
    version: 2,
    lineItemsCount: 5,
    materialId: 'SS-316L',
    machineId: 'CNC-5AX-01',
    quantity: 50,
    unitPrice: 2840.00,
  },
  {
    id: 'bid-003',
    bidNumber: 'BID-2026-083',
    customerName: 'Memmingen Regional Hospital',
    projectName: 'Plumbing Modernization',
    contactName: 'Dr. Andrea Berg',
    volume: 97200,
    status: 'Follow-up needed',
    openDays: 16,
    urgent: true,
    note: 'Pipeline aging > 14 days',
    leadTimeWeeks: 3,
    version: 1,
    lineItemsCount: 4,
    materialId: 'SS-316L',
    machineId: 'LATHE-LIVE-01',
    quantity: 80,
    unitPrice: 1215.00,
  },
  {
    id: 'bid-004',
    bidNumber: 'BID-2026-084',
    customerName: 'Ammersee Logistics',
    projectName: 'LED Warehouse Lighting',
    contactName: 'Hans Lindner',
    volume: 41800,
    status: 'Sent',
    openDays: 6,
    note: 'In customer steering committee',
    leadTimeWeeks: 2,
    version: 1,
    lineItemsCount: 2,
    materialId: 'AL-6061-T6',
    machineId: 'CNC-3AX-01',
    quantity: 200,
    unitPrice: 209.00,
  },
  {
    id: 'bid-005',
    bidNumber: 'BID-2026-085',
    customerName: 'Apex Aerodynamics LLC',
    projectName: 'Commercial Jet Wing Actuator Flange',
    contactName: 'Robert Sterling',
    volume: 68500,
    status: 'Accepted',
    openDays: 2,
    note: 'AS9100 CMM inspection verified & approved',
    leadTimeWeeks: 4,
    version: 1,
    lineItemsCount: 1,
    materialId: 'AL-6061-T6',
    machineId: 'CNC-5AX-01',
    quantity: 250,
    unitPrice: 274.00,
  },
  {
    id: 'bid-006',
    bidNumber: 'BID-2026-086',
    customerName: 'Vanguard Propulsion Systems',
    projectName: 'Rocket Engine Gimbal Mount',
    contactName: 'Marcus Chen',
    volume: 142000,
    status: 'Sent',
    openDays: 10,
    note: 'Titanium billet sourcing secured',
    leadTimeWeeks: 5,
    version: 1,
    lineItemsCount: 1,
    materialId: 'TI-6AL-4V',
    machineId: 'CNC-5AX-01',
    quantity: 50,
    unitPrice: 2840.00,
  }
];

export const TOP_SALES_REPS: SalesRep[] = [
  { id: 'rep-1', name: 'Markus Weber', deals: 18, volume: 1210000, avgMargin: 19 },
  { id: 'rep-2', name: 'Eva Lindner', deals: 14, volume: 684000, avgMargin: 22 },
  { id: 'rep-3', name: 'Felix Kraus', deals: 9, volume: 542000, avgMargin: 21 },
  { id: 'rep-4', name: 'Sandra Vogel', deals: 6, volume: 393000, avgMargin: 20 },
];

export const RECENTLY_WON_JOBS: WonDeal[] = [
  {
    id: 'deal-01',
    customerName: 'Hofbräu Kempten',
    projectName: 'Brewery cooling system',
    volume: 56700,
    margin: 21,
    source: 'Existing',
    salesRep: 'Markus Weber',
    closedDate: '04/08/2025',
  },
  {
    id: 'deal-02',
    customerName: 'Bauer GmbH',
    projectName: 'Conveyor belt hall 2',
    volume: 112400,
    margin: 18,
    source: 'Existing',
    salesRep: 'Eva Lindner',
    closedDate: '04/02/2025',
  },
  {
    id: 'deal-03',
    customerName: 'Stadtwerke Lindau',
    projectName: 'Medium-voltage distribution',
    volume: 298000,
    margin: 16,
    source: 'Tender',
    salesRep: 'Markus Weber',
    closedDate: '03/21/2025',
  },
  {
    id: 'deal-04',
    customerName: 'Wohnbau Allgäu',
    projectName: 'Heating plant phase I',
    volume: 184300,
    margin: 23,
    source: 'Referral',
    salesRep: 'Felix Kraus',
    closedDate: '03/14/2025',
  },
  {
    id: 'deal-05',
    customerName: 'Logistik Ammersee',
    projectName: 'Gate drives',
    volume: 38900,
    margin: 27,
    source: 'Existing',
    salesRep: 'Eva Lindner',
    closedDate: '03/05/2025',
  },
];

export const ANALYTICS_CUSTOMERS: CustomerAnalyticsItem[] = [
  {
    id: 'an-1',
    customerName: 'Kessler Metall',
    revenueYtd: 91000,
    sharePercent: 29,
    trend: [12, 14, 15, 15, 17, 18],
    trendType: 'up',
    deltaYoy: 14,
    actionType: 'Detail',
    actionColor: 'slate',
  },
  {
    id: 'an-2',
    customerName: 'TechFab AG',
    revenueYtd: 74000,
    sharePercent: 24,
    trend: [18, 16, 14, 13, 11, 8],
    trendType: 'down',
    deltaYoy: -18,
    actionType: 'Fix',
    actionColor: 'rose',
  },
  {
    id: 'an-3',
    customerName: 'MeierBau GmbH',
    revenueYtd: 48000,
    sharePercent: 15,
    trend: [6, 7, 8, 9, 11, 13],
    trendType: 'up',
    deltaYoy: 22,
    actionType: 'Grow',
    actionColor: 'navy',
  },
  {
    id: 'an-4',
    customerName: 'Vogel Elektro',
    revenueYtd: 42000,
    sharePercent: 13,
    trend: [7, 7, 7, 8, 8, 9],
    trendType: 'up',
    deltaYoy: 7,
    actionType: 'Detail',
    actionColor: 'slate',
  },
  {
    id: 'an-5',
    customerName: 'Braun Maschinenbau',
    revenueYtd: 31000,
    sharePercent: 10,
    trend: [8, 8, 7, 6, 6, 5],
    trendType: 'down',
    deltaYoy: -3,
    actionType: 'Detail',
    actionColor: 'slate',
  },
];

export const CHURN_RISK_SIGNALS: ChurnSignal[] = [
  {
    id: 'sig-1',
    customerName: 'TechFab AG',
    signal: '-18% Bestellungen, 68-Tage-Lücke',
    actionText: 'Re-engage',
    actionType: 're-engage',
  },
  {
    id: 'sig-2',
    customerName: 'Braun Maschinenbau',
    signal: 'Ø Bestellgröße -24%',
    actionText: 'Upsell',
    actionType: 'upsell',
  },
];

export const DEFAULT_SETTINGS: PricingSettings = {
  id: 'settings-01',
  shop_name: 'Precision AeroMachining GmbH',
  default_overhead_percent: 15.0,
  default_margin_percent: 25.0,
  default_scrap_percent: 10.0,
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

export const INITIAL_MATERIALS: Material[] = [
  { id: 'AL-6061-T6', code: 'AL-6061-T6', name: 'Aluminum 6061-T6 (Aerospace Grade)', category: 'Aluminum', density_g_cm3: 2.70, cost_per_kg: 7.80, machinability_rating: 1.00, stock_status: 'In Stock', scrap_credit_per_kg: 1.50, created_at: '2026-01-01' },
  { id: 'AL-7075-T651', code: 'AL-7075-T651', name: 'Aluminum 7075-T651 (High-Strength Aircraft)', category: 'Aluminum', density_g_cm3: 2.81, cost_per_kg: 14.20, machinability_rating: 0.85, stock_status: 'In Stock', scrap_credit_per_kg: 1.80, created_at: '2026-01-01' },
  { id: 'SS-316L', code: 'SS-316L', name: 'Stainless Steel 316L (Medical / Marine V4A)', category: 'Stainless Steel', density_g_cm3: 8.00, cost_per_kg: 12.50, machinability_rating: 0.55, stock_status: 'In Stock', scrap_credit_per_kg: 2.10, created_at: '2026-01-01' },
  { id: 'TI-6AL-4V', code: 'TI-6AL-4V', name: 'Titanium Grade 5 (Ti-6Al-4V)', category: 'Titanium', density_g_cm3: 4.43, cost_per_kg: 62.00, machinability_rating: 0.35, stock_status: 'Available on Order', scrap_credit_per_kg: 8.50, created_at: '2026-01-01' },
  { id: 'STEEL-4140', code: 'STEEL-4140', name: 'Alloy Steel 4140 (Pre-hardened QT)', category: 'Alloy Steel', density_g_cm3: 7.85, cost_per_kg: 6.20, machinability_rating: 0.70, stock_status: 'In Stock', scrap_credit_per_kg: 0.80, created_at: '2026-01-01' },
  { id: 'PLASTIC-PEEK', code: 'PLASTIC-PEEK', name: 'Virgin PEEK (Polyetheretherketone)', category: 'Engineering Plastic', density_g_cm3: 1.32, cost_per_kg: 115.00, machinability_rating: 1.10, stock_status: 'Lead Time 2 Weeks', scrap_credit_per_kg: 0.00, created_at: '2026-01-01' },
];

export const INITIAL_MACHINES: Machine[] = [
  { id: 'CNC-5AX-01', code: 'CNC-5AX-01', name: 'Hermle C42U 5-Axis Machining Center', type: '5-Axis CNC Mill', hourly_rate: 165.00, setup_rate: 120.00, max_part_dimensions: '800 x 800 x 550 mm', tolerance_rating: '+/- 0.003 mm', status: 'Operational', created_at: '2026-01-01' },
  { id: 'CNC-3AX-01', code: 'CNC-3AX-01', name: 'Haas VF-4SS Super Speed Vertical Mill', type: '3-Axis CNC Mill', hourly_rate: 95.00, setup_rate: 75.00, max_part_dimensions: '1270 x 660 x 635 mm', tolerance_rating: '+/- 0.010 mm', status: 'Operational', created_at: '2026-01-01' },
  { id: 'LATHE-LIVE-01', code: 'LATHE-LIVE-01', name: 'Mazak Integrex i-200H Multi-Tasking Lathe', type: 'CNC Lathe with Live Tooling', hourly_rate: 135.00, setup_rate: 95.00, max_part_dimensions: 'Dia 658 x 1011 mm', tolerance_rating: '+/- 0.005 mm', status: 'Operational', created_at: '2026-01-01' },
  { id: 'EDM-WIRE-01', code: 'EDM-WIRE-01', name: 'Mitsubishi MV2400-S Wire EDM', type: 'Wire EDM', hourly_rate: 110.00, setup_rate: 85.00, max_part_dimensions: '600 x 400 x 310 mm', tolerance_rating: '+/- 0.002 mm', status: 'Operational', created_at: '2026-01-01' },
  { id: 'LASER-FIBER-01', code: 'LASER-FIBER-01', name: 'Amada Ensis 3015AJ 6kW Fiber Laser', type: 'Fiber Laser Cutter', hourly_rate: 140.00, setup_rate: 60.00, max_part_dimensions: '3000 x 1500 mm Plate', tolerance_rating: '+/- 0.050 mm', status: 'Operational', created_at: '2026-01-01' },
];

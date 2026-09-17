import { create } from 'zustand';
import { 
  RevisionCheck, BidItem, CustomerAnalyticsItem, 
  INITIAL_REVISION_CHECKS, INITIAL_BIDS, CUSTOMER_DISPLAY_ROWS,
  ANALYTICS_CUSTOMERS, DEFAULT_SETTINGS, INITIAL_MATERIALS, INITIAL_MACHINES
} from './initialData';
import { Customer, Material, Machine, PricingSettings } from '../types/database';

export type NavTab = 
  | 'dashboard'
  | 'revision-check'
  | 'customers'
  | 'bids'
  | 'deals'
  | 'analytics'
  | 'settings';

export interface AppStore {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Modules
  activeModule: 'sales' | 'purchasing';
  setActiveModule: (m: 'sales' | 'purchasing') => void;

  // Global search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Language & Units
  language: 'EN' | 'DE';
  setLanguage: (lang: 'EN' | 'DE') => void;
  units: 'metric' | 'imperial';
  setUnits: (u: 'metric' | 'imperial') => void;

  // Data
  revisions: RevisionCheck[];
  activeRevisionId: string;
  setActiveRevisionId: (id: string) => void;
  addRevisionCheck: (check: RevisionCheck) => void;

  customers: typeof CUSTOMER_DISPLAY_ROWS;
  addCustomer: (cust: (typeof CUSTOMER_DISPLAY_ROWS)[0]) => void;

  bids: BidItem[];
  addBid: (bid: BidItem) => void;
  updateBidStatus: (id: string, status: BidItem['status']) => void;
  duplicateBid: (id: string) => void;
  versionBid: (id: string) => void;

  analyticsCustomers: CustomerAnalyticsItem[];
  updateAnalyticsCustomerDelta: (id: string, newDelta: number) => void;

  settings: PricingSettings;
  updateSettings: (s: Partial<PricingSettings>) => void;

  materials: Material[];
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  addMaterial: (m: Material) => void;

  machines: Machine[];
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  addMachine: (m: Machine) => void;

  // Quote Builder modal
  isQuoteModalOpen: boolean;
  openQuoteModal: (bidId?: string) => void;
  closeQuoteModal: () => void;
  selectedBidForModal?: BidItem;

  // New Revision Check modal
  isNewCheckModalOpen: boolean;
  openNewCheckModal: () => void;
  closeNewCheckModal: () => void;

  // New Customer modal
  isNewCustomerModalOpen: boolean;
  openNewCustomerModal: () => void;
  closeNewCustomerModal: () => void;

  // Global notifications
  notifications: Array<{ id: string; title: string; time: string; read: boolean }>;
  markNotificationsRead: () => void;
  showNotificationTray: boolean;
  setShowNotificationTray: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  activeModule: 'sales',
  setActiveModule: (m) => set({ activeModule: m }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  language: 'EN',
  setLanguage: (lang) => set({ language: lang }),
  units: 'metric',
  setUnits: (u) => set({ units: u }),

  revisions: INITIAL_REVISION_CHECKS,
  activeRevisionId: 'rev-001',
  setActiveRevisionId: (id) => set({ activeRevisionId: id }),
  addRevisionCheck: (check) => set((state) => ({ 
    revisions: [check, ...state.revisions],
    activeRevisionId: check.id 
  })),

  customers: CUSTOMER_DISPLAY_ROWS,
  addCustomer: (cust) => set((state) => ({ 
    customers: [cust, ...state.customers] 
  })),

  bids: INITIAL_BIDS,
  addBid: (bid) => set((state) => ({
    bids: [bid, ...state.bids]
  })),
  updateBidStatus: (id, status) => set((state) => ({
    bids: state.bids.map(b => b.id === id ? { ...b, status } : b)
  })),
  duplicateBid: (id) => set((state) => {
    const orig = state.bids.find(b => b.id === id);
    if (!orig) return state;
    const newBid: BidItem = {
      ...orig,
      id: `bid-${Date.now()}`,
      bidNumber: `BID-2026-${String(state.bids.length + 80).padStart(3, '0')}`,
      status: 'Draft',
      openDays: 1,
      version: 1,
      projectName: `${orig.projectName} (Copy)`,
    };
    return { bids: [newBid, ...state.bids] };
  }),
  versionBid: (id) => set((state) => {
    const orig = state.bids.find(b => b.id === id);
    if (!orig) return state;
    const nextVer = (orig.version || 1) + 1;
    const versioned: BidItem = {
      ...orig,
      id: `bid-${Date.now()}`,
      bidNumber: `${orig.bidNumber}-v${nextVer}`,
      version: nextVer,
      status: 'Draft',
      openDays: 0,
      note: `Updated iteration v${nextVer} from ${orig.bidNumber}`,
    };
    return { bids: [versioned, ...state.bids] };
  }),

  analyticsCustomers: ANALYTICS_CUSTOMERS,
  updateAnalyticsCustomerDelta: (id, newDelta) => set((state) => ({
    analyticsCustomers: state.analyticsCustomers.map(c => c.id === id ? { ...c, deltaYoy: newDelta } : c)
  })),

  settings: DEFAULT_SETTINGS,
  updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

  materials: INITIAL_MATERIALS,
  updateMaterial: (id, updates) => set((state) => ({
    materials: state.materials.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  addMaterial: (m) => set((state) => ({ materials: [...state.materials, m] })),

  machines: INITIAL_MACHINES,
  updateMachine: (id, updates) => set((state) => ({
    machines: state.machines.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  addMachine: (m) => set((state) => ({ machines: [...state.machines, m] })),

  isQuoteModalOpen: false,
  selectedBidForModal: undefined,
  openQuoteModal: (bidId) => set((state) => {
    const bid = bidId ? state.bids.find(b => b.id === bidId) : undefined;
    return { isQuoteModalOpen: true, selectedBidForModal: bid };
  }),
  closeQuoteModal: () => set({ isQuoteModalOpen: false, selectedBidForModal: undefined }),

  isNewCheckModalOpen: false,
  openNewCheckModal: () => set({ isNewCheckModalOpen: true }),
  closeNewCheckModal: () => set({ isNewCheckModalOpen: false }),

  isNewCustomerModalOpen: false,
  openNewCustomerModal: () => set({ isNewCustomerModalOpen: true }),
  closeNewCustomerModal: () => set({ isNewCustomerModalOpen: false }),

  notifications: [
    { id: 'notif-1', title: 'New RFQ received from Memmingen Hospital (RFQ-2026-92)', time: '12m ago', read: false },
    { id: 'notif-2', title: 'Lake County Utilities requested 3% price adjustment', time: '1h ago', read: false },
    { id: 'notif-3', title: 'Revision comparison finished for Projektanfrage RFQ B.pdf', time: '2h ago', read: true },
  ],
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  showNotificationTray: false,
  setShowNotificationTray: (open) => set({ showNotificationTray: open }),
}));

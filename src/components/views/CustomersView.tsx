import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Building2
} from 'lucide-react';
import { useAppStore } from '../../data/useAppStore';

export const CustomersView: React.FC = () => {
  const { 
    customers, 
    addCustomer,
    isNewCustomerModalOpen,
    openNewCustomerModal,
    closeNewCustomerModal
  } = useAppStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof customers)[0] | null>(null);

  // New customer form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newIndustry, setNewIndustry] = useState('Plant engineering');
  const [newPhone, setNewPhone] = useState('+1 (555) 000-1122');
  const [newVolume, setNewVolume] = useState(150000);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.contact.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.industry.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const initials = newCompanyName
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() || '')
      .join('');

    const newCust = {
      id: `cust-${Date.now()}`,
      initials: initials || 'CO',
      name: newCompanyName,
      email: newEmail || `info@${newCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      contact: newContact || 'Direct Procurement',
      industry: newIndustry,
      projects: 1,
      volume: Number(newVolume) || 50000,
      status: 'Active' as const,
      phone: newPhone,
    };

    addCustomer(newCust);
    closeNewCustomerModal();
    setNewCompanyName('');
    setNewEmail('');
    setNewContact('');
  };

  return (
    <div id="customers-view" className="space-y-6">
      {/* Header section matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customer management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Master data, contacts and award volume for every customer.
          </p>
        </div>

        {/* Right side search and + New Customer button */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-56 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="customer-search-input"
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <button
            id="btn-new-customer"
            onClick={openNewCustomerModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New customer</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total customers */}
        <div 
          id="metric-total-customers"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Total customers</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">48</span>
          </div>
        </div>

        {/* Card 2: Active projects */}
        <div 
          id="metric-active-projects"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Active projects</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">19</span>
          </div>
        </div>

        {/* Card 3: Pipeline volume */}
        <div 
          id="metric-pipeline-volume"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">Pipeline volume</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">$3.34M</span>
          </div>
        </div>

        {/* Card 4: New in 30 days */}
        <div 
          id="metric-new-in-30-days"
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500">New in 30 days</span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">5</span>
          </div>
        </div>
      </div>

      {/* Main Table: Customer list matching screenshot */}
      <div 
        id="card-customer-list"
        className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Customer list
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Contact</th>
                <th className="py-3.5 px-6">Industry</th>
                <th className="py-3.5 px-6 text-center">Projects</th>
                <th className="py-3.5 px-6">Volume</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-center">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => {
                const isLead = cust.status === 'Lead';
                const isExisting = cust.status === 'Existing';
                const isActive = cust.status === 'Active';

                return (
                  <tr 
                    key={cust.id} 
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    {/* Customer (Initials avatar + Name + Email) */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {cust.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 hover:text-blue-700 transition-colors">
                            {cust.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {cust.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-6 text-slate-700 font-medium">
                      {cust.contact}
                    </td>

                    {/* Industry */}
                    <td className="py-3.5 px-6 text-slate-500">
                      {cust.industry}
                    </td>

                    {/* Projects */}
                    <td className="py-3.5 px-6 text-center font-semibold text-slate-800">
                      {cust.projects}
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      ${cust.volume.toLocaleString()}
                    </td>

                    {/* Status Badge matching screenshot */}
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isActive
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                          : isExisting
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {cust.status}
                      </span>
                    </td>

                    {/* Contact Action Icons */}
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <a 
                          href={`mailto:${cust.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title={`Email ${cust.contact}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        <a 
                          href={`tel:${cust.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                          title={`Call ${cust.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div 
          id="modal-new-customer"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={closeNewCustomerModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              Create New Customer Account
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add industrial client master data, sourcing contact, and credit terms.
            </p>

            <form onSubmit={handleCreateCustomer} className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Pratt & Whitney Turbines GmbH"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Contact</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="s.connor@company.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option>Plant engineering</option>
                    <option>Energy</option>
                    <option>Steel construction</option>
                    <option>Food & beverage</option>
                    <option>Aerospace & Defense</option>
                    <option>Automotive</option>
                    <option>Medical Devices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Volume ($)</label>
                  <input
                    type="number"
                    value={newVolume}
                    onChange={(e) => setNewVolume(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeNewCustomerModal}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer 360 Detail Drawer / Modal */}
      {selectedCustomer && (
        <div 
          id="modal-customer-detail"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {selectedCustomer.initials}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedCustomer.industry} · {selectedCustomer.status}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Primary Contact</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{selectedCustomer.contact}</span>
                <span className="text-slate-500 mt-0.5 block">{selectedCustomer.email}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Cumulative Volume</span>
                <span className="font-bold text-slate-900 text-base mt-0.5 block">
                  ${selectedCustomer.volume.toLocaleString()}
                </span>
                <span className="text-slate-500 mt-0.5 block">{selectedCustomer.projects} active projects</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

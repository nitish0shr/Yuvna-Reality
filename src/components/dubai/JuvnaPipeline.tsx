import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { DealStage } from '../../types/realEstate';
import {
  Kanban,
  Plus,
  MoreVertical,
  Clock,
  AlertTriangle,
  TrendingUp,
  Phone,
  Calendar,
  CheckCircle,
  X,
  Building2,
  Inbox,
  Users,
  BarChart3,
  LogOut
} from 'lucide-react';

import { YuvnaLogoAgent } from './YuvnaLogo';

interface MockDeal {
  id: string;
  buyerName: string;
  buyerInitial: string;
  country: string;
  budget: number;
  stage: DealStage;
  daysInStage: number;
  dropOffRisk: 'low' | 'medium' | 'high';
  persona: string;
  suggestedAction: string;
}

const mockDeals: MockDeal[] = [
  { id: '1', buyerName: 'Ahmed Al-Rashid', buyerInitial: 'A', country: 'UAE', budget: 1500000, stage: 'qualified', daysInStage: 3, dropOffRisk: 'low', persona: 'yield-investor', suggestedAction: 'Schedule property viewing' },
  { id: '2', buyerName: 'Sarah Thompson', buyerInitial: 'S', country: 'UK', budget: 2500000, stage: 'advisory', daysInStage: 5, dropOffRisk: 'medium', persona: 'visa-driven', suggestedAction: 'Follow up on Golden Visa requirements' },
  { id: '3', buyerName: 'Raj Patel', buyerInitial: 'R', country: 'India', budget: 800000, stage: 'site-visit', daysInStage: 2, dropOffRisk: 'low', persona: 'capital-investor', suggestedAction: 'Prepare offer package' },
  { id: '4', buyerName: 'Maria Garcia', buyerInitial: 'M', country: 'Spain', budget: 3000000, stage: 'new', daysInStage: 1, dropOffRisk: 'high', persona: 'lifestyle', suggestedAction: 'Initial outreach call' },
  { id: '5', buyerName: 'James Wilson', buyerInitial: 'J', country: 'US', budget: 1800000, stage: 'booking', daysInStage: 1, dropOffRisk: 'low', persona: 'yield-investor', suggestedAction: 'Confirm deposit transfer' },
];

const stages: { id: DealStage; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-slate-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
  { id: 'advisory', label: 'Advisory', color: 'bg-purple-500' },
  { id: 'site-visit', label: 'Site Visit', color: 'bg-[#E07F26]' },
  { id: 'booking', label: 'Booking', color: 'bg-green-500' },
  { id: 'closed-won', label: 'Closed Won', color: 'bg-green-600' },
];

export function JuvnaPipeline() {
  const { setView } = useRealEstateStore();
  const [deals] = useState(mockDeals);
  const [selectedDeal, setSelectedDeal] = useState<MockDeal | null>(null);

  const formatMoney = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getTotalValue = (stage: DealStage): number => {
    return deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.budget, 0);
  };

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: 3 },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'leads', label: 'All Leads', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E8E4E0] flex flex-col">
        <div className="p-6 border-b border-[#E8E4E0]">
          <YuvnaLogoAgent />
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'inbox') setView('agent-inbox');
                  if (item.id === 'leads') setView('agent-leads');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  item.id === 'pipeline' ? 'bg-[#E07F26]/10 text-[#E07F26]' : 'text-[#5a4a3f] hover:bg-[#F5F3F1]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.badge && <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">{item.badge}</span>}
              </button>
            ))}
          </div>
        </nav>
        <div className="p-4 border-t border-[#E8E4E0]">
          <button onClick={() => setView('landing')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#5a4a3f] hover:bg-[#F5F3F1] transition-all">
            <LogOut className="w-5 h-5" /> Exit to Main Site
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-[#E8E4E0] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-[#3D2D22] flex items-center gap-3">
                <Kanban className="w-6 h-6 text-[#E07F26]" />
                Deal Pipeline
              </h1>
              <p className="text-[#7a6a5f] text-sm mt-1">
                {deals.length} active deals · {formatMoney(deals.reduce((sum, d) => sum + d.budget, 0))} total value
              </p>
            </div>
            <button className="px-4 py-2.5 rounded-lg bg-[#E07F26] text-white font-semibold text-sm flex items-center gap-2 hover:bg-[#c96e1f] transition-all">
              <Plus className="w-5 h-5" /> New Deal
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {stages.map((stage) => {
              const stageDeals = deals.filter(d => d.stage === stage.id);
              const stageValue = getTotalValue(stage.id);
              
              return (
                <div key={stage.id} className="w-80 flex flex-col bg-white rounded-xl border border-[#E8E4E0]">
                  <div className="p-4 border-b border-[#E8E4E0]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <span className="font-semibold text-[#3D2D22]">{stage.label}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#F5F3F1] text-[#7a6a5f] text-xs">{stageDeals.length}</span>
                      </div>
                      <button className="p-1 hover:bg-[#F5F3F1] rounded-lg"><MoreVertical className="w-4 h-4 text-[#7a6a5f]" /></button>
                    </div>
                    <div className="text-sm text-[#7a6a5f]">{formatMoney(stageValue)} total</div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {stageDeals.map((deal) => (
                      <motion.div
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        className="p-4 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0] cursor-pointer hover:border-[#E07F26]/50 hover:shadow-md transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] font-semibold">
                            {deal.buyerInitial}
                          </div>
                          <div>
                            <div className="font-medium text-[#3D2D22] text-sm">{deal.buyerName}</div>
                            <div className="text-xs text-[#7a6a5f]">{deal.country}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-serif font-semibold text-[#3D2D22]">{formatMoney(deal.budget)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            deal.dropOffRisk === 'high' ? 'bg-red-100 text-red-700' :
                            deal.dropOffRisk === 'medium' ? 'bg-[#E07F26]/10 text-[#E07F26]' : 'bg-green-100 text-green-700'
                          }`}>
                            {deal.dropOffRisk === 'high' ? 'At Risk' : deal.dropOffRisk === 'medium' ? 'Monitor' : 'On Track'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#7a6a5f]">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{deal.daysInStage}d in stage</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[#E8E4E0]">
                          <div className="flex items-center gap-2 text-xs text-[#E07F26]">
                            <Building2 className="w-3.5 h-3.5" />
                            {deal.suggestedAction}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {stageDeals.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#F5F3F1] flex items-center justify-center mb-3">
                          <Building2 className="w-6 h-6 text-[#E8E4E0]" />
                        </div>
                        <p className="text-[#9a8a7f] text-sm">No deals in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/50" onClick={() => setSelectedDeal(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-[500px] h-full bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-[#E8E4E0] p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] text-xl font-semibold">
                    {selectedDeal.buyerInitial}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-[#3D2D22]">{selectedDeal.buyerName}</h2>
                    <div className="text-sm text-[#7a6a5f]">{selectedDeal.country}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedDeal(null)} className="p-2 hover:bg-[#F5F3F1] rounded-lg"><X className="w-5 h-5 text-[#7a6a5f]" /></button>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-[#E07F26]/5 border border-[#E07F26]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#7a6a5f] mb-1">Deal Value</div>
                      <div className="text-3xl font-serif font-bold text-[#3D2D22]">{formatMoney(selectedDeal.budget)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#7a6a5f] mb-1">Stage</div>
                      <div className="text-lg font-semibold text-[#E07F26]">{stages.find(s => s.id === selectedDeal.stage)?.label}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 rounded-lg border border-[#E8E4E0] text-[#3D2D22] font-medium flex items-center justify-center gap-2 hover:border-[#E07F26] transition-all">
                    <Phone className="w-4 h-4" /> Call
                  </button>
                  <button className="flex-1 py-3 rounded-lg border border-[#E8E4E0] text-[#3D2D22] font-medium flex items-center justify-center gap-2 hover:border-[#E07F26] transition-all">
                    <Calendar className="w-4 h-4" /> Schedule
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">AI Suggestion</h3>
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">{selectedDeal.suggestedAction}</span>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors mt-2">Take Action</button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">Risk Assessment</h3>
                  <div className={`p-4 rounded-xl ${
                    selectedDeal.dropOffRisk === 'high' ? 'bg-red-50 border border-red-200' :
                    selectedDeal.dropOffRisk === 'medium' ? 'bg-[#E07F26]/5 border border-[#E07F26]/20' : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedDeal.dropOffRisk === 'high' ? <AlertTriangle className="w-5 h-5 text-red-600" /> : 
                       selectedDeal.dropOffRisk === 'medium' ? <AlertTriangle className="w-5 h-5 text-[#E07F26]" /> :
                       <TrendingUp className="w-5 h-5 text-green-600" />}
                      <span className={`font-semibold ${
                        selectedDeal.dropOffRisk === 'high' ? 'text-red-700' :
                        selectedDeal.dropOffRisk === 'medium' ? 'text-[#E07F26]' : 'text-green-700'
                      }`}>
                        {selectedDeal.dropOffRisk === 'high' ? 'High Risk' : selectedDeal.dropOffRisk === 'medium' ? 'Medium Risk' : 'Low Risk'}
                      </span>
                    </div>
                    <p className="text-sm text-[#5a4a3f]">
                      {selectedDeal.dropOffRisk === 'high' ? 'This deal needs immediate attention.' :
                       selectedDeal.dropOffRisk === 'medium' ? 'Monitor closely for engagement.' : 'Deal is progressing well.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


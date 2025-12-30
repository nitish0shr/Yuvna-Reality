import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { BuyerProfile, LeadScore } from '../../types/realEstate';
import {
  Users,
  Search,
  Download,
  Upload,
  TrendingUp,
  Clock,
  Phone,
  Mail,
  Eye,
  MessageSquare,
  Flame,
  ThermometerSun,
  Snowflake,
  Inbox,
  Kanban,
  BarChart3,
  LogOut,
  Target
} from 'lucide-react';

import { YuvnaLogoAgent } from './YuvnaLogo';

const mockBuyers: BuyerProfile[] = [
  { id: '1', firstName: 'Ahmed', lastName: 'Al-Rashid', email: 'ahmed@email.com', phone: '+971501234567', country: 'UAE', language: 'en', currency: 'AED', timezone: 'Asia/Dubai', persona: 'yield-investor', personaConfidence: 85, goal: 'investment', budgetBand: '1m-2m', urgencyScore: 85, leadScore: 'ready-to-call', engagementScore: 78, riskTolerance: 'moderate', investmentHorizon: '3-5-years', source: 'onboarding-widget', consentMarketing: true, consentWhatsApp: true, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date() },
  { id: '2', firstName: 'Sarah', lastName: 'Thompson', email: 'sarah.t@email.com', phone: '+447891234567', country: 'UK', language: 'en', currency: 'GBP', timezone: 'Europe/London', persona: 'visa-driven', personaConfidence: 90, goal: 'visa', budgetBand: '2m-5m', urgencyScore: 72, leadScore: 'hot', engagementScore: 65, riskTolerance: 'conservative', investmentHorizon: '5-10-years', source: 'partner-referral', consentMarketing: true, consentWhatsApp: false, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: '3', firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@email.com', country: 'India', language: 'en', currency: 'INR', timezone: 'Asia/Kolkata', persona: 'capital-investor', personaConfidence: 75, goal: 'investment', budgetBand: '500k-1m', urgencyScore: 45, leadScore: 'warm', engagementScore: 42, riskTolerance: 'aggressive', investmentHorizon: '3-5-years', source: 'csv-upload', consentMarketing: true, consentWhatsApp: true, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: '4', firstName: 'Maria', lastName: 'Garcia', email: 'maria.g@email.com', country: 'EU', language: 'en', currency: 'EUR', timezone: 'Europe/Madrid', persona: 'lifestyle', personaConfidence: 80, goal: 'lifestyle', budgetBand: '2m-5m', urgencyScore: 30, leadScore: 'cold', engagementScore: 25, riskTolerance: 'conservative', investmentHorizon: '5-10-years', source: 'linkedin', consentMarketing: true, consentWhatsApp: false, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: '5', firstName: 'James', lastName: 'Wilson', email: 'james.w@email.com', phone: '+14155551234', country: 'US', language: 'en', currency: 'USD', timezone: 'America/New_York', persona: 'yield-investor', personaConfidence: 88, goal: 'investment', budgetBand: '1m-2m', urgencyScore: 92, leadScore: 'ready-to-call', engagementScore: 88, riskTolerance: 'moderate', investmentHorizon: '5-10-years', source: 'onboarding-widget', consentMarketing: true, consentWhatsApp: true, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date() },
];

const LeadScoreBadge = ({ score }: { score: LeadScore }) => {
  const config: Record<LeadScore, { icon: any; label: string; class: string }> = {
    'ready-to-call': { icon: Flame, label: 'Ready', class: 'bg-red-100 text-red-700 border-red-200' },
    'hot': { icon: ThermometerSun, label: 'Hot', class: 'bg-orange-100 text-orange-700 border-orange-200' },
    'warm': { icon: TrendingUp, label: 'Warm', class: 'bg-[#E07F26]/10 text-[#E07F26] border-[#E07F26]/20' },
    'cold': { icon: Snowflake, label: 'Cold', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  };
  const { icon: Icon, label, class: className } = config[score];
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}><Icon className="w-3.5 h-3.5" />{label}</span>;
};

const getTimeAgo = (date: Date): string => {
  const hours = Math.floor((new Date().getTime() - date.getTime()) / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export function JuvnaLeads() {
  const { setView } = useRealEstateStore();
  const [buyers] = useState<BuyerProfile[]>(mockBuyers);
  const [filterScore, setFilterScore] = useState<LeadScore | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'budget'>('score');

  const filteredBuyers = buyers.filter(buyer => {
    if (filterScore !== 'all' && buyer.leadScore !== filterScore) return false;
    if (searchQuery && !`${buyer.firstName} ${buyer.lastName} ${buyer.email}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
    if (sortBy === 'score') {
      const priority: Record<LeadScore, number> = { 'ready-to-call': 0, 'hot': 1, 'warm': 2, 'cold': 3 };
      return priority[a.leadScore] - priority[b.leadScore];
    }
    if (sortBy === 'recent') return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
    const budgetOrder: Record<string, number> = { '5m-plus': 0, '2m-5m': 1, '1m-2m': 2, '500k-1m': 3, 'under-500k': 4 };
    return (budgetOrder[a.budgetBand] || 5) - (budgetOrder[b.budgetBand] || 5);
  });

  const stats = [
    { label: 'Total Leads', value: buyers.length, icon: Users, color: 'text-blue-600' },
    { label: 'Ready to Call', value: buyers.filter(b => b.leadScore === 'ready-to-call').length, icon: Flame, color: 'text-red-600' },
    { label: 'Hot Leads', value: buyers.filter(b => b.leadScore === 'hot').length, icon: ThermometerSun, color: 'text-orange-600' },
    { label: 'Conversion Rate', value: '18%', icon: TrendingUp, color: 'text-green-600' },
  ];

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
        <div className="p-6 border-b border-[#E8E4E0]"><YuvnaLogoAgent /></div>
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => {
                if (item.id === 'inbox') setView('agent-inbox');
                if (item.id === 'pipeline') setView('agent-pipeline');
              }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${item.id === 'leads' ? 'bg-[#E07F26]/10 text-[#E07F26]' : 'text-[#5a4a3f] hover:bg-[#F5F3F1]'}`}>
                <item.icon className="w-5 h-5" />{item.label}
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-[#3D2D22] flex items-center gap-3">
                <Users className="w-6 h-6 text-[#E07F26]" /> All Leads
              </h1>
              <p className="text-[#7a6a5f] text-sm mt-1">Manage and track all your leads</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2.5 rounded-lg border border-[#E8E4E0] text-[#3D2D22] font-medium text-sm flex items-center gap-2 hover:border-[#E07F26] transition-all">
                <Download className="w-4 h-4" /> Export
              </button>
              <button className="px-4 py-2.5 rounded-lg bg-[#E07F26] text-white font-semibold text-sm flex items-center gap-2 hover:bg-[#c96e1f] transition-all">
                <Upload className="w-4 h-4" /> Import CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-serif font-bold text-[#3D2D22]">{stat.value}</div>
                    <div className="text-xs text-[#7a6a5f]">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </header>

        <div className="p-6 border-b border-[#E8E4E0] bg-white">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6a5f]" />
              <input type="text" placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26] text-sm" />
            </div>
            <div className="flex gap-2">
              {(['all', 'ready-to-call', 'hot', 'warm', 'cold'] as const).map((score) => (
                <button key={score} onClick={() => setFilterScore(score)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${filterScore === score ? 'bg-[#E07F26] text-white' : 'bg-[#F5F3F1] text-[#5a4a3f] hover:bg-[#E8E4E0]'}`}>
                  {score === 'all' ? 'All' : score.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] text-sm focus:outline-none">
              <option value="score">Sort by Score</option>
              <option value="recent">Sort by Recent</option>
              <option value="budget">Sort by Budget</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl border border-[#E8E4E0] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9F7F5]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Persona</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Last Active</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4E0]">
                {sortedBuyers.map((buyer) => (
                  <motion.tr key={buyer.id} className="hover:bg-[#F9F7F5] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] font-semibold">{buyer.firstName.charAt(0)}</div>
                        <div>
                          <div className="font-medium text-[#3D2D22]">{buyer.firstName} {buyer.lastName}</div>
                          <div className="text-xs text-[#7a6a5f]">{buyer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><LeadScoreBadge score={buyer.leadScore} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#7a6a5f]" />
                        <span className="text-[#3D2D22] text-sm">{buyer.persona?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="text-[#3D2D22] text-sm font-medium">{buyer.budgetBand.replace('-', ' - ').toUpperCase()}</span></td>
                    <td className="px-4 py-4"><span className="text-[#7a6a5f] text-sm">{buyer.source}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#7a6a5f]" /><span className="text-[#7a6a5f] text-sm">{getTimeAgo(buyer.lastActiveAt)}</span></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-[#F5F3F1] hover:bg-[#E8E4E0] transition-colors"><Eye className="w-4 h-4 text-[#3D2D22]" /></button>
                        <button className="p-2 rounded-lg bg-[#F5F3F1] hover:bg-[#E8E4E0] transition-colors"><Phone className="w-4 h-4 text-[#3D2D22]" /></button>
                        <button className="p-2 rounded-lg bg-[#F5F3F1] hover:bg-[#E8E4E0] transition-colors"><Mail className="w-4 h-4 text-[#3D2D22]" /></button>
                        <button className="p-2 rounded-lg bg-[#F5F3F1] hover:bg-[#E8E4E0] transition-colors"><MessageSquare className="w-4 h-4 text-[#3D2D22]" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


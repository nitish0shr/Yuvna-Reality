import { useState } from 'react';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { BuyerProfile, LeadScore } from '../../types/realEstate';
import {
  Inbox,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Building2,
  BarChart3,
  Flame,
  ThermometerSun,
  Snowflake,
  CheckCircle,
  Kanban,
  Users,
  LogOut
} from 'lucide-react';

import { YuvnaLogoAgent } from './YuvnaLogo';

const mockBuyers: BuyerProfile[] = [
  {
    id: '1', firstName: 'Ahmed', lastName: 'Al-Rashid', email: 'ahmed@email.com', phone: '+971501234567',
    country: 'UAE', language: 'en', currency: 'AED', timezone: 'Asia/Dubai',
    persona: 'yield-investor', personaConfidence: 85, goal: 'investment', budgetBand: '1m-2m',
    urgencyScore: 85, leadScore: 'ready-to-call', engagementScore: 78, riskTolerance: 'moderate',
    investmentHorizon: '3-5-years', source: 'onboarding-widget',
    consentMarketing: true, consentWhatsApp: true, consentEmail: true, optOutChannels: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date(),
    onboardingCompletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2', firstName: 'Sarah', lastName: 'Thompson', email: 'sarah.t@email.com', phone: '+447891234567',
    country: 'UK', language: 'en', currency: 'GBP', timezone: 'Europe/London',
    persona: 'visa-driven', personaConfidence: 90, goal: 'visa', budgetBand: '2m-5m',
    urgencyScore: 72, leadScore: 'hot', engagementScore: 65, riskTolerance: 'conservative',
    investmentHorizon: '5-10-years', source: 'partner-referral', referrerPartner: 'Premier Relocations',
    consentMarketing: true, consentWhatsApp: false, consentEmail: true, optOutChannels: ['whatsapp'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    onboardingCompletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3', firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@email.com',
    country: 'India', language: 'en', currency: 'INR', timezone: 'Asia/Kolkata',
    persona: 'capital-investor', personaConfidence: 75, goal: 'investment', budgetBand: '500k-1m',
    urgencyScore: 45, leadScore: 'warm', engagementScore: 42, riskTolerance: 'aggressive',
    investmentHorizon: '3-5-years', source: 'csv-upload',
    consentMarketing: true, consentWhatsApp: true, consentEmail: true, optOutChannels: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    onboardingCompletedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

const LeadScoreBadge = ({ score }: { score: LeadScore }) => {
  const config: Record<LeadScore, { icon: any; label: string; class: string }> = {
    'ready-to-call': { icon: Flame, label: 'Ready', class: 'bg-red-100 text-red-700 border-red-200' },
    'hot': { icon: ThermometerSun, label: 'Hot', class: 'bg-orange-100 text-orange-700 border-orange-200' },
    'warm': { icon: TrendingUp, label: 'Warm', class: 'bg-[#E07F26]/10 text-[#E07F26] border-[#E07F26]/20' },
    'cold': { icon: Snowflake, label: 'Cold', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  };
  const { icon: Icon, label, class: className } = config[score];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

const getTimeAgo = (date: Date): string => {
  const hours = Math.floor((new Date().getTime() - date.getTime()) / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export function JuvnaAgentInbox() {
  const { setView } = useRealEstateStore();
  const [buyers] = useState<BuyerProfile[]>(mockBuyers);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerProfile | null>(null);
  const [filterScore, setFilterScore] = useState<LeadScore | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentNav, setCurrentNav] = useState('inbox');

  const filteredBuyers = buyers.filter(buyer => {
    if (filterScore !== 'all' && buyer.leadScore !== filterScore) return false;
    if (searchQuery && !`${buyer.firstName} ${buyer.lastName} ${buyer.email}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const priority: Record<LeadScore, number> = { 'ready-to-call': 0, 'hot': 1, 'warm': 2, 'cold': 3 };
    return priority[a.leadScore] - priority[b.leadScore];
  });

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
                  setCurrentNav(item.id);
                  if (item.id === 'pipeline') setView('agent-pipeline');
                  if (item.id === 'leads') setView('agent-leads');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  currentNav === item.id
                    ? 'bg-[#E07F26]/10 text-[#E07F26]'
                    : 'text-[#5a4a3f] hover:bg-[#F5F3F1]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-[#E8E4E0]">
          <button
            onClick={() => setView('landing')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#5a4a3f] hover:bg-[#F5F3F1] transition-all"
          >
            <LogOut className="w-5 h-5" />
            Exit to Main Site
          </button>
        </div>

        <div className="p-4 border-t border-[#E8E4E0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] font-semibold">
              JD
            </div>
            <div>
              <div className="text-sm font-medium text-[#3D2D22]">John Doe</div>
              <div className="text-xs text-[#7a6a5f]">Property Consultant</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Lead List */}
        <div className="w-96 border-r border-[#E8E4E0] bg-white flex flex-col">
          <div className="p-4 border-b border-[#E8E4E0]">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-serif font-semibold text-[#3D2D22]">Inbox</h1>
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                {buyers.filter(b => b.leadScore === 'ready-to-call').length} Ready
              </span>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6a5f]" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26] text-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['all', 'ready-to-call', 'hot', 'warm'] as const).map((score) => (
                <button
                  key={score}
                  onClick={() => setFilterScore(score)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    filterScore === score
                      ? 'bg-[#E07F26] text-white'
                      : 'bg-[#F5F3F1] text-[#5a4a3f] hover:bg-[#E8E4E0]'
                  }`}
                >
                  {score === 'all' ? 'All' : score.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredBuyers.map((buyer) => (
              <button
                key={buyer.id}
                onClick={() => setSelectedBuyer(buyer)}
                className={`w-full p-4 border-b border-[#E8E4E0] text-left transition-all hover:bg-[#F9F7F5] ${
                  selectedBuyer?.id === buyer.id ? 'bg-[#E07F26]/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] font-semibold flex-shrink-0">
                    {buyer.firstName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#3D2D22] truncate">{buyer.firstName} {buyer.lastName}</span>
                      <span className="text-xs text-[#7a6a5f]">{getTimeAgo(buyer.lastActiveAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <LeadScoreBadge score={buyer.leadScore} />
                      <span className="text-xs text-[#7a6a5f]">{buyer.country}</span>
                    </div>
                    <p className="text-xs text-[#7a6a5f] truncate">
                      {buyer.persona?.replace('-', ' ')} • {buyer.budgetBand.replace('-', '-')}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedBuyer ? (
          <div className="flex-1 flex flex-col">
            {/* Buyer Header */}
            <div className="p-6 border-b border-[#E8E4E0] bg-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] text-xl font-semibold">
                    {selectedBuyer.firstName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-[#3D2D22]">
                      {selectedBuyer.firstName} {selectedBuyer.lastName}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-[#7a6a5f]">
                      <span>{selectedBuyer.email}</span>
                      {selectedBuyer.phone && <span>{selectedBuyer.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-lg border border-[#E8E4E0] hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-colors">
                    <Phone className="w-5 h-5 text-[#3D2D22]" />
                  </button>
                  <button className="p-2.5 rounded-lg border border-[#E8E4E0] hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-colors">
                    <Mail className="w-5 h-5 text-[#3D2D22]" />
                  </button>
                  <button className="p-2.5 rounded-lg border border-[#E8E4E0] hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-colors">
                    <Calendar className="w-5 h-5 text-[#3D2D22]" />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="p-3 rounded-lg bg-[#F9F7F5]">
                  <div className="text-xs text-[#7a6a5f] mb-1">Lead Score</div>
                  <LeadScoreBadge score={selectedBuyer.leadScore} />
                </div>
                <div className="p-3 rounded-lg bg-[#F9F7F5]">
                  <div className="text-xs text-[#7a6a5f] mb-1">Persona</div>
                  <div className="text-[#3D2D22] font-medium text-sm">
                    {selectedBuyer.persona?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#F9F7F5]">
                  <div className="text-xs text-[#7a6a5f] mb-1">Budget</div>
                  <div className="text-[#3D2D22] font-medium text-sm">{selectedBuyer.budgetBand.replace('-', ' - ').toUpperCase()}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#F9F7F5]">
                  <div className="text-xs text-[#7a6a5f] mb-1">Urgency</div>
                  <div className="text-[#3D2D22] font-medium text-sm">{selectedBuyer.urgencyScore}/100</div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* AI Summary */}
                <div className="p-4 rounded-xl bg-[#E07F26]/5 border border-[#E07F26]/20 mb-6">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-[#E07F26] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-[#E07F26] text-sm mb-1">AI Summary</h3>
                      <p className="text-[#3D2D22] text-sm">
                        High-intent {selectedBuyer.persona?.replace('-', ' ')} exploring {selectedBuyer.goal} options. 
                        Budget: {selectedBuyer.budgetBand.replace('-', '-')}. Active engagement with ROI tools. 
                        {selectedBuyer.leadScore === 'ready-to-call' && ' Requested human contact.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggested Action */}
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 mb-6">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Suggested Action</span>
                  </div>
                  <p className="text-green-800 text-sm mb-3">
                    {selectedBuyer.leadScore === 'ready-to-call' 
                      ? 'Call within 4 hours - buyer requested contact'
                      : 'Send personalized property comparison for their budget range'}
                  </p>
                  <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
                    Take Action
                  </button>
                </div>

                {/* Activity */}
                <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white border border-[#E8E4E0] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E07F26]/10 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-[#E07F26]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#3D2D22]">Used ROI Calculator</div>
                      <div className="text-xs text-[#7a6a5f]">2 hours ago</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E8E4E0] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-[#3D2D22]">Viewed Recommendations</div>
                      <div className="text-xs text-[#7a6a5f]">3 hours ago</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E8E4E0] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-[#3D2D22]">Chat with AI Advisor</div>
                      <div className="text-xs text-[#7a6a5f]">5 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-72 border-l border-[#E8E4E0] bg-white p-4 overflow-y-auto">
                <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">Buyer Profile</h3>
                <div className="space-y-3 text-sm">
                  {[
                    ['Goal', selectedBuyer.goal],
                    ['Risk Tolerance', selectedBuyer.riskTolerance],
                    ['Horizon', selectedBuyer.investmentHorizon],
                    ['Source', selectedBuyer.source],
                    ['Confidence', `${selectedBuyer.personaConfidence}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[#F5F3F1]">
                      <span className="text-[#7a6a5f]">{label}</span>
                      <span className="text-[#3D2D22] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-[#F5F3F1] flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-[#E8E4E0]" />
              </div>
              <h3 className="text-lg font-serif font-medium text-[#7a6a5f]">Select a conversation</h3>
              <p className="text-[#9a8a7f] text-sm mt-1">Choose a lead from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


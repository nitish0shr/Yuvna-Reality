import { motion } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import { 
  Building2,
  Calculator,
  MessageSquare,
  MapPin,
  ChevronRight,
  BarChart3,
  User,
  Target,
  ArrowUpRight,
  Send,
  Zap
} from 'lucide-react';
import { YuvnaHeader } from './YuvnaHeader';

export function JuvnaDashboard() {
  const { currentBuyer, setView } = useRealEstateStore();

  if (!currentBuyer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F5]">
        <div className="juvna-spinner" />
      </div>
    );
  }

  const getPersonaDisplayName = (persona: string | null) => {
    const names: Record<string, string> = {
      'yield-investor': 'Yield-Focused Investor',
      'capital-investor': 'Growth Investor',
      'lifestyle': 'Lifestyle Buyer',
      'visa-driven': 'Visa-Driven Buyer',
      'explorer': 'Market Explorer',
    };
    return persona ? names[persona] : 'Getting to know you...';
  };

  const quickActions = [
    {
      title: 'Property Recommendations',
      description: 'View AI-curated properties matching your profile',
      icon: Building2,
      action: () => setView('recommendations'),
    },
    {
      title: 'ROI Calculator',
      description: 'Calculate potential returns on your investment',
      icon: Calculator,
      action: () => setView('roi-simulator'),
    },
    {
      title: 'Chat with Advisor',
      description: 'Get instant answers from our AI expert',
      icon: MessageSquare,
      action: () => setView('chat'),
    },
  ];

  const marketInsights = [
    { label: 'Avg. Yield (Your Budget)', value: '7.2%', trend: '+0.3%' },
    { label: 'Price Growth YTD', value: '+12.4%', trend: '+2.1%' },
    { label: 'Days on Market', value: '45', trend: '-8' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      <YuvnaHeader currentPage="dashboard" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="w-12 h-1 bg-[#E07F26] mb-4" />
          <h1 className="text-3xl font-serif font-bold text-[#3D2D22] mb-2">
            Welcome back, {currentBuyer.firstName}
          </h1>
          <p className="text-[#7a6a5f] text-lg">
            Your personalized Dubai investment dashboard is ready
          </p>
        </motion.div>

        {/* Profile + Stats Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-xl border border-[#E8E4E0] p-6 shadow-sm"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-[#E07F26]/10 flex items-center justify-center">
                <User className="w-8 h-8 text-[#E07F26]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-semibold text-[#3D2D22] mb-1">
                  {getPersonaDisplayName(currentBuyer.persona)}
                </h3>
                <p className="text-[#7a6a5f] mb-4">
                  {currentBuyer.personaConfidence}% confidence based on your profile
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 rounded-lg bg-[#F5F3F1] text-[#3D2D22] text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#E07F26]" />
                    {currentBuyer.goal.charAt(0).toUpperCase() + currentBuyer.goal.slice(1)}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#F5F3F1] text-[#3D2D22] text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#E07F26]" />
                    {currentBuyer.budgetBand.replace('-', ' - ').replace('k', 'K').replace('m', 'M').toUpperCase()}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#F5F3F1] text-[#3D2D22] text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E07F26]" />
                    {currentBuyer.country}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-[#7a6a5f] mb-1">Urgency Score</div>
                <div className="text-4xl font-serif font-bold text-[#E07F26]">{currentBuyer.urgencyScore}</div>
                <div className="text-xs text-[#7a6a5f]">/ 100</div>
              </div>
            </div>
          </motion.div>

          {/* Market Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-[#E8E4E0] p-6 shadow-sm"
          >
            <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-4">
              Market Snapshot
            </h3>
            <div className="space-y-4">
              {marketInsights.map((insight) => (
                <div key={insight.label} className="flex items-center justify-between">
                  <span className="text-[#5a4a3f] text-sm">{insight.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#3D2D22] font-semibold">{insight.value}</span>
                    <span className="text-green-600 text-xs flex items-center">
                      <ArrowUpRight className="w-3 h-3" />
                      {insight.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-xl font-serif font-semibold text-[#3D2D22] mb-6">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <motion.button
                key={action.title}
                onClick={action.action}
                className="group p-6 bg-white rounded-xl border border-[#E8E4E0] text-left hover:border-[#E07F26]/50 hover:shadow-lg transition-all"
                whileHover={{ y: -4 }}
              >
                <div className="w-14 h-14 rounded-xl bg-[#E07F26]/10 flex items-center justify-center mb-4 group-hover:bg-[#E07F26] transition-colors">
                  <action.icon className="w-7 h-7 text-[#E07F26] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-[#3D2D22] mb-1 flex items-center gap-2">
                  {action.title}
                  <ChevronRight className="w-4 h-4 text-[#E8E4E0] group-hover:text-[#E07F26] group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-[#7a6a5f] text-sm">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Outreach Engine CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-r from-[#E07F26] to-[#c96e1f] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-semibold text-white mb-1">
                    🚀 Outreach Engine
                  </h3>
                  <p className="text-white/80 text-sm">
                    Auto-generate leads when your pipeline drops • Upload CSV • Email sequences • Multi-channel tracking
                  </p>
                </div>
              </div>
              <button
                onClick={() => setView('agent-outreach')}
                className="px-6 py-3 bg-white text-[#E07F26] font-semibold rounded-lg hover:bg-white/90 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Send className="w-5 h-5" />
                Open Outreach
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recommendations CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-[#3D2D22] rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-[#E07F26]/20 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-[#E07F26]" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-white mb-2">
                Your AI Recommendations Are Ready
              </h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Based on your {currentBuyer.persona?.replace('-', ' ')} profile, we've curated 5 property directions that match your goals.
              </p>
              <button
                onClick={() => setView('recommendations')}
                className="px-8 py-3 bg-[#E07F26] text-white font-semibold uppercase tracking-wider text-sm rounded hover:bg-[#c96e1f] transition-all inline-flex items-center gap-2"
              >
                Explore Recommendations
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}


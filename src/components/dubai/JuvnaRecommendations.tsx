import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { PropertyRecommendation, PropertyType, AreaCluster, InvestmentStrategy } from '../../types/realEstate';
import { 
  Building2,
  ChevronRight,
  TrendingUp,
  Shield,
  AlertTriangle,
  Check,
  X,
  Calculator,
  MessageSquare,
  Home,
  Castle
} from 'lucide-react';

import { YuvnaHeader } from './YuvnaHeader';

const generateRecommendations = (persona: string | null, budget: string): PropertyRecommendation[] => {
  const recs: PropertyRecommendation[] = [];

  recs.push({
    id: '1',
    propertyType: budget === 'under-500k' || budget === '500k-1m' ? '1br' : '2br',
    status: 'ready',
    areaCluster: 'growth-corridor',
    strategy: 'rent',
    riskScore: 3,
    expectedYield: 8.2,
    expectedAppreciation: 5,
    priceRange: { min: 400000, max: 650000 },
    whyItFits: 'High rental demand from young professionals. Established community with strong occupancy rates.',
    pros: ['High rental yield', 'Ready to move in', 'Low vacancy risk', 'Affordable entry point'],
    cons: ['Lower appreciation potential', 'Smaller unit sizes'],
  });

  recs.push({
    id: '2',
    propertyType: '2br',
    status: 'off-plan',
    areaCluster: 'emerging',
    strategy: 'hold',
    riskScore: 6,
    expectedYield: 5.5,
    expectedAppreciation: 15,
    priceRange: { min: 600000, max: 900000 },
    whyItFits: 'New development in area with infrastructure investment. Payment plan available during construction.',
    pros: ['High growth potential', 'Attractive payment plans', 'Modern amenities'],
    cons: ['Delivery risk', 'Lower initial yield'],
  });

  recs.push({
    id: '3',
    propertyType: persona === 'lifestyle' ? 'villa' : '2br',
    status: 'ready',
    areaCluster: 'prime',
    strategy: 'rent',
    riskScore: 4,
    expectedYield: 6.0,
    expectedAppreciation: 8,
    priceRange: { min: 1200000, max: 1800000 },
    whyItFits: 'Prime location with strong resale value. Popular with expats and tourists.',
    pros: ['Prime location', 'Strong resale market', 'Premium amenities'],
    cons: ['Higher entry price', 'More competition'],
  });

  if (persona === 'visa-driven' || budget === '1m-2m' || budget === '2m-5m') {
    recs.push({
      id: '4',
      propertyType: 'townhouse',
      status: 'ready',
      areaCluster: 'family-hub',
      strategy: 'hold',
      riskScore: 3,
      expectedYield: 5.8,
      expectedAppreciation: 7,
      priceRange: { min: 2000000, max: 2500000 },
      whyItFits: 'Golden Visa eligible (2M+ AED). Family-oriented community with schools nearby.',
      pros: ['Golden Visa eligible', 'Family-friendly', 'Good schools'],
      cons: ['Higher capital required', 'Lower yield'],
    });
  }

  recs.push({
    id: '5',
    propertyType: '2br',
    status: 'ready',
    areaCluster: 'waterfront',
    strategy: 'rent',
    riskScore: 4,
    expectedYield: 6.5,
    expectedAppreciation: 9,
    priceRange: { min: 1500000, max: 2200000 },
    whyItFits: 'Waterfront premium commands higher rents. Strong demand from corporate relocations.',
    pros: ['Waterfront premium', 'View value', 'High demand'],
    cons: ['Premium pricing', 'Seasonal fluctuations'],
  });

  return recs.slice(0, 5);
};

const PropertyTypeIcon = ({ type }: { type: PropertyType }) => {
  if (type === 'villa' || type === 'penthouse') return <Castle className="w-6 h-6" />;
  if (type === 'townhouse') return <Home className="w-6 h-6" />;
  return <Building2 className="w-6 h-6" />;
};

const AreaClusterBadge = ({ cluster }: { cluster: AreaCluster }) => {
  const labels: Record<AreaCluster, string> = {
    prime: 'Prime Location',
    'growth-corridor': 'Growth Corridor',
    'family-hub': 'Family Hub',
    waterfront: 'Waterfront',
    emerging: 'Emerging Area',
  };
  return (
    <span className="px-3 py-1 rounded-full bg-[#E07F26]/10 text-[#E07F26] text-xs font-semibold uppercase tracking-wider">
      {labels[cluster]}
    </span>
  );
};

const RiskMeter = ({ score }: { score: number }) => {
  const getLabel = (s: number) => {
    if (s <= 3) return 'Low Risk';
    if (s <= 6) return 'Moderate Risk';
    return 'Higher Risk';
  };
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-4 rounded-sm ${i < score ? (score <= 3 ? 'bg-green-500' : score <= 6 ? 'bg-[#E07F26]' : 'bg-red-500') : 'bg-[#E8E4E0]'}`}
          />
        ))}
      </div>
      <span className="text-sm text-[#7a6a5f]">{getLabel(score)}</span>
    </div>
  );
};

export function JuvnaRecommendations() {
  const { currentBuyer, setView } = useRealEstateStore();
  const [recommendations, setRecommendations] = useState<PropertyRecommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<PropertyRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const recs = generateRecommendations(currentBuyer?.persona || null, currentBuyer?.budgetBand || '500k-1m');
      setRecommendations(recs);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentBuyer]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return `$${(price / 1000).toFixed(0)}K`;
  };

  const getPropertyTypeLabel = (type: PropertyType) => {
    const labels: Record<PropertyType, string> = {
      studio: 'Studio Apartment', '1br': '1-Bedroom', '2br': '2-Bedroom', '3br': '3-Bedroom',
      townhouse: 'Townhouse', villa: 'Villa', penthouse: 'Penthouse',
    };
    return labels[type];
  };

  const getStrategyLabel = (strategy: InvestmentStrategy) => {
    const labels: Record<InvestmentStrategy, string> = { rent: 'Buy & Rent', flip: 'Buy & Flip', hold: 'Buy & Hold' };
    return labels[strategy];
  };

  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      <YuvnaHeader currentPage="recommendations" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-white rounded-xl border border-[#E8E4E0]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E07F26]/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-[#E07F26]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold text-[#3D2D22] mb-1">Personalized For You</h2>
              <p className="text-[#7a6a5f]">
                Based on your {currentBuyer?.persona?.replace('-', ' ')} profile, we've identified {recommendations.length} investment directions.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8E4E0] p-6 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-[#F5F3F1] mb-4" />
                <div className="h-6 bg-[#F5F3F1] rounded-lg mb-2 w-3/4" />
                <div className="h-4 bg-[#F5F3F1] rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-xl border border-[#E8E4E0] overflow-hidden cursor-pointer hover:border-[#E07F26]/50 hover:shadow-lg transition-all"
                onClick={() => setSelectedRec(rec)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26]">
                      <PropertyTypeIcon type={rec.propertyType} />
                    </div>
                    <AreaClusterBadge cluster={rec.areaCluster} />
                  </div>
                  
                  <h3 className="text-lg font-serif font-semibold text-[#3D2D22] mb-1">
                    {getPropertyTypeLabel(rec.propertyType)}
                  </h3>
                  <p className="text-[#7a6a5f] text-sm mb-4">
                    {rec.status === 'off-plan' ? 'Off-Plan' : 'Ready'} • {getStrategyLabel(rec.strategy)}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-[#F9F7F5]">
                      <div className="text-xs text-[#7a6a5f] mb-1">Expected Yield</div>
                      <div className="text-2xl font-serif font-bold text-green-600">{rec.expectedYield}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F9F7F5]">
                      <div className="text-xs text-[#7a6a5f] mb-1">Appreciation</div>
                      <div className="text-2xl font-serif font-bold text-[#E07F26]">{rec.expectedAppreciation}%</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-[#7a6a5f] mb-1">Price Range</div>
                    <div className="text-lg font-semibold text-[#3D2D22]">
                      {formatPrice(rec.priceRange.min)} - {formatPrice(rec.priceRange.max)}
                    </div>
                  </div>

                  <RiskMeter score={rec.riskScore} />
                </div>

                <div className="px-6 py-4 bg-[#F9F7F5] border-t border-[#E8E4E0]">
                  <button className="w-full py-2.5 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] text-sm font-medium hover:border-[#E07F26] hover:text-[#E07F26] transition-all flex items-center justify-center gap-2">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
            onClick={() => setSelectedRec(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-[#E8E4E0] p-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#3D2D22] mb-1">
                    {getPropertyTypeLabel(selectedRec.propertyType)}
                  </h2>
                  <AreaClusterBadge cluster={selectedRec.areaCluster} />
                </div>
                <button onClick={() => setSelectedRec(null)} className="p-2 hover:bg-[#F5F3F1] rounded-lg">
                  <X className="w-5 h-5 text-[#7a6a5f]" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-[#E07F26]/5 border border-[#E07F26]/20">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-[#E07F26] mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-[#E07F26] mb-1">Why This Fits You</h3>
                      <p className="text-[#3D2D22]">{selectedRec.whyItFits}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#F9F7F5] text-center">
                    <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-serif font-bold text-[#3D2D22]">{selectedRec.expectedYield}%</div>
                    <div className="text-xs text-[#7a6a5f]">Expected Yield</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F9F7F5] text-center">
                    <Building2 className="w-6 h-6 text-[#E07F26] mx-auto mb-2" />
                    <div className="text-2xl font-serif font-bold text-[#3D2D22]">{selectedRec.expectedAppreciation}%</div>
                    <div className="text-xs text-[#7a6a5f]">Appreciation</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F9F7F5] text-center">
                    <Shield className="w-6 h-6 text-[#E07F26] mx-auto mb-2" />
                    <div className="text-2xl font-serif font-bold text-[#3D2D22]">{selectedRec.riskScore}/10</div>
                    <div className="text-xs text-[#7a6a5f]">Risk Score</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">Advantages</h3>
                    <ul className="space-y-2">
                      {selectedRec.pros.map((pro, i) => (
                        <li key={i} className="flex items-center gap-2 text-[#3D2D22]">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">Considerations</h3>
                    <ul className="space-y-2">
                      {selectedRec.cons.map((con, i) => (
                        <li key={i} className="flex items-center gap-2 text-[#3D2D22]">
                          <AlertTriangle className="w-4 h-4 text-[#E07F26] flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => { setSelectedRec(null); setView('roi-simulator'); }}
                    className="flex-1 py-3 rounded-lg bg-[#E07F26] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#c96e1f] transition-all"
                  >
                    <Calculator className="w-5 h-5" />
                    Calculate ROI
                  </button>
                  <button
                    onClick={() => { setSelectedRec(null); setView('chat'); }}
                    className="flex-1 py-3 rounded-lg border-2 border-[#3D2D22] text-[#3D2D22] font-semibold flex items-center justify-center gap-2 hover:bg-[#3D2D22] hover:text-white transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Ask Advisor
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


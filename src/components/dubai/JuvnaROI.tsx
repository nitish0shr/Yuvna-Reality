import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { PropertyType, AreaCluster } from '../../types/realEstate';
import {
  Calculator,
  TrendingUp,
  Building2,
  DollarSign,
  RefreshCw,
  AlertCircle,
  BarChart3,
  ArrowRight,
  Globe,
  MessageSquare
} from 'lucide-react';

import { YuvnaHeader } from './YuvnaHeader';

interface SimulationInputs {
  budget: number;
  currency: string;
  timeHorizon: number;
  propertyType: PropertyType;
  areaCluster: AreaCluster;
}

interface SimulationResults {
  conservativeYield: number;
  moderateYield: number;
  optimisticYield: number;
  appreciationScenarios: { conservative: number; moderate: number; optimistic: number };
  annualRentalIncome: { conservative: number; moderate: number; optimistic: number };
  exitValue: { year1: number; year3: number; year5: number; year10: number };
  totalReturn: { year1: number; year3: number; year5: number; year10: number };
}

const calculateROI = (inputs: SimulationInputs): SimulationResults => {
  const { budget, areaCluster, propertyType } = inputs;
  
  const baseYields: Record<AreaCluster, number> = {
    prime: 5.5, 'growth-corridor': 7.5, 'family-hub': 5.8, waterfront: 6.2, emerging: 6.8,
  };
  const baseAppreciation: Record<AreaCluster, number> = {
    prime: 6, 'growth-corridor': 10, 'family-hub': 5, waterfront: 7, emerging: 12,
  };
  const propertyModifiers: Record<PropertyType, number> = {
    studio: 1.1, '1br': 1.05, '2br': 1.0, '3br': 0.95, townhouse: 0.9, villa: 0.85, penthouse: 0.8,
  };

  const baseYield = baseYields[areaCluster] * propertyModifiers[propertyType];
  const baseApp = baseAppreciation[areaCluster];

  const conservativeYield = baseYield * 0.85;
  const moderateYield = baseYield;
  const optimisticYield = baseYield * 1.15;

  const calculateExitValue = (years: number, appreciation: number) => budget * Math.pow(1 + appreciation / 100, years);
  const calculateTotalReturn = (years: number, rental: number, appreciation: number) => {
    const rentalTotal = rental * years;
    const exitValue = calculateExitValue(years, appreciation);
    return ((rentalTotal + (exitValue - budget)) / budget) * 100;
  };

  return {
    conservativeYield,
    moderateYield,
    optimisticYield,
    appreciationScenarios: { conservative: baseApp * 0.7, moderate: baseApp, optimistic: baseApp * 1.3 },
    annualRentalIncome: {
      conservative: budget * (conservativeYield / 100),
      moderate: budget * (moderateYield / 100),
      optimistic: budget * (optimisticYield / 100),
    },
    exitValue: {
      year1: calculateExitValue(1, baseApp),
      year3: calculateExitValue(3, baseApp),
      year5: calculateExitValue(5, baseApp),
      year10: calculateExitValue(10, baseApp),
    },
    totalReturn: {
      year1: calculateTotalReturn(1, budget * (moderateYield / 100), baseApp),
      year3: calculateTotalReturn(3, budget * (moderateYield / 100), baseApp),
      year5: calculateTotalReturn(5, budget * (moderateYield / 100), baseApp),
      year10: calculateTotalReturn(10, budget * (moderateYield / 100), baseApp),
    },
  };
};

const exchangeRates: Record<string, number> = { USD: 1, AED: 3.67, GBP: 0.79, EUR: 0.92, INR: 83.12 };
const currencySymbols: Record<string, string> = { USD: '$', AED: 'AED ', GBP: '£', EUR: '€', INR: '₹' };

export function JuvnaROI() {
  const { currentBuyer, setView } = useRealEstateStore();
  
  const [inputs, setInputs] = useState<SimulationInputs>({
    budget: 1000000,
    currency: currentBuyer?.currency || 'USD',
    timeHorizon: 5,
    propertyType: '2br',
    areaCluster: 'growth-corridor',
  });
  
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState(inputs.currency);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setResults(calculateROI(inputs));
      setIsCalculating(false);
    }, 1000);
  };

  const formatMoney = (value: number, currency: string = displayCurrency) => {
    const converted = value * (exchangeRates[currency] || 1);
    const symbol = currencySymbols[currency] || '$';
    if (converted >= 1000000) return `${symbol}${(converted / 1000000).toFixed(2)}M`;
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const areaOptions = [
    { value: 'prime', label: 'Prime (Downtown, Marina)' },
    { value: 'growth-corridor', label: 'Growth Corridor (JVC, Dubai South)' },
    { value: 'family-hub', label: 'Family Hub (Arabian Ranches)' },
    { value: 'waterfront', label: 'Waterfront (Creek, Lagoons)' },
    { value: 'emerging', label: 'Emerging Areas' },
  ];

  const propertyOptions = [
    { value: 'studio', label: 'Studio' },
    { value: '1br', label: '1 Bedroom' },
    { value: '2br', label: '2 Bedroom' },
    { value: '3br', label: '3 Bedroom' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'villa', label: 'Villa' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      <YuvnaHeader currentPage="roi-simulator" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[#E8E4E0] p-6 sticky top-24">
              <h2 className="text-lg font-serif font-semibold text-[#3D2D22] mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#E07F26]" />
                Investment Parameters
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Investment Budget (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a6a5f]" />
                    <input
                      type="number"
                      value={inputs.budget}
                      onChange={(e) => setInputs({ ...inputs, budget: Number(e.target.value) })}
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Property Type</label>
                  <select
                    value={inputs.propertyType}
                    onChange={(e) => setInputs({ ...inputs, propertyType: e.target.value as PropertyType })}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                  >
                    {propertyOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Area Type</label>
                  <select
                    value={inputs.areaCluster}
                    onChange={(e) => setInputs({ ...inputs, areaCluster: e.target.value as AreaCluster })}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                  >
                    {areaOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Investment Horizon: {inputs.timeHorizon} years</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={inputs.timeHorizon}
                    onChange={(e) => setInputs({ ...inputs, timeHorizon: Number(e.target.value) })}
                    className="w-full accent-[#E07F26]"
                  />
                  <div className="flex justify-between text-xs text-[#7a6a5f] mt-1">
                    <span>1 year</span>
                    <span>10 years</span>
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full py-4 rounded-lg bg-[#E07F26] text-white font-semibold uppercase tracking-wider text-sm flex items-center justify-center gap-3 hover:bg-[#c96e1f] transition-all disabled:opacity-50"
                >
                  {isCalculating ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Calculating...</>
                  ) : (
                    <><Calculator className="w-5 h-5" /> Calculate Returns</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
            {!results ? (
              <div className="bg-white rounded-xl border border-[#E8E4E0] p-12 text-center">
                <div className="w-20 h-20 rounded-xl bg-[#E07F26]/10 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-[#E07F26]" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#3D2D22] mb-2">Run Your First Simulation</h3>
                <p className="text-[#7a6a5f]">Adjust the parameters and click "Calculate Returns"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Currency Toggle */}
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#7a6a5f]" />
                  <span className="text-sm text-[#7a6a5f]">Display in:</span>
                  <div className="flex gap-2">
                    {['USD', 'AED', 'GBP', 'EUR'].map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setDisplayCurrency(curr)}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          displayCurrency === curr
                            ? 'bg-[#E07F26] text-white'
                            : 'bg-white border border-[#E8E4E0] text-[#3D2D22] hover:border-[#E07F26]'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Yield Scenarios */}
                <div className="bg-white rounded-xl border border-[#E8E4E0] p-6">
                  <h3 className="text-lg font-serif font-semibold text-[#3D2D22] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Rental Yield Scenarios
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-[#F9F7F5] text-center">
                      <div className="text-sm text-[#7a6a5f] mb-2">Conservative</div>
                      <div className="text-3xl font-serif font-bold text-green-600">{results.conservativeYield.toFixed(1)}%</div>
                      <div className="text-sm text-[#7a6a5f] mt-1">{formatMoney(results.annualRentalIncome.conservative)}/yr</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                      <div className="text-sm text-green-600 mb-2">Expected</div>
                      <div className="text-3xl font-serif font-bold text-green-600">{results.moderateYield.toFixed(1)}%</div>
                      <div className="text-sm text-[#7a6a5f] mt-1">{formatMoney(results.annualRentalIncome.moderate)}/yr</div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F9F7F5] text-center">
                      <div className="text-sm text-[#7a6a5f] mb-2">Optimistic</div>
                      <div className="text-3xl font-serif font-bold text-green-600">{results.optimisticYield.toFixed(1)}%</div>
                      <div className="text-sm text-[#7a6a5f] mt-1">{formatMoney(results.annualRentalIncome.optimistic)}/yr</div>
                    </div>
                  </div>
                </div>

                {/* Exit Value Timeline */}
                <div className="bg-white rounded-xl border border-[#E8E4E0] p-6">
                  <h3 className="text-lg font-serif font-semibold text-[#3D2D22] mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#E07F26]" />
                    Exit Value Projections
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { year: 1, value: results.exitValue.year1, return: results.totalReturn.year1 },
                      { year: 3, value: results.exitValue.year3, return: results.totalReturn.year3 },
                      { year: 5, value: results.exitValue.year5, return: results.totalReturn.year5 },
                      { year: 10, value: results.exitValue.year10, return: results.totalReturn.year10 },
                    ].map((item) => (
                      <div key={item.year} className="p-4 rounded-lg bg-[#F9F7F5] text-center">
                        <div className="text-sm text-[#7a6a5f] mb-2">Year {item.year}</div>
                        <div className="text-xl font-serif font-bold text-[#3D2D22]">{formatMoney(item.value)}</div>
                        <div className="text-sm text-[#E07F26] mt-1">+{item.return.toFixed(1)}% ROI</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-[#3D2D22] rounded-xl p-6 text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E07F26]/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[#E07F26]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-[#E07F26] mb-1">Investment Summary</h3>
                      <p className="text-white/80 text-sm mb-4">
                        A {formatMoney(inputs.budget)} investment could generate approximately{' '}
                        <span className="text-[#E07F26] font-semibold">{formatMoney(results.annualRentalIncome.moderate)}</span>{' '}
                        in annual rental income with {results.appreciationScenarios.moderate.toFixed(1)}% appreciation per year.
                      </p>
                      <button
                        onClick={() => setView('chat')}
                        className="inline-flex items-center gap-2 text-[#E07F26] hover:text-white transition-colors text-sm font-medium"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Discuss with Advisor
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-[#F9F7F5] rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#7a6a5f] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#7a6a5f] leading-relaxed">
                    <strong>Disclaimer:</strong> These projections are estimates based on current market data. 
                    Actual returns may vary. This is not financial advice.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}


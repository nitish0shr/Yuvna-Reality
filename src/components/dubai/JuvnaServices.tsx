import { motion } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import { 
  Building2,
  TrendingUp,
  Shield,
  FileText,
  Home,
  Globe,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { YuvnaLogoCompact } from './YuvnaLogo';

export function JuvnaServices() {
  const { setView } = useRealEstateStore();

  const services = [
    {
      icon: Building2,
      title: 'Property Investment Advisory',
      description: 'Expert guidance on high-yield investment opportunities across Dubai\'s prime locations. We analyze market trends, rental yields, and capital appreciation potential to match you with the perfect investment.',
      features: ['Market analysis', 'Yield projections', 'Area recommendations', 'Risk assessment'],
    },
    {
      icon: TrendingUp,
      title: 'ROI & Market Analysis',
      description: 'Data-driven insights and comprehensive ROI projections to help you make informed decisions. Our AI-powered tools provide accurate forecasts based on historical data and market trends.',
      features: ['ROI calculator', 'Market reports', 'Price trends', 'Comparative analysis'],
    },
    {
      icon: Shield,
      title: 'Golden Visa Services',
      description: 'Complete assistance with UAE Golden Visa and property visa applications. We guide you through the entire process, from property selection to visa approval.',
      features: ['Visa eligibility check', 'Property selection', 'Document preparation', 'Application support'],
    },
    {
      icon: Home,
      title: 'Property Management',
      description: 'End-to-end property management services for investors who want passive income. We handle tenant screening, rent collection, maintenance, and more.',
      features: ['Tenant screening', 'Rent collection', 'Maintenance', 'Financial reporting'],
    },
    {
      icon: FileText,
      title: 'Legal & Documentation',
      description: 'Comprehensive legal support for all your property transactions. Our legal partners ensure smooth, secure transactions with complete documentation.',
      features: ['Title deed transfer', 'Contract review', 'NOC processing', 'Mortgage assistance'],
    },
    {
      icon: Globe,
      title: 'International Buyer Support',
      description: 'Specialized services for international investors. We handle everything from remote viewings to currency considerations and cross-border transactions.',
      features: ['Virtual viewings', 'Currency guidance', 'Remote transactions', 'Relocation support'],
    },
  ];

  const process = [
    { step: '01', title: 'Consultation', description: 'Share your goals and we\'ll create a personalized strategy' },
    { step: '02', title: 'Property Matching', description: 'AI-powered recommendations based on your criteria' },
    { step: '03', title: 'Due Diligence', description: 'Thorough analysis and verification of selected properties' },
    { step: '04', title: 'Transaction', description: 'Seamless purchase process with full support' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E8E4E0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => setView('landing')}><YuvnaLogoCompact /></button>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setView('services')} className="text-[14px] font-medium text-[#E07F26]">Services</button>
              <button onClick={() => setView('about')} className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26]">About Us</button>
              <button onClick={() => setView('properties')} className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26]">Properties</button>
              <button onClick={() => setView('contact')} className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26]">Contact</button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setView('agent-inbox')} className="text-[14px] font-medium text-[#7a6a5f] hover:text-[#E07F26]">Agent Portal</button>
              <button onClick={() => setView('onboarding')} className="px-6 py-3 bg-[#E07F26] text-white text-[13px] font-semibold uppercase tracking-wider rounded hover:bg-[#c96e1f]">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#F9F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-6" />
            <h1 className="text-5xl font-serif font-bold text-[#3D2D22] mb-6">Our Services</h1>
            <p className="text-xl text-[#5a4a3f] leading-relaxed">
              Comprehensive real estate solutions tailored to your investment goals. From property selection to visa processing, we're with you every step of the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-[#E8E4E0] rounded-xl p-8 hover:shadow-xl hover:border-[#E07F26]/30 transition-all group"
              >
                <div className="w-16 h-16 rounded-xl bg-[#E07F26]/10 flex items-center justify-center mb-6 group-hover:bg-[#E07F26] transition-colors">
                  <service.icon className="w-8 h-8 text-[#E07F26] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#3D2D22] mb-4">{service.title}</h3>
                <p className="text-[#5a4a3f] text-sm leading-relaxed mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#5a4a3f]">
                      <CheckCircle className="w-4 h-4 text-[#E07F26]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-[#3D2D22]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">Our streamlined process makes property investment simple</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                <div className="text-6xl font-serif font-bold text-[#E07F26]/30 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-[#E07F26]/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#E07F26]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-10">Take our 2-minute assessment and get personalized recommendations.</p>
          <button
            onClick={() => setView('onboarding')}
            className="px-10 py-4 bg-white text-[#E07F26] font-semibold uppercase tracking-wider rounded hover:bg-white/90 transition-all inline-flex items-center gap-3"
          >
            Start Free Assessment <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D2D22] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/50 text-sm">© 2024 Yuvna Realty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


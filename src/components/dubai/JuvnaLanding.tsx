import { motion } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import { 
  ChevronRight,
  MapPin,
  TrendingUp,
  Shield,
  Building2,
  Users,
  Award,
  Phone,
  Mail,
  ArrowRight,
  Play
} from 'lucide-react';

import { YuvnaLogoCompact } from './YuvnaLogo';

export function JuvnaLanding() {
  const { setView, startOnboarding } = useRealEstateStore();

  const handleGetStarted = () => {
    startOnboarding();
    setView('onboarding');
  };

  const stats = [
    { value: '500+', label: 'Properties Sold' },
    { value: '15+', label: 'Years Experience' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '50+', label: 'Expert Agents' },
  ];

  const services = [
    {
      icon: Building2,
      title: 'Property Investment',
      description: 'Expert guidance on high-yield investment opportunities across Dubai\'s prime locations.',
    },
    {
      icon: TrendingUp,
      title: 'Market Analysis',
      description: 'Data-driven insights and ROI projections to help you make informed decisions.',
    },
    {
      icon: Shield,
      title: 'Visa Services',
      description: 'Complete assistance with Golden Visa and property visa applications.',
    },
    {
      icon: Users,
      title: 'Personalized Advisory',
      description: 'Dedicated consultants who understand your unique investment goals.',
    },
  ];

  const testimonials = [
    {
      quote: "Yuvna Realty made our Dubai investment journey seamless. Their expertise and personalized approach exceeded our expectations.",
      author: "Sarah Thompson",
      role: "UK Investor",
    },
    {
      quote: "The team's market knowledge helped us secure a property with excellent rental yields. Highly recommend!",
      author: "Ahmed Al-Rashid",
      role: "UAE Resident",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Clean, minimal like Yuvna site */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E8E4E0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <YuvnaLogoCompact />
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26] transition-colors">
                Services
              </a>
              <a href="#about" className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26] transition-colors">
                About Us
              </a>
              <a href="#properties" className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26] transition-colors">
                Properties
              </a>
              <a href="#contact" className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26] transition-colors">
                Contact
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('agent-inbox')}
                className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26] transition-colors"
              >
                Agent Portal
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-3 bg-[#E07F26] text-white text-[13px] font-semibold uppercase tracking-wider rounded hover:bg-[#c96e1f] transition-all hover:shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 min-h-screen flex items-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233D2D22' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Accent bar */}
              <div className="w-16 h-1 bg-[#E07F26] mb-8" />
              
              <h1 className="font-serif text-5xl lg:text-6xl font-bold text-[#3D2D22] leading-[1.1] mb-6">
                Your Gateway to
                <span className="block text-[#E07F26]">Dubai Real Estate</span>
              </h1>

              <p className="text-lg text-[#5a4a3f] leading-relaxed mb-8 max-w-lg">
                Discover exceptional investment opportunities with Dubai's premier real estate advisory. 
                Personalized guidance, market expertise, and seamless transactions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.button
                  onClick={handleGetStarted}
                  className="group px-8 py-4 bg-[#E07F26] text-white font-semibold uppercase tracking-wider text-[13px] rounded hover:bg-[#c96e1f] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#E07F26]/20"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Start Your Journey
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <button className="px-8 py-4 border-2 border-[#3D2D22] text-[#3D2D22] font-semibold uppercase tracking-wider text-[13px] rounded hover:bg-[#3D2D22] hover:text-white transition-all flex items-center justify-center gap-3">
                  <Play className="w-4 h-4" />
                  Watch Video
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-sm text-[#7a6a5f]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#E07F26]" />
                  <span>RERA Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#E07F26]" />
                  <span>Award Winning</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Image/Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Main Image Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop"
                  alt="Dubai Skyline"
                  className="w-full h-[500px] object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D2D22]/60 to-transparent" />
                
                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/95 backdrop-blur rounded-lg p-4">
                      <div className="text-3xl font-serif font-bold text-[#E07F26]">8.5%</div>
                      <div className="text-sm text-[#5a4a3f]">Average Yield</div>
                    </div>
                    <div className="bg-white/95 backdrop-blur rounded-lg p-4">
                      <div className="text-3xl font-serif font-bold text-[#E07F26]">0%</div>
                      <div className="text-sm text-[#5a4a3f]">Property Tax</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-xl p-5 max-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#E07F26]/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#E07F26]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#3D2D22]">50+ Areas</div>
                    <div className="text-xs text-[#7a6a5f]">Covered</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#F9F7F5] border-y border-[#E8E4E0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-serif font-bold text-[#E07F26] mb-2">{stat.value}</div>
                <div className="text-[#5a4a3f] text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-[#3D2D22] mb-4">Our Services</h2>
            <p className="text-lg text-[#5a4a3f] max-w-2xl mx-auto">
              Comprehensive real estate solutions tailored to your investment goals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white border border-[#E8E4E0] rounded-xl p-8 hover:shadow-xl hover:border-[#E07F26]/30 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-[#E07F26]/10 flex items-center justify-center mb-6 group-hover:bg-[#E07F26] transition-colors">
                  <service.icon className="w-7 h-7 text-[#E07F26] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#3D2D22] mb-3">{service.title}</h3>
                <p className="text-[#5a4a3f] text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#3D2D22] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-8" />
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-6">
              Ready to Invest in Dubai?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Get your personalized investment plan in just 2 minutes. Our AI-powered platform matches you with the perfect opportunities.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-10 py-4 bg-[#E07F26] text-white font-semibold uppercase tracking-wider text-[14px] rounded hover:bg-[#c96e1f] transition-all inline-flex items-center gap-3 shadow-lg"
            >
              Get Your Free Assessment
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#F9F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-[#3D2D22] mb-4">Client Testimonials</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-lg"
              >
                <div className="text-5xl text-[#E07F26] font-serif mb-4">"</div>
                <p className="text-lg text-[#3D2D22] mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E07F26]/10 flex items-center justify-center">
                    <span className="text-[#E07F26] font-semibold">{testimonial.author.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#3D2D22]">{testimonial.author}</div>
                    <div className="text-sm text-[#7a6a5f]">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#3D2D22] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="35" r="22" fill="#E07F26" />
                  <g stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 95 L20 55 L35 45 L35 95" />
                    <path d="M38 95 L38 35 L50 25 L62 35 L62 95" />
                    <path d="M65 95 L65 45 L80 55 L80 95" />
                  </g>
                </svg>
                <div>
                  <span className="text-xl font-bold tracking-[0.1em] uppercase">YUVNA</span>
                  <span className="block text-[9px] uppercase tracking-[0.2em] text-white/60 -mt-0.5">REALTY</span>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Your trusted partner for Dubai real estate investments. Expert guidance, exceptional results.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-[#E07F26]">Quick Links</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li><a href="#" className="hover:text-[#E07F26] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#E07F26] transition-colors">Properties</a></li>
                <li><a href="#" className="hover:text-[#E07F26] transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-[#E07F26] transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-[#E07F26]">Services</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li>Property Sales</li>
                <li>Investment Advisory</li>
                <li>Golden Visa</li>
                <li>Property Management</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-[#E07F26]">Contact Us</h4>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#E07F26]" />
                  +971 4 XXX XXXX
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E07F26]" />
                  info@yuvnarealty.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E07F26]" />
                  Dubai, UAE
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">© 2024 Yuvna Realty. All rights reserved.</p>
            <div className="flex items-center gap-6 text-white/50 text-sm">
              <a href="#" className="hover:text-[#E07F26] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#E07F26] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


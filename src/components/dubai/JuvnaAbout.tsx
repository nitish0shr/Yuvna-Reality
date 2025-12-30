import { motion } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import { 
  Award,
  Users,
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { YuvnaLogoCompact } from './YuvnaLogo';

export function JuvnaAbout() {
  const { setView } = useRealEstateStore();

  const milestones = [
    { year: '2008', title: 'Founded', description: 'Started with a vision to transform Dubai real estate' },
    { year: '2012', title: 'First 100 Properties', description: 'Milestone achievement in property sales' },
    { year: '2018', title: 'International Expansion', description: 'Opened offices in London and Mumbai' },
    { year: '2023', title: 'AI Integration', description: 'Launched AI-powered property matching' },
  ];

  const team = [
    { name: 'Mohammed Al-Farsi', role: 'CEO & Founder', image: 'M' },
    { name: 'Sarah Williams', role: 'Head of Sales', image: 'S' },
    { name: 'Raj Krishnan', role: 'Investment Director', image: 'R' },
    { name: 'Elena Rodriguez', role: 'Client Relations', image: 'E' },
  ];

  const values = [
    { icon: Target, title: 'Client-First', description: 'Your goals drive every recommendation we make' },
    { icon: CheckCircle, title: 'Transparency', description: 'Honest advice with no hidden agendas' },
    { icon: Award, title: 'Excellence', description: 'RERA certified with award-winning service' },
    { icon: Users, title: 'Partnership', description: 'We succeed when you succeed' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E8E4E0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => setView('landing')}><YuvnaLogoCompact /></button>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setView('services')} className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26]">Services</button>
              <button onClick={() => setView('about')} className="text-[14px] font-medium text-[#E07F26]">About Us</button>
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
            <h1 className="text-5xl font-serif font-bold text-[#3D2D22] mb-6">About Yuvna Realty</h1>
            <p className="text-xl text-[#5a4a3f] leading-relaxed">
              For over 15 years, we've been helping investors and families find their perfect property in Dubai. 
              Our commitment to excellence and client satisfaction has made us one of the most trusted names in Dubai real estate.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-b border-[#E8E4E0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Properties Sold' },
              { value: '15+', label: 'Years Experience' },
              { value: '98%', label: 'Client Satisfaction' },
              { value: '$2B+', label: 'Transaction Value' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-serif font-bold text-[#E07F26] mb-2">{stat.value}</div>
                <div className="text-[#5a4a3f] text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-16 h-1 bg-[#E07F26] mb-6" />
              <h2 className="text-4xl font-serif font-bold text-[#3D2D22] mb-6">Our Story</h2>
              <p className="text-[#5a4a3f] leading-relaxed mb-6">
                Founded in 2008, Yuvna Realty began with a simple mission: to provide honest, expert guidance to property investors in Dubai. 
                What started as a small team of passionate real estate professionals has grown into one of the region's most respected advisory firms.
              </p>
              <p className="text-[#5a4a3f] leading-relaxed mb-6">
                Today, we combine decades of market expertise with cutting-edge AI technology to deliver personalized property recommendations 
                that match each client's unique goals, whether they're seeking rental yields, capital appreciation, or a new home.
              </p>
              <p className="text-[#5a4a3f] leading-relaxed">
                Our RERA-certified team has helped over 500 clients achieve their real estate dreams, with a focus on transparency, 
                education, and long-term relationships.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=500&fit=crop"
                alt="Our Office"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#F9F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-[#3D2D22] mb-4">Our Values</h2>
            <p className="text-lg text-[#5a4a3f] max-w-2xl mx-auto">The principles that guide everything we do</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 text-center shadow-lg"
              >
                <div className="w-16 h-16 rounded-xl bg-[#E07F26]/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-[#E07F26]" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#3D2D22] mb-3">{value.title}</h3>
                <p className="text-[#5a4a3f] text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-[#3D2D22] mb-4">Our Journey</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-serif font-bold text-[#E07F26] mb-4">{milestone.year}</div>
                <h3 className="text-xl font-semibold text-[#3D2D22] mb-2">{milestone.title}</h3>
                <p className="text-[#5a4a3f] text-sm">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-[#3D2D22]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Leadership Team</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">Meet the experts behind your success</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[#E07F26]/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-serif font-bold text-[#E07F26]">{member.image}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-white/60 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#E07F26]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-10">Let our experts guide you to your perfect Dubai investment.</p>
          <button
            onClick={() => setView('onboarding')}
            className="px-10 py-4 bg-white text-[#E07F26] font-semibold uppercase tracking-wider rounded hover:bg-white/90 transition-all inline-flex items-center gap-3"
          >
            Get Started <ArrowRight className="w-5 h-5" />
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


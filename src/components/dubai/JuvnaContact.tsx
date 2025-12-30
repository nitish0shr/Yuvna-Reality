import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { YuvnaLogoCompact } from './YuvnaLogo';

export function JuvnaContact() {
  const { setView } = useRealEstateStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '+971 4 XXX XXXX', subtext: 'Mon-Sat, 9am-6pm' },
    { icon: Mail, label: 'Email', value: 'info@yuvnarealty.com', subtext: 'We reply within 24 hours' },
    { icon: MapPin, label: 'Office', value: 'Business Bay, Dubai', subtext: 'UAE' },
    { icon: Clock, label: 'Working Hours', value: 'Sun-Thu: 9am-6pm', subtext: 'Fri-Sat: By appointment' },
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
              <button onClick={() => setView('about')} className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26]">About Us</button>
              <button onClick={() => setView('properties')} className="text-[14px] font-medium text-[#3D2D22] hover:text-[#E07F26]">Properties</button>
              <button onClick={() => setView('contact')} className="text-[14px] font-medium text-[#E07F26]">Contact</button>
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
            <h1 className="text-5xl font-serif font-bold text-[#3D2D22] mb-6">Get in Touch</h1>
            <p className="text-xl text-[#5a4a3f] leading-relaxed">
              Have questions about Dubai real estate? Our expert team is here to help. Reach out and we'll get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-serif font-bold text-[#3D2D22] mb-8">Contact Information</h2>
              <div className="space-y-6 mb-12">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E07F26]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#E07F26]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#7a6a5f] mb-1">{item.label}</div>
                      <div className="text-lg font-semibold text-[#3D2D22]">{item.value}</div>
                      <div className="text-sm text-[#7a6a5f]">{item.subtext}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <button className="w-full py-4 px-6 rounded-xl border-2 border-[#E07F26] text-[#E07F26] font-semibold flex items-center justify-center gap-3 hover:bg-[#E07F26] hover:text-white transition-all">
                  <Calendar className="w-5 h-5" />
                  Schedule a Call
                </button>
                <button className="w-full py-4 px-6 rounded-xl border-2 border-[#3D2D22] text-[#3D2D22] font-semibold flex items-center justify-center gap-3 hover:bg-[#3D2D22] hover:text-white transition-all">
                  <MessageSquare className="w-5 h-5" />
                  Chat on WhatsApp
                </button>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#3D2D22] mb-4">Message Sent!</h3>
                  <p className="text-[#5a4a3f] mb-6">
                    Thank you for reaching out. Our team will contact you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-[#E07F26] font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E8E4E0] p-8 shadow-lg">
                  <h2 className="text-2xl font-serif font-bold text-[#3D2D22] mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm text-[#7a6a5f] mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#7a6a5f] mb-2">Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#7a6a5f] mb-2">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                          placeholder="+971 50 XXX XXXX"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-[#7a6a5f] mb-2">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26] resize-none"
                        placeholder="Tell us about your property needs..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-[#E07F26] text-white font-semibold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-[#c96e1f] transition-all"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-[#F9F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-[#3D2D22] mb-4">Visit Our Office</h2>
            <p className="text-[#5a4a3f]">Located in the heart of Business Bay, Dubai</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E8E4E0] overflow-hidden shadow-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-[#E07F26] mx-auto mb-4" />
              <p className="text-[#3D2D22] font-semibold">Business Bay, Dubai, UAE</p>
              <p className="text-[#7a6a5f] text-sm mt-2">Map integration available on deployment</p>
            </div>
          </div>
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


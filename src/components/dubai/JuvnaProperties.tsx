import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import { 
  MapPin,
  Bed,
  Bath,
  Maximize,
  TrendingUp,
  Search,
  Grid,
  List,
  ArrowRight,
  Heart
} from 'lucide-react';
import { YuvnaLogoCompact } from './YuvnaLogo';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  yield: number;
  image: string;
  status: 'ready' | 'off-plan';
}

const properties: Property[] = [
  { id: '1', title: 'Luxury Apartment in Downtown', location: 'Downtown Dubai', price: 2500000, type: '2BR Apartment', beds: 2, baths: 2, sqft: 1450, yield: 5.8, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', status: 'ready' },
  { id: '2', title: 'Marina View Penthouse', location: 'Dubai Marina', price: 4500000, type: 'Penthouse', beds: 3, baths: 4, sqft: 3200, yield: 5.2, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop', status: 'ready' },
  { id: '3', title: 'JVC Investment Studio', location: 'Jumeirah Village Circle', price: 450000, type: 'Studio', beds: 0, baths: 1, sqft: 450, yield: 8.5, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop', status: 'ready' },
  { id: '4', title: 'Palm Jumeirah Villa', location: 'Palm Jumeirah', price: 12000000, type: 'Villa', beds: 5, baths: 6, sqft: 8500, yield: 4.2, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop', status: 'ready' },
  { id: '5', title: 'Business Bay Tower', location: 'Business Bay', price: 1800000, type: '1BR Apartment', beds: 1, baths: 1, sqft: 850, yield: 6.5, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop', status: 'off-plan' },
  { id: '6', title: 'Creek Harbour Residence', location: 'Dubai Creek Harbour', price: 3200000, type: '2BR Apartment', beds: 2, baths: 2, sqft: 1650, yield: 6.0, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop', status: 'off-plan' },
  { id: '7', title: 'Arabian Ranches Townhouse', location: 'Arabian Ranches', price: 2800000, type: 'Townhouse', beds: 3, baths: 3, sqft: 2400, yield: 5.5, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop', status: 'ready' },
  { id: '8', title: 'Dubai South Investment', location: 'Dubai South', price: 680000, type: '1BR Apartment', beds: 1, baths: 1, sqft: 720, yield: 7.8, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop', status: 'off-plan' },
];

export function JuvnaProperties() {
  const { setView } = useRealEstateStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'ready' | 'off-plan'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProperties = properties.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M`;
    return `AED ${(price / 1000).toFixed(0)}K`;
  };

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
              <button onClick={() => setView('properties')} className="text-[14px] font-medium text-[#E07F26]">Properties</button>
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
      <section className="pt-32 pb-12 bg-[#F9F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-12">
            <div className="w-16 h-1 bg-[#E07F26] mx-auto mb-6" />
            <h1 className="text-5xl font-serif font-bold text-[#3D2D22] mb-6">Featured Properties</h1>
            <p className="text-xl text-[#5a4a3f] leading-relaxed">
              Explore our curated selection of premium Dubai properties. From high-yield investments to luxury residences.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-[#E8E4E0]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a6a5f]" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26] w-64"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'ready', 'off-plan'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f ? 'bg-[#E07F26] text-white' : 'bg-[#F9F7F5] text-[#3D2D22] hover:bg-[#E8E4E0]'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'ready' ? 'Ready' : 'Off-Plan'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#E07F26] text-white' : 'bg-[#F9F7F5] text-[#3D2D22]'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#E07F26] text-white' : 'bg-[#F9F7F5] text-[#3D2D22]'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl border border-[#E8E4E0] overflow-hidden hover:shadow-xl transition-all cursor-pointer group ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => setView('onboarding')}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-72 flex-shrink-0' : ''}`}>
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className={`w-full object-cover ${viewMode === 'list' ? 'h-full' : 'h-56'}`}
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      property.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {property.status === 'ready' ? 'Ready' : 'Off-Plan'}
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 text-[#3D2D22]" />
                  </button>
                </div>
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-serif font-semibold text-[#3D2D22] group-hover:text-[#E07F26] transition-colors">
                      {property.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#E07F26]">{formatPrice(property.price)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#7a6a5f] text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#5a4a3f] mb-4">
                    <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.beds || 'Studio'}</span>
                    <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.baths}</span>
                    <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {property.sqft} sqft</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8E4E0]">
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-semibold">{property.yield}% yield</span>
                    </div>
                    <span className="text-sm text-[#E07F26] font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#3D2D22]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">Can't Find What You're Looking For?</h2>
          <p className="text-xl text-white/70 mb-10">Take our quick assessment and get AI-powered recommendations tailored to your needs.</p>
          <button
            onClick={() => setView('onboarding')}
            className="px-10 py-4 bg-[#E07F26] text-white font-semibold uppercase tracking-wider rounded hover:bg-[#c96e1f] transition-all inline-flex items-center gap-3"
          >
            Get Personalized Recommendations <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D2D22] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/50 text-sm">© 2024 Yuvna Realty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


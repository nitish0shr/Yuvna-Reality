import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import { YuvnaLogoCompact } from './YuvnaLogo';
import { 
  Home,
  Building2,
  Calculator,
  MessageSquare,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface YuvnaHeaderProps {
  showNav?: boolean;
  currentPage?: string;
}

export function YuvnaHeader({ showNav = true, currentPage }: YuvnaHeaderProps) {
  const { currentBuyer, setView } = useRealEstateStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'recommendations', label: 'Properties', icon: Building2 },
    { id: 'roi-simulator', label: 'ROI Calculator', icon: Calculator },
    { id: 'chat', label: 'Advisor', icon: MessageSquare },
  ];

  const handleNavClick = (viewId: string) => {
    setView(viewId as any);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-[#E8E4E0] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Always clickable to go home */}
          <button 
            onClick={() => setView(currentBuyer ? 'dashboard' : 'landing')}
            className="hover:opacity-80 transition-opacity"
          >
            <YuvnaLogoCompact />
          </button>
          
          {/* Desktop Navigation */}
          {showNav && currentBuyer && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-all
                    ${currentPage === item.id 
                      ? 'bg-[#E07F26]/10 text-[#E07F26]' 
                      : 'text-[#3D2D22] hover:bg-[#F5F3F1] hover:text-[#E07F26]'}
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Agent Portal Link */}
            <button 
              onClick={() => setView('agent-inbox')}
              className="hidden md:block text-[13px] font-medium text-[#7a6a5f] hover:text-[#E07F26] transition-colors"
            >
              Agent Portal
            </button>

            {/* User Menu (if logged in) */}
            {currentBuyer && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F5F3F1] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E07F26]/10 flex items-center justify-center">
                    <span className="text-[#E07F26] font-semibold text-sm">
                      {currentBuyer.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-[#3D2D22] font-medium text-sm">
                    {currentBuyer.firstName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#7a6a5f]" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserMenuOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#E8E4E0] shadow-lg z-20 overflow-hidden"
                      >
                        <div className="p-3 border-b border-[#E8E4E0]">
                          <div className="text-sm font-medium text-[#3D2D22]">{currentBuyer.firstName}</div>
                          <div className="text-xs text-[#7a6a5f]">{currentBuyer.email}</div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => { handleNavClick('dashboard'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#3D2D22] hover:bg-[#F5F3F1] transition-colors"
                          >
                            <Home className="w-4 h-4" />
                            Dashboard
                          </button>
                          <button
                            onClick={() => { setView('landing'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#7a6a5f] hover:bg-[#F5F3F1] hover:text-red-600 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Get Started Button (if not logged in) */}
            {!currentBuyer && (
              <button
                onClick={() => setView('onboarding')}
                className="px-5 py-2.5 bg-[#E07F26] text-white text-[13px] font-semibold uppercase tracking-wider rounded hover:bg-[#c96e1f] transition-all"
              >
                Get Started
              </button>
            )}
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[#F5F3F1] rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#3D2D22]" /> : <Menu className="w-6 h-6 text-[#3D2D22]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-[#E8E4E0] bg-white overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {currentBuyer && navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                    ${currentPage === item.id 
                      ? 'bg-[#E07F26]/10 text-[#E07F26]' 
                      : 'text-[#3D2D22] hover:bg-[#F5F3F1]'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              
              <div className="h-px bg-[#E8E4E0] my-2" />
              
              <button
                onClick={() => { setView('agent-inbox'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-[#7a6a5f] hover:bg-[#F5F3F1] transition-all"
              >
                <User className="w-5 h-5" />
                Agent Portal
              </button>
              
              {currentBuyer && (
                <button
                  onClick={() => { setView('landing'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-[#7a6a5f] hover:bg-[#F5F3F1] hover:text-red-600 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


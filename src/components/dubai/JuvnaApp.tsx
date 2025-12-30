import { useRealEstateStore } from '../../store/realEstateStore';
import { JuvnaLanding } from './JuvnaLanding';
import { JuvnaOnboarding } from './JuvnaOnboarding';
import { JuvnaDashboard } from './JuvnaDashboard';
import { JuvnaRecommendations } from './JuvnaRecommendations';
import { JuvnaROI } from './JuvnaROI';
import { JuvnaChat } from './JuvnaChat';
import { JuvnaAgentInbox } from './JuvnaAgentInbox';
import { JuvnaPipeline } from './JuvnaPipeline';
import { JuvnaLeads } from './JuvnaLeads';
import { AnimatePresence, motion } from 'framer-motion';
import '../../styles/juvna-theme.css';

export function JuvnaApp() {
  const { currentView } = useRealEstateStore();

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <JuvnaLanding key="landing" />;
      case 'onboarding':
        return <JuvnaOnboarding key="onboarding" />;
      case 'dashboard':
        return <JuvnaDashboard key="dashboard" />;
      case 'recommendations':
        return <JuvnaRecommendations key="recommendations" />;
      case 'roi-simulator':
        return <JuvnaROI key="roi" />;
      case 'chat':
        return <JuvnaChat key="chat" />;
      case 'agent-inbox':
        return <JuvnaAgentInbox key="inbox" />;
      case 'agent-pipeline':
        return <JuvnaPipeline key="pipeline" />;
      case 'agent-leads':
      case 'agent-analytics':
        return <JuvnaLeads key="leads" />;
      default:
        return <JuvnaLanding key="landing" />;
    }
  };

  return (
    <div className="juvna-app min-h-screen bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


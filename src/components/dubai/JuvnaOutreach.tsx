import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Mail,
  Linkedin,
  Instagram,
  MessageSquare,
  Play,
  Pause,
  Settings,
  Bell,
  Zap,
  FileSpreadsheet,
  Send,
  BarChart3,
  X,
  Plus
} from 'lucide-react';
import { YuvnaHeader } from './YuvnaHeader';

interface Lead {
  id: string;
  name: string;
  email: string;
  linkedin?: string;
  instagram?: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'responded' | 'qualified' | 'converted';
  lastContact?: Date;
}

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'email' | 'multi-channel';
  totalLeads: number;
  sent: number;
  opened: number;
  replied: number;
  sequence: EmailSequence[];
  createdAt: Date;
}

interface EmailSequence {
  day: number;
  subject: string;
  sent: number;
  opened: number;
}

interface OutreachActivity {
  id: string;
  type: 'email' | 'linkedin' | 'instagram' | 'whatsapp';
  action: string;
  count: number;
  timestamp: Date;
  campaign?: string;
}

interface AutoPilotSettings {
  enabled: boolean;
  minThreshold: number;
  maxThreshold: number;
  emailsPerDay: number;
  activeCampaignId?: string;
}

// Mock data
const mockLeads: Lead[] = [
  { id: '1', name: 'Ahmed Al-Hassan', email: 'ahmed@example.com', linkedin: 'linkedin.com/in/ahmed', source: 'CSV Import', status: 'new' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', source: 'Website', status: 'contacted', lastContact: new Date() },
  { id: '3', name: 'Michael Brown', email: 'michael@example.com', linkedin: 'linkedin.com/in/michael', source: 'CSV Import', status: 'responded' },
  { id: '4', name: 'Priya Sharma', email: 'priya@example.com', phone: '+971501234567', source: 'Referral', status: 'qualified' },
];

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Dubai Investors Q1',
    status: 'active',
    type: 'email',
    totalLeads: 500,
    sent: 245,
    opened: 98,
    replied: 23,
    sequence: [
      { day: 1, subject: 'Exclusive Dubai Investment Opportunities', sent: 245, opened: 98 },
      { day: 3, subject: 'Following up on Dubai properties', sent: 180, opened: 65 },
      { day: 7, subject: 'Last chance: Premium units available', sent: 120, opened: 42 },
    ],
    createdAt: new Date('2025-01-15'),
  },
];

const mockActivities: OutreachActivity[] = [
  { id: '1', type: 'email', action: 'Sent email sequence', count: 50, timestamp: new Date(), campaign: 'Dubai Investors Q1' },
  { id: '2', type: 'linkedin', action: 'Connection requests sent', count: 15, timestamp: new Date(Date.now() - 3600000) },
  { id: '3', type: 'email', action: 'Follow-up emails sent', count: 30, timestamp: new Date(Date.now() - 7200000), campaign: 'Dubai Investors Q1' },
  { id: '4', type: 'whatsapp', action: 'Messages sent', count: 8, timestamp: new Date(Date.now() - 10800000) },
];

export function JuvnaOutreach() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [campaigns, _setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [activities, setActivities] = useState<OutreachActivity[]>(mockActivities);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const [autoPilot, setAutoPilot] = useState<AutoPilotSettings>({
    enabled: false,
    minThreshold: 50,
    maxThreshold: 100,
    emailsPerDay: 100,
  });

  // Calculate pipeline health
  const qualifiedLeads = leads.filter(l => l.status === 'qualified' || l.status === 'responded').length;
  const pipelineHealth = Math.min((qualifiedLeads / autoPilot.minThreshold) * 100, 100);
  const isBelowThreshold = qualifiedLeads < autoPilot.minThreshold;

  // Auto-pilot check
  useEffect(() => {
    if (autoPilot.enabled && isBelowThreshold) {
      // Simulate auto-outreach notification
      const timer = setTimeout(() => {
        addNotification(`🤖 Auto-pilot activated: Sending ${autoPilot.emailsPerDay} emails to replenish pipeline`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoPilot.enabled, isBelowThreshold]);

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 5000);
  };

  const handleManualOutreach = () => {
    addNotification('🚀 Manual outreach started: Sending emails to 100 prospects...');
    // Simulate activity
    setTimeout(() => {
      setActivities(prev => [{
        id: Date.now().toString(),
        type: 'email',
        action: 'Manual outreach batch sent',
        count: 100,
        timestamp: new Date(),
      }, ...prev]);
      addNotification('✅ Outreach complete: 100 emails sent successfully!');
    }, 2000);
  };

  const toggleAutoPilot = () => {
    const newState = !autoPilot.enabled;
    setAutoPilot(prev => ({ ...prev, enabled: newState }));
    addNotification(newState 
      ? '🤖 Auto-pilot ENABLED: Will maintain pipeline above ' + autoPilot.minThreshold + ' leads'
      : '⏸️ Auto-pilot DISABLED: Manual mode activated'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addNotification(`📤 Uploading ${file.name}...`);
      // Simulate processing
      setTimeout(() => {
        const newLeads = [
          { id: Date.now().toString(), name: 'New Lead 1', email: 'new1@example.com', source: 'CSV Import', status: 'new' as const },
          { id: (Date.now() + 1).toString(), name: 'New Lead 2', email: 'new2@example.com', source: 'CSV Import', status: 'new' as const },
          { id: (Date.now() + 2).toString(), name: 'New Lead 3', email: 'new3@example.com', source: 'CSV Import', status: 'new' as const },
        ];
        setLeads(prev => [...newLeads, ...prev]);
        addNotification(`✅ Imported 250 leads from ${file.name}`);
        setShowUploadModal(false);
      }, 1500);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-500';
      case 'linkedin': return 'bg-[#0077B5]';
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'whatsapp': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      <YuvnaHeader currentPage="outreach" />

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notif, index) => (
            <motion.div
              key={notif + index}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-white border border-[#E8E4E0] rounded-lg shadow-lg p-4 max-w-sm"
            >
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-[#E07F26] flex-shrink-0" />
                <p className="text-sm text-[#3D2D22]">{notif}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Pipeline Health Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`rounded-2xl p-6 ${isBelowThreshold ? 'bg-amber-50 border-2 border-amber-200' : 'bg-white border border-[#E8E4E0]'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#3D2D22] mb-1">Lead Pipeline Health</h2>
                <p className="text-[#7a6a5f] text-sm">
                  {isBelowThreshold 
                    ? `⚠️ Below threshold! Need ${autoPilot.minThreshold - qualifiedLeads} more qualified leads`
                    : '✅ Pipeline is healthy'
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-lg hover:bg-[#F9F7F5] transition-colors"
                >
                  <Settings className="w-5 h-5 text-[#7a6a5f]" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#3D2D22] font-semibold">{qualifiedLeads} qualified leads</span>
                <span className="text-[#7a6a5f]">Target: {autoPilot.minThreshold}</span>
              </div>
              <div className="h-4 bg-[#E8E4E0] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pipelineHealth}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${pipelineHealth < 50 ? 'bg-amber-500' : pipelineHealth < 80 ? 'bg-[#E07F26]' : 'bg-green-500'}`}
                />
              </div>
            </div>

            {/* Auto-Pilot Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${autoPilot.enabled ? 'bg-[#E07F26]' : 'bg-[#E8E4E0]'}`}>
                  <Zap className={`w-5 h-5 ${autoPilot.enabled ? 'text-white' : 'text-[#7a6a5f]'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D2D22]">Auto-Pilot Mode</h3>
                  <p className="text-xs text-[#7a6a5f]">
                    {autoPilot.enabled 
                      ? `Active: Sends ${autoPilot.emailsPerDay} emails/day when below ${autoPilot.minThreshold} leads`
                      : 'Disabled: Manual outreach only'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={toggleAutoPilot}
                className={`relative w-14 h-7 rounded-full transition-colors ${autoPilot.enabled ? 'bg-[#E07F26]' : 'bg-[#E8E4E0]'}`}
              >
                <motion.div
                  animate={{ x: autoPilot.enabled ? 28 : 4 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleManualOutreach}
                className="flex-1 py-3 rounded-xl bg-[#E07F26] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#c96e1f] transition-all"
              >
                <Send className="w-5 h-5" />
                Generate Leads Now
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 py-3 rounded-xl border-2 border-[#3D2D22] text-[#3D2D22] font-semibold flex items-center justify-center gap-2 hover:bg-[#3D2D22] hover:text-white transition-all"
              >
                <Upload className="w-5 h-5" />
                Upload Lead List
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Emails Sent', value: '1,245', icon: Mail, color: 'bg-blue-500' },
            { label: 'LinkedIn', value: '89', icon: Linkedin, color: 'bg-[#0077B5]' },
            { label: 'Instagram', value: '34', icon: Instagram, color: 'bg-pink-500' },
            { label: 'WhatsApp', value: '156', icon: MessageSquare, color: 'bg-green-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-[#E8E4E0] p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-[#7a6a5f]">{stat.label}</span>
              </div>
              <div className="text-2xl font-serif font-bold text-[#3D2D22]">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Campaigns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[#E8E4E0] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-serif font-semibold text-[#3D2D22]">Active Campaigns</h2>
                <button
                  onClick={() => setShowCampaignModal(true)}
                  className="px-4 py-2 rounded-lg bg-[#E07F26] text-white text-sm font-medium flex items-center gap-2 hover:bg-[#c96e1f] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Campaign
                </button>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#3D2D22]">{campaign.name}</h3>
                        <p className="text-xs text-[#7a6a5f]">
                          {campaign.totalLeads} leads • {campaign.sequence.length}-email sequence
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-[#7a6a5f] mb-1">
                        <span>{campaign.sent} sent</span>
                        <span>{Math.round((campaign.sent / campaign.totalLeads) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-[#E8E4E0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E07F26] rounded-full"
                          style={{ width: `${(campaign.sent / campaign.totalLeads) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#3D2D22]">{campaign.sent}</div>
                        <div className="text-xs text-[#7a6a5f]">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#E07F26]">{Math.round((campaign.opened / campaign.sent) * 100)}%</div>
                        <div className="text-xs text-[#7a6a5f]">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{campaign.replied}</div>
                        <div className="text-xs text-[#7a6a5f]">Replies</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 py-2 rounded-lg border border-[#E8E4E0] text-[#3D2D22] text-sm hover:border-[#E07F26] transition-all flex items-center justify-center gap-1">
                        {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {campaign.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      <button className="flex-1 py-2 rounded-lg border border-[#E8E4E0] text-[#3D2D22] text-sm hover:border-[#E07F26] transition-all flex items-center justify-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        Stats
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-xl border border-[#E8E4E0] p-6">
              <h2 className="text-lg font-serif font-semibold text-[#3D2D22] mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${getChannelColor(activity.type)} flex items-center justify-center text-white`}>
                      {getChannelIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#3D2D22]">{activity.action}</p>
                      <p className="text-xs text-[#7a6a5f]">
                        {activity.count} contacts • {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-[#3D2D22]">Upload Lead List</h2>
                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-[#F9F7F5] rounded-lg">
                  <X className="w-5 h-5 text-[#7a6a5f]" />
                </button>
              </div>

              <div className="border-2 border-dashed border-[#E8E4E0] rounded-xl p-8 text-center mb-4">
                <FileSpreadsheet className="w-12 h-12 text-[#E07F26] mx-auto mb-4" />
                <p className="text-[#3D2D22] font-medium mb-2">Drop your CSV or Excel file</p>
                <p className="text-sm text-[#7a6a5f] mb-4">Supported: .csv, .xlsx, .xls</p>
                <label className="inline-block px-6 py-3 rounded-xl bg-[#E07F26] text-white font-semibold cursor-pointer hover:bg-[#c96e1f] transition-all">
                  Choose File
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="p-4 rounded-xl bg-[#F9F7F5]">
                <h3 className="font-semibold text-[#3D2D22] text-sm mb-2">Required Columns:</h3>
                <ul className="text-xs text-[#7a6a5f] space-y-1">
                  <li>• <strong>email</strong> - Contact email (required)</li>
                  <li>• <strong>name</strong> - Full name</li>
                  <li>• <strong>linkedin</strong> - LinkedIn profile URL</li>
                  <li>• <strong>phone</strong> - Phone/WhatsApp number</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-[#3D2D22]">Auto-Pilot Settings</h2>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-[#F9F7F5] rounded-lg">
                  <X className="w-5 h-5 text-[#7a6a5f]" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Minimum Lead Threshold</label>
                  <p className="text-xs text-[#7a6a5f] mb-2">Auto-pilot activates when qualified leads drop below this number</p>
                  <input
                    type="number"
                    value={autoPilot.minThreshold}
                    onChange={(e) => setAutoPilot(prev => ({ ...prev, minThreshold: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Target Lead Count</label>
                  <p className="text-xs text-[#7a6a5f] mb-2">Auto-pilot stops when qualified leads reach this number</p>
                  <input
                    type="number"
                    value={autoPilot.maxThreshold}
                    onChange={(e) => setAutoPilot(prev => ({ ...prev, maxThreshold: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Emails Per Day</label>
                  <p className="text-xs text-[#7a6a5f] mb-2">Maximum emails to send daily when auto-pilot is active</p>
                  <input
                    type="number"
                    value={autoPilot.emailsPerDay}
                    onChange={(e) => setAutoPilot(prev => ({ ...prev, emailsPerDay: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                  />
                </div>

                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    addNotification('⚙️ Auto-pilot settings saved!');
                  }}
                  className="w-full py-3 rounded-xl bg-[#E07F26] text-white font-semibold hover:bg-[#c96e1f] transition-all"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
            onClick={() => setShowCampaignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-[#3D2D22]">Create Email Campaign</h2>
                <button onClick={() => setShowCampaignModal(false)} className="p-2 hover:bg-[#F9F7F5] rounded-lg">
                  <X className="w-5 h-5 text-[#7a6a5f]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Dubai Investors Q1 2025"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-2">Select Lead List</label>
                  <select className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8E4E0] text-[#3D2D22] focus:outline-none focus:border-[#E07F26]">
                    <option>All Leads (500)</option>
                    <option>New Leads (234)</option>
                    <option>Never Contacted (156)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#7a6a5f] mb-3">Email Sequence</label>
                  <div className="space-y-3">
                    {[
                      { day: 1, subject: 'Introduction email' },
                      { day: 3, subject: 'Follow-up with value' },
                      { day: 7, subject: 'Final reminder' },
                    ].map((email, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-[#F9F7F5]">
                        <div className="w-8 h-8 rounded-full bg-[#E07F26] text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#3D2D22]">Day {email.day}</div>
                          <div className="text-xs text-[#7a6a5f]">{email.subject}</div>
                        </div>
                        <button className="text-[#E07F26] text-sm">Edit</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-[#E8E4E0] text-[#3D2D22] font-semibold hover:border-[#3D2D22] transition-all"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => {
                      setShowCampaignModal(false);
                      addNotification('🚀 Campaign "New Campaign" started with 500 leads!');
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#E07F26] text-white font-semibold hover:bg-[#c96e1f] transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Campaign
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


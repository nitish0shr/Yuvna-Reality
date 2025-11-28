import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, DollarSign, Clock, Briefcase, Building2, CheckCircle, Plus, X, Shield, FileText, Home, ArrowRight, StickyNote, ChevronDown, Loader2, Copy, Check, Target, Building, Users, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { useStore } from '../../store/useStore';
import { generateSearchStrategy, getDemoSearchStrategy, isAPIConfigured } from '../../utils/ai';
import type { WorkMode, EnhancedIntake } from '../../types';

export function JobAnalysisStep() {
  const { isDark } = useTheme();
  const { play } = useSound();
  const { currentJob, updateCurrentJob, setPhase, searchStrategy, setSearchStrategy, isGeneratingStrategy, setGeneratingStrategy } = useStore();

  const [newSkill, setNewSkill] = useState('');
  const [newNiceSkill, setNewNiceSkill] = useState('');
  const [showRawJD, setShowRawJD] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Build an EnhancedIntake from currentJob for strategy generation
  const buildIntakeFromJob = (): EnhancedIntake => ({
    primaryTitle: currentJob?.title || '',
    alternateTitles: [],
    seniorityLevel: 'Senior',
    locations: currentJob?.location ? [currentJob.location] : [],
    workModel: currentJob?.workMode === 'on-site' ? 'onsite' : currentJob?.workMode === 'hybrid' ? 'hybrid' : 'remote',
    willingToRelocate: null,
    mustHaveSkills: currentJob?.mustHaveSkills || [],
    niceToHaveSkills: currentJob?.niceToHaveSkills || [],
    domainContext: {
      industry: '',
      productType: '',
      teamSize: null,
      reportingTo: currentJob?.hiringManager || null,
    },
    targetCompanies: [],
    competitorCompanies: [],
    yearsOfExperienceMin: currentJob?.minYearsExperience || 0,
    yearsOfExperienceMax: (currentJob?.minYearsExperience || 0) + 5,
    salaryRangeMin: currentJob?.salaryMin || null,
    salaryRangeMax: currentJob?.salaryMax || null,
    keyResponsibilities: [],
    hiringUrgency: null,
  });

  const handleGenerateStrategy = async () => {
    if (!currentJob) return;
    setGeneratingStrategy(true);
    try {
      const intake = buildIntakeFromJob();
      let strategy;
      if (isAPIConfigured()) {
        strategy = await generateSearchStrategy(intake, currentJob.rawDescription);
      } else {
        // Use demo data if API not configured
        strategy = getDemoSearchStrategy(intake);
      }
      setSearchStrategy(strategy);
      play('settings_saved');
    } catch (error) {
      console.error('Failed to generate search strategy:', error);
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const handleCopyBoolean = (query: string, index: number) => {
    navigator.clipboard.writeText(query);
    setCopiedIndex(index);
    play('copy_success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!currentJob) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No job description loaded</p>
      </div>
    );
  }

  const handleAddMustHaveSkill = () => {
    if (newSkill.trim()) {
      updateCurrentJob({ mustHaveSkills: [...currentJob.mustHaveSkills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveMustHaveSkill = (index: number) => {
    const updated = currentJob.mustHaveSkills.filter((_, i) => i !== index);
    updateCurrentJob({ mustHaveSkills: updated });
  };

  const handleAddNiceToHaveSkill = () => {
    if (newNiceSkill.trim()) {
      updateCurrentJob({ niceToHaveSkills: [...currentJob.niceToHaveSkills, newNiceSkill.trim()] });
      setNewNiceSkill('');
    }
  };

  const handleRemoveNiceToHaveSkill = (index: number) => {
    const updated = currentJob.niceToHaveSkills.filter((_, i) => i !== index);
    updateCurrentJob({ niceToHaveSkills: updated });
  };

  const inputClass = `w-full px-3 py-2.5 rounded-lg border outline-none transition-all text-sm
    ${isDark
      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:bg-slate-800'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'}`;

  const labelClass = `flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

  const cardClass = `rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`;

  const sectionTitleClass = `text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setPhase('upload-job')}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Review Job Details
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Verify and edit the extracted information before uploading candidates
            </p>
          </div>
        </div>

        {/* Job Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${cardClass} p-6 mb-6`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
              ${isDark
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                : 'bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200'}`}
            >
              <Briefcase className={isDark ? 'text-cyan-400' : 'text-blue-600'} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={currentJob.title}
                onChange={(e) => updateCurrentJob({ title: e.target.value })}
                placeholder="Job Title"
                className={`w-full text-xl font-bold bg-transparent border-none outline-none p-0 mb-1
                  ${isDark ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-300'}`}
              />
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Building2 size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                  <input
                    type="text"
                    value={currentJob.company}
                    onChange={(e) => updateCurrentJob({ company: e.target.value })}
                    placeholder="Company name"
                    className={`bg-transparent border-none outline-none text-sm p-0
                      ${isDark ? 'text-slate-300 placeholder-slate-600' : 'text-slate-600 placeholder-slate-300'}`}
                  />
                </div>
                {currentJob.location && (
                  <span className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <MapPin size={14} />
                    {currentJob.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`${cardClass} p-5`}
            >
              <h2 className={sectionTitleClass}>Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    <MapPin size={12} />
                    Location
                  </label>
                  <input
                    type="text"
                    value={currentJob.location || ''}
                    onChange={(e) => updateCurrentJob({ location: e.target.value || null })}
                    placeholder="e.g., San Francisco, CA or Remote"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Clock size={12} />
                    Minimum Experience
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={currentJob.minYearsExperience}
                      onChange={(e) => updateCurrentJob({ minYearsExperience: parseInt(e.target.value) || 0 })}
                      className={`${inputClass} w-20 text-center`}
                    />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>years</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Work Setup & Compensation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${cardClass} p-5`}
            >
              <h2 className={sectionTitleClass}>Work Setup & Compensation</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    <Home size={12} />
                    Work Mode
                  </label>
                  <div className="flex gap-2">
                    {(['remote', 'hybrid', 'on-site'] as WorkMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateCurrentJob({ workMode: mode })}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium capitalize transition-all
                          ${currentJob.workMode === mode
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-blue-600 text-white'
                            : isDark
                              ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                      >
                        {mode === 'on-site' ? 'On-site' : mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      <DollarSign size={12} />
                      Salary Min
                    </label>
                    <input
                      type="number"
                      value={currentJob.salaryMin || ''}
                      onChange={(e) => updateCurrentJob({ salaryMin: parseInt(e.target.value) || null })}
                      placeholder="120,000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <DollarSign size={12} />
                      Salary Max
                    </label>
                    <input
                      type="number"
                      value={currentJob.salaryMax || ''}
                      onChange={(e) => updateCurrentJob({ salaryMax: parseInt(e.target.value) || null })}
                      placeholder="180,000"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    <Shield size={12} />
                    Visa Sponsorship
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'yes', label: 'Available' },
                      { value: 'no', label: 'Not Available' },
                      { value: '', label: 'Not Specified' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateCurrentJob({ requiresSponsorship: opt.value === '' ? null : opt.value === 'yes' })}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${(currentJob.requiresSponsorship === null ? '' : currentJob.requiresSponsorship ? 'yes' : 'no') === opt.value
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-blue-600 text-white'
                            : isDark
                              ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Must-Have Skills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`${cardClass} p-5`}
            >
              <h2 className={sectionTitleClass}>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Must-Have Skills
              </h2>
              <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                <AnimatePresence mode="popLayout">
                  {currentJob.mustHaveSkills.map((skill, index) => (
                    <motion.span
                      key={skill}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                        ${isDark
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
                    >
                      <CheckCircle size={12} />
                      {skill}
                      <button
                        onClick={() => handleRemoveMustHaveSkill(index)}
                        className="ml-1 hover:opacity-70 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                {currentJob.mustHaveSkills.length === 0 && (
                  <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No required skills added yet
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMustHaveSkill()}
                  placeholder="Type a skill and press Enter..."
                  className={inputClass}
                />
                <button
                  onClick={handleAddMustHaveSkill}
                  disabled={!newSkill.trim()}
                  className={`px-4 rounded-lg font-medium transition-all disabled:opacity-50
                    ${isDark
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </motion.div>

            {/* Nice-to-Have Skills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${cardClass} p-5`}
            >
              <h2 className={sectionTitleClass}>
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Nice-to-Have Skills
              </h2>
              <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                <AnimatePresence mode="popLayout">
                  {currentJob.niceToHaveSkills.map((skill, index) => (
                    <motion.span
                      key={skill}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                        ${isDark
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveNiceToHaveSkill(index)}
                        className="ml-1 hover:opacity-70 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                {currentJob.niceToHaveSkills.length === 0 && (
                  <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No bonus skills added yet
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNiceSkill}
                  onChange={(e) => setNewNiceSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNiceToHaveSkill()}
                  placeholder="Type a skill and press Enter..."
                  className={inputClass}
                />
                <button
                  onClick={handleAddNiceToHaveSkill}
                  disabled={!newNiceSkill.trim()}
                  className={`px-4 rounded-lg font-medium transition-all disabled:opacity-50
                    ${isDark
                      ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                >
                  <Plus size={18} />
                </button>
              </div>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className={`${cardClass} p-5`}
            >
              <h2 className={sectionTitleClass}>
                <StickyNote size={12} className="inline mr-2" />
                Notes
              </h2>
              <textarea
                value={currentJob.notes}
                onChange={(e) => updateCurrentJob({ notes: e.target.value })}
                placeholder="Add any additional notes about this role, ideal candidate profile, or special requirements..."
                rows={3}
                className={`w-full px-3 py-2.5 rounded-lg border outline-none text-sm resize-none transition-all
                  ${isDark
                    ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'}`}
              />
            </motion.div>
          </div>
        </div>

        {/* LinkedIn Search Strategy Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${cardClass} mt-6 p-5`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={sectionTitleClass}>
              <Sparkles size={12} className="inline mr-2" />
              LinkedIn Search Strategy
            </h2>
            {!searchStrategy && (
              <button
                onClick={handleGenerateStrategy}
                disabled={isGeneratingStrategy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${isDark
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30'
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 hover:from-purple-200 hover:to-pink-200'
                  } disabled:opacity-50`}
              >
                {isGeneratingStrategy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Strategy
                  </>
                )}
              </button>
            )}
          </div>

          {!searchStrategy && !isGeneratingStrategy && (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Generate an AI-powered sourcing strategy with target companies, Boolean search strings, and keywords for LinkedIn Recruiter.
            </p>
          )}

          {isGeneratingStrategy && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 size={32} className={`animate-spin mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Analyzing job requirements and building search strategy...
                </p>
              </div>
            </div>
          )}

          {searchStrategy && (
            <div className="space-y-6">
              {/* Target Companies */}
              <div>
                <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Building size={14} />
                  Target Companies
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {/* Tier 1 */}
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Tier 1 - Best Fit
                    </div>
                    <ul className="space-y-1">
                      {searchStrategy.targetCompanies.tier1.map((c, i) => (
                        <li key={i} className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          • {c.company}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Tier 2 */}
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      Tier 2 - Good Fit
                    </div>
                    <ul className="space-y-1">
                      {searchStrategy.targetCompanies.tier2.map((c, i) => (
                        <li key={i} className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          • {c.company}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Tier 3 */}
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-500/10 border border-slate-500/20' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Tier 3 - Worth Exploring
                    </div>
                    <ul className="space-y-1">
                      {searchStrategy.targetCompanies.tier3.map((c, i) => (
                        <li key={i} className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          • {c.company}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommended Titles & Experience */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Users size={14} />
                    Recommended Titles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {searchStrategy.recommendedTitles.map((title, i) => (
                      <span
                        key={i}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium
                          ${isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Clock size={14} />
                    Experience Range
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {searchStrategy.yearsOfExperience.min} - {searchStrategy.yearsOfExperience.max} years
                  </p>
                </div>
              </div>

              {/* Boolean Search Strings */}
              <div>
                <h3 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Target size={14} />
                  Boolean Search Strings
                </h3>
                <div className="space-y-3">
                  {searchStrategy.booleanSearchStrings.map((bs, i) => (
                    <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {bs.description}
                        </span>
                        <button
                          onClick={() => handleCopyBoolean(bs.query, i)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all
                            ${copiedIndex === i
                              ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                              : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                        >
                          {copiedIndex === i ? <Check size={12} /> : <Copy size={12} />}
                          {copiedIndex === i ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <code className={`block text-xs font-mono p-2 rounded-lg overflow-x-auto
                        ${isDark ? 'bg-slate-900 text-cyan-300' : 'bg-white text-slate-800 border border-slate-200'}`}
                      >
                        {bs.query}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Must-Have Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {searchStrategy.mustHaveKeywords.map((kw, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    Nice-to-Have Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {searchStrategy.niceToHaveKeywords.map((kw, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Exclude Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {searchStrategy.excludeKeywords.map((kw, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-red-500/15 text-red-300' : 'bg-red-50 text-red-700'}`}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Tips */}
              {searchStrategy.searchTips.length > 0 && (
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Pro Tips
                  </h3>
                  <ul className={`space-y-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {searchStrategy.searchTips.map((tip, i) => (
                      <li key={i}>💡 {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSearchStrategy(null)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                    ${isDark ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                  Clear & Regenerate
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Original Job Description - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className={`${cardClass} mt-6`}
        >
          <button
            onClick={() => setShowRawJD(!showRawJD)}
            className={`w-full flex items-center justify-between p-5 text-left transition-colors
              ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Original Job Description
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                {currentJob.rawDescription.length.toLocaleString()} chars
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform ${showRawJD ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            />
          </button>
          <AnimatePresence>
            {showRawJD && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={`px-5 pb-5`}>
                  <div className={`max-h-64 overflow-y-auto p-4 rounded-xl text-sm font-mono whitespace-pre-wrap
                    ${isDark ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}
                  >
                    {currentJob.rawDescription}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Sticky Footer Button */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 p-4 border-t ${isDark ? 'bg-slate-950/95 backdrop-blur-sm border-slate-800' : 'bg-white/95 backdrop-blur-sm border-slate-200'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Ready to evaluate candidates against this role
          </p>
          <button
            onClick={() => {
              play('settings_saved');
              setPhase('upload-candidates');
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg
              ${isDark
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            Continue to Candidates
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

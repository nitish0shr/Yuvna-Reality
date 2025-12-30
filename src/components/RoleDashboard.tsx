import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Building,
  Star,
  ChevronRight,
  Copy,
  Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { LLMBadge } from './LLMSelector';

export default function RoleDashboard() {
  const { currentJob, enhancedIntake: _enhancedIntake, searchStrategy, candidates } = useStore();

  // Calculate pipeline stats
  const shortlisted = candidates.filter(c => c.matchScore !== null && c.matchScore >= 70);
  const potential = candidates.filter(c => c.matchScore !== null && c.matchScore >= 40 && c.matchScore < 70);
  const rejected = candidates.filter(c => c.matchScore !== null && c.matchScore < 40);
  const starred = candidates.filter(c => c.isStarred);

  const pipelineData = [
    { label: 'Shortlisted', count: shortlisted.length, color: 'emerald', percent: candidates.length ? (shortlisted.length / candidates.length) * 100 : 0 },
    { label: 'Potential', count: potential.length, color: 'amber', percent: candidates.length ? (potential.length / candidates.length) * 100 : 0 },
    { label: 'Rejected', count: rejected.length, color: 'red', percent: candidates.length ? (rejected.length / candidates.length) * 100 : 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Role Dashboard</h2>
          <p className="text-slate-400 mt-1">Overview of your hiring pipeline</p>
        </div>
        <LLMBadge />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Candidates"
          value={candidates.length}
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Shortlisted"
          value={shortlisted.length}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Starred"
          value={starred.length}
          icon={Star}
          color="amber"
        />
        <StatCard
          label="Rejection Rate"
          value={candidates.length ? `${Math.round((rejected.length / candidates.length) * 100)}%` : '0%'}
          icon={TrendingUp}
          color="slate"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Role Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white">Role Summary</h3>
          </div>

          {currentJob ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white">{currentJob.title}</h4>
                <p className="text-slate-400 text-sm">{currentJob.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {currentJob.location && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{currentJob.location}</span>
                  </div>
                )}
                {currentJob.workMode && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building className="w-4 h-4" />
                    <span className="capitalize">{currentJob.workMode}</span>
                  </div>
                )}
                {currentJob.minYearsExperience > 0 && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{currentJob.minYearsExperience}+ years</span>
                  </div>
                )}
              </div>

              {/* Key Skills */}
              {currentJob.mustHaveSkills && currentJob.mustHaveSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Key Requirements
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentJob.mustHaveSkills.slice(0, 5).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-800 border border-white/5 rounded-md text-xs text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {currentJob.mustHaveSkills.length > 5 && (
                      <span className="px-2 py-1 text-xs text-slate-500">
                        +{currentJob.mustHaveSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No job details available</p>
            </div>
          )}
        </motion.div>

        {/* Strategy Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Sourcing Strategy</h3>
          </div>

          {searchStrategy ? (
            <div className="space-y-4">
              {/* Target Companies */}
              {searchStrategy.targetCompanies && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Target Companies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {searchStrategy.targetCompanies.tier1.slice(0, 4).map((company, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-xs text-emerald-400"
                      >
                        {company.company}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Boolean Search */}
              {searchStrategy.booleanSearchStrings && searchStrategy.booleanSearchStrings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Boolean Search
                  </p>
                  <div className="bg-slate-800/50 border border-white/5 rounded-lg p-3">
                    <p className="text-xs text-slate-400 font-mono truncate">
                      {searchStrategy.booleanSearchStrings[0].query}
                    </p>
                    <button className="flex items-center gap-1 mt-2 text-xs text-indigo-400 hover:text-indigo-300">
                      <Copy className="w-3 h-3" />
                      Copy to clipboard
                    </button>
                  </div>
                </div>
              )}

              {/* Tips */}
              {searchStrategy.searchTips && searchStrategy.searchTips.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Tips
                  </p>
                  <ul className="space-y-1">
                    {searchStrategy.searchTips.slice(0, 2).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <Sparkles className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No strategy generated yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Pipeline Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">Candidate Pipeline</h3>
          </div>
          <span className="text-sm text-slate-400">{candidates.length} total candidates</span>
        </div>

        {candidates.length > 0 ? (
          <div className="space-y-4">
            {/* Pipeline Bar */}
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
              {pipelineData.map((item, i) => (
                item.percent > 0 && (
                  <motion.div
                    key={item.label}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className={`
                      h-full
                      ${item.color === 'emerald' ? 'bg-emerald-500' : ''}
                      ${item.color === 'amber' ? 'bg-amber-500' : ''}
                      ${item.color === 'red' ? 'bg-red-500' : ''}
                    `}
                  />
                )
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6">
              {pipelineData.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`
                    w-3 h-3 rounded-full
                    ${item.color === 'emerald' ? 'bg-emerald-500' : ''}
                    ${item.color === 'amber' ? 'bg-amber-500' : ''}
                    ${item.color === 'red' ? 'bg-red-500' : ''}
                  `} />
                  <span className="text-sm text-slate-400">
                    {item.label}: <span className="text-white font-medium">{item.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No candidates in pipeline yet</p>
          </div>
        )}
      </motion.div>

      {/* Shortlisted Candidates Preview */}
      {shortlisted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white">Top Candidates</h3>
            </div>
            <button className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {shortlisted.slice(0, 3).map(candidate => (
              <div
                key={candidate.id}
                className="bg-slate-800/50 border border-white/5 rounded-xl p-4 hover:border-indigo-500/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {candidate.matchScore}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm truncate">{candidate.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{candidate.currentJobTitle}</p>
                  </div>
                  {candidate.isStarred && (
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {candidate.currentCompany && (
                    <span className="truncate">{candidate.currentCompany}</span>
                  )}
                  {candidate.yearsExperience && (
                    <>
                      <span>•</span>
                      <span>{candidate.yearsExperience} yrs</span>
                    </>
                  )}
                </div>

                {candidate.evaluation?.fitSnapshot?.oneLineVerdict && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {candidate.evaluation.fitSnapshot.oneLineVerdict}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    slate: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' }
  };

  const colors = colorClasses[color] || colorClasses.slate;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${colors.bg} border ${colors.border} rounded-xl p-4`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

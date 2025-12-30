import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckSquare,
    DollarSign,
    Shield,
    Briefcase,
    Users,
    Calendar,
    Search,
    Building,
    Target,
    Hash,
    XCircle,
    Sparkles,
    ChevronRight,
    Clipboard,
    Copy,
    Check,
    Globe
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateSearchStrategy, getDemoSearchStrategy, isAPIConfigured } from '../utils/ai';
import type { TargetCompanyTier } from '../types';

interface IntakeMeetingProps {
    onNext: () => void;
}

// Section component for consistent styling
function Section({ title, icon: Icon, children, color = 'indigo' }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    color?: 'indigo' | 'emerald' | 'purple';
}) {
    const colorClasses = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className={`px-6 py-4 border-b ${colorClasses[color]} flex items-center gap-3`}>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

// Input field component
function InputField({ label, value, onChange, placeholder, icon: Icon, multiline = false }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ElementType;
    multiline?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <div className="relative group">
                {Icon && (
                    <Icon className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                )}
                {multiline ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full bg-slate-800/50 border border-white/10 rounded-lg ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none min-h-[80px]`}
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full bg-slate-800/50 border border-white/10 rounded-lg ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all`}
                    />
                )}
            </div>
        </div>
    );
}

// Tag input for skills
function TagInput({ label, tags, onTagsChange, placeholder, color = 'indigo' }: {
    label: string;
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    color?: 'indigo' | 'emerald' | 'red' | 'purple';
}) {
    const [input, setInput] = useState('');

    const colorClasses = {
        indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30',
        emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30',
        red: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
        purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30',
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                onTagsChange([...tags, input.trim()]);
            }
            setInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className={`px-3 py-1 rounded-full text-xs border ${colorClasses[color]} flex items-center gap-1.5 transition-colors cursor-pointer`}
                        onClick={() => removeTag(tag)}
                    >
                        {tag}
                        <XCircle className="w-3 h-3 opacity-60 hover:opacity-100" />
                    </span>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Type and press Enter...'}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
            />
        </div>
    );
}

// Copyable Boolean search string
function BooleanSearchCard({ query, description }: { query: string; description: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(query);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-800/50 border border-white/5 rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-slate-400">{description}</p>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded hover:bg-slate-700 transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                    )}
                </button>
            </div>
            <code className="block text-xs text-cyan-300 font-mono break-all bg-slate-900/50 p-2 rounded">
                {query}
            </code>
        </div>
    );
}

// Company tier display
function CompanyTier({ tier, companies, label }: {
    tier: 1 | 2 | 3;
    companies: TargetCompanyTier[];
    label: string;
}) {
    const tierColors = {
        1: 'border-emerald-500/30 bg-emerald-500/10',
        2: 'border-purple-500/30 bg-purple-500/10',
        3: 'border-slate-500/30 bg-slate-500/10',
    };

    return (
        <div className={`rounded-lg border ${tierColors[tier]} p-4`}>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{label}</h5>
            <div className="space-y-2">
                {companies.map((company, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <Building className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="text-sm font-medium text-white">{company.company}</span>
                            <p className="text-xs text-slate-500">{company.reason}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function IntakeMeeting({ onNext }: IntakeMeetingProps) {
    const {
        currentJob,
        enhancedIntake,
        setEnhancedIntake,
        updateCurrentJob,
        searchStrategy,
        setSearchStrategy,
        isGeneratingStrategy,
        setGeneratingStrategy,
    } = useStore();

    // Section A: Rule Definitions
    const [mustHaveSkills, setMustHaveSkills] = useState<string[]>(enhancedIntake?.mustHaveSkills || []);
    const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>(enhancedIntake?.niceToHaveSkills || []);
    const [locations, setLocations] = useState<string[]>(enhancedIntake?.locations || []);
    const [workModel, setWorkModel] = useState<'onsite' | 'hybrid' | 'remote' | 'flexible'>(enhancedIntake?.workModel || 'hybrid');
    const [workAuth, setWorkAuth] = useState<string>(currentJob?.requiresSponsorship === false ? 'No sponsorship' : currentJob?.requiresSponsorship === true ? 'Sponsorship available' : 'Not specified');
    const [salaryMin, setSalaryMin] = useState<string>(currentJob?.salaryMin?.toString() || '');
    const [salaryMax, setSalaryMax] = useState<string>(currentJob?.salaryMax?.toString() || '');
    const [dealBreakers, setDealBreakers] = useState<string[]>(currentJob?.dealBreakers || []);
    const [hiringManagerName, setHiringManagerName] = useState<string>(currentJob?.hiringManager || '');
    const [hiringManagerTitle, setHiringManagerTitle] = useState<string>(currentJob?.hiringManagerTitle || '');
    const [interviewProcess, setInterviewProcess] = useState<string>('');

    // Section B: Search Criteria
    const [recommendedTitles, setRecommendedTitles] = useState<string[]>(enhancedIntake?.alternateTitles || []);
    const [experienceMin, setExperienceMin] = useState<number>(enhancedIntake?.yearsOfExperienceMin || 0);
    const [experienceMax, setExperienceMax] = useState<number>(enhancedIntake?.yearsOfExperienceMax || 10);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);
    const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);

    // Generate strategy on mount if not exists
    useEffect(() => {
        if (!searchStrategy && enhancedIntake && currentJob?.rawDescription) {
            generateStrategy();
        }
    }, []);

    const generateStrategy = async () => {
        if (!enhancedIntake || !currentJob?.rawDescription) return;

        setGeneratingStrategy(true);
        try {
            if (isAPIConfigured()) {
                const strategy = await generateSearchStrategy(enhancedIntake, currentJob.rawDescription);
                setSearchStrategy(strategy);
            } else {
                const strategy = getDemoSearchStrategy(enhancedIntake);
                setSearchStrategy(strategy);
            }
        } catch (error) {
            console.error('Error generating strategy:', error);
            const strategy = getDemoSearchStrategy(enhancedIntake);
            setSearchStrategy(strategy);
        } finally {
            setGeneratingStrategy(false);
        }
    };

    const handleSave = () => {
        // Update enhanced intake
        if (enhancedIntake) {
            setEnhancedIntake({
                ...enhancedIntake,
                mustHaveSkills,
                niceToHaveSkills,
                locations,
                workModel,
                alternateTitles: recommendedTitles,
                yearsOfExperienceMin: experienceMin,
                yearsOfExperienceMax: experienceMax,
            });
        }

        // Update current job
        if (currentJob) {
            updateCurrentJob({
                mustHaveSkills,
                niceToHaveSkills,
                dealBreakers,
                location: locations.join(', ') || null,
                workMode: workModel === 'onsite' ? 'on-site' : workModel === 'flexible' ? 'hybrid' : workModel,
                salaryMin: salaryMin ? parseInt(salaryMin) : null,
                salaryMax: salaryMax ? parseInt(salaryMax) : null,
                hiringManager: hiringManagerName || null,
                hiringManagerTitle: hiringManagerTitle || null,
                requiresSponsorship: workAuth === 'No sponsorship' ? false : workAuth === 'Sponsorship available' ? true : null,
                intakeCompleteness: 85,
            });
        }

        onNext();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Intake Meeting</h1>
                <p className="text-slate-400">Define role requirements, search criteria, and sourcing strategy</p>
            </div>

            {/* Three-column layout for sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Section A: Rule Definitions */}
                <Section title="A. Rule Definitions" icon={CheckSquare} color="indigo">
                    <div className="space-y-5">
                        {/* Must-Haves */}
                        <TagInput
                            label="Must-Have Skills"
                            tags={mustHaveSkills}
                            onTagsChange={setMustHaveSkills}
                            placeholder="e.g., React, Python, AWS..."
                            color="emerald"
                        />

                        {/* Nice-to-Haves */}
                        <TagInput
                            label="Nice-to-Have Skills"
                            tags={niceToHaveSkills}
                            onTagsChange={setNiceToHaveSkills}
                            placeholder="e.g., GraphQL, Docker..."
                            color="purple"
                        />

                        {/* Location */}
                        <TagInput
                            label="Locations"
                            tags={locations}
                            onTagsChange={setLocations}
                            placeholder="e.g., San Francisco, Remote..."
                            color="indigo"
                        />

                        {/* Work Mode */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work Mode</label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['remote', 'hybrid', 'onsite', 'flexible'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setWorkModel(mode)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${workModel === mode
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Work Authorization */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5" />
                                Work Authorization
                            </label>
                            <select
                                value={workAuth}
                                onChange={(e) => setWorkAuth(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-all"
                            >
                                <option value="Not specified">Not specified</option>
                                <option value="No sponsorship">No visa sponsorship</option>
                                <option value="Sponsorship available">Sponsorship available</option>
                                <option value="US Citizens only">US Citizens only</option>
                            </select>
                        </div>

                        {/* Salary Range */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5" />
                                Salary Range
                            </label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    value={salaryMin}
                                    onChange={(e) => setSalaryMin(e.target.value)}
                                    placeholder="Min"
                                    className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                                />
                                <span className="text-slate-500">-</span>
                                <input
                                    type="number"
                                    value={salaryMax}
                                    onChange={(e) => setSalaryMax(e.target.value)}
                                    placeholder="Max"
                                    className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Deal Breakers */}
                        <TagInput
                            label="Deal Breakers"
                            tags={dealBreakers}
                            onTagsChange={setDealBreakers}
                            placeholder="e.g., Requires relocation, No remote..."
                            color="red"
                        />

                        {/* Hiring Manager Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="HM Name"
                                value={hiringManagerName}
                                onChange={setHiringManagerName}
                                placeholder="e.g., John Smith"
                                icon={Users}
                            />
                            <InputField
                                label="HM Title"
                                value={hiringManagerTitle}
                                onChange={setHiringManagerTitle}
                                placeholder="e.g., VP Engineering"
                            />
                        </div>

                        {/* Interview Process */}
                        <InputField
                            label="Interview Process"
                            value={interviewProcess}
                            onChange={setInterviewProcess}
                            placeholder="e.g., Phone screen → Technical → Onsite → Offer"
                            icon={Calendar}
                            multiline
                        />
                    </div>
                </Section>

                {/* Section B: Search Criteria */}
                <Section title="B. Search Criteria" icon={Search} color="emerald">
                    <div className="space-y-5">
                        {/* Recommended Titles */}
                        <TagInput
                            label="Recommended Titles"
                            tags={recommendedTitles}
                            onTagsChange={setRecommendedTitles}
                            placeholder="e.g., Software Engineer, SDE..."
                            color="emerald"
                        />

                        {/* Experience Range */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" />
                                Experience Range (Years)
                            </label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    min={0}
                                    value={experienceMin}
                                    onChange={(e) => setExperienceMin(parseInt(e.target.value) || 0)}
                                    className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                />
                                <span className="text-slate-500">to</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={experienceMax}
                                    onChange={(e) => setExperienceMax(parseInt(e.target.value) || 0)}
                                    className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Keywords */}
                        <TagInput
                            label="Search Keywords"
                            tags={keywords}
                            onTagsChange={setKeywords}
                            placeholder="e.g., microservices, cloud-native..."
                            color="emerald"
                        />

                        {/* Exclude Keywords */}
                        <TagInput
                            label="Exclude Keywords"
                            tags={excludeKeywords}
                            onTagsChange={setExcludeKeywords}
                            placeholder="e.g., junior, intern..."
                            color="red"
                        />

                        {/* Preferred Industries */}
                        <TagInput
                            label="Preferred Industries"
                            tags={preferredIndustries}
                            onTagsChange={setPreferredIndustries}
                            placeholder="e.g., Fintech, Healthcare..."
                            color="purple"
                        />

                        {/* Quick Stats from AI Analysis */}
                        {enhancedIntake && (
                            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AI Insights</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500">Seniority:</span>
                                        <span className="text-white ml-2">{enhancedIntake.seniorityLevel}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Industry:</span>
                                        <span className="text-white ml-2">{enhancedIntake.domainContext?.industry}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Product:</span>
                                        <span className="text-white ml-2">{enhancedIntake.domainContext?.productType}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Urgency:</span>
                                        <span className="text-white ml-2">{enhancedIntake.hiringUrgency || 'Not specified'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Section C: Sourcing Strategy */}
                <Section title="C. Sourcing Strategy" icon={Target} color="purple">
                    {isGeneratingStrategy ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="relative w-12 h-12 mb-4">
                                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-slate-400 text-sm">Generating sourcing strategy...</p>
                        </div>
                    ) : searchStrategy ? (
                        <div className="space-y-5">
                            {/* Boolean Search Strings */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5" />
                                    LinkedIn Boolean Searches
                                </label>
                                <div className="space-y-3">
                                    {searchStrategy.booleanSearchStrings.map((search, index) => (
                                        <BooleanSearchCard
                                            key={index}
                                            query={search.query}
                                            description={search.description}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Target Companies by Tier */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Building className="w-3.5 h-3.5" />
                                    Target Companies
                                </label>
                                <div className="space-y-3">
                                    <CompanyTier tier={1} companies={searchStrategy.targetCompanies.tier1} label="Tier 1 - Best Fit" />
                                    <CompanyTier tier={2} companies={searchStrategy.targetCompanies.tier2} label="Tier 2 - Good Fit" />
                                    <CompanyTier tier={3} companies={searchStrategy.targetCompanies.tier3} label="Tier 3 - Worth Exploring" />
                                </div>
                            </div>

                            {/* Search Tips */}
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clipboard className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Search Tips</span>
                                </div>
                                <ul className="space-y-2">
                                    {searchStrategy.searchTips.map((tip, index) => (
                                        <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Regenerate Button */}
                            <button
                                onClick={generateStrategy}
                                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-sm text-slate-300 transition-colors flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Regenerate Strategy
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Globe className="w-12 h-12 text-slate-600 mb-4" />
                            <p className="text-slate-400 text-sm mb-4">No sourcing strategy generated yet</p>
                            <button
                                onClick={generateStrategy}
                                className="py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generate Strategy
                            </button>
                        </div>
                    )}
                </Section>
            </div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end gap-4"
            >
                <button
                    onClick={handleSave}
                    className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative flex items-center gap-2">
                        Save & Continue
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </button>
            </motion.div>
        </div>
    );
}

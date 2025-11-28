import { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, Check, HelpCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { Candidate, Job, EmailDraft } from '../types';

interface EmailGenerationProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  job: Job;
  onSave?: (draft: EmailDraft) => void;
}

type ToneOption = 'casual' | 'professional' | 'excited';

// Generate screening questions from candidate gaps
function generateScreeningQuestions(candidate: Candidate, job: Job): string[] {
  const questions: string[] = [];
  const evaluation = candidate.evaluation;

  if (!evaluation) {
    // Default questions if no evaluation
    return [
      `What interests you most about ${job.title} roles?`,
      `Can you tell us about your experience with ${job.mustHaveSkills[0] || 'relevant technologies'}?`,
    ];
  }

  // Questions from gaps
  if (evaluation.gaps && evaluation.gaps.length > 0) {
    const gap = evaluation.gaps[0];
    questions.push(`We noticed ${gap.toLowerCase()}. Can you share any relevant experience that addresses this?`);
  }

  // Questions from areas to assess
  if (evaluation.screeningNotes?.gapsAndLimitations?.length > 0) {
    const limitation = evaluation.screeningNotes.gapsAndLimitations[0];
    questions.push(`Regarding ${limitation.toLowerCase()}, what's your approach to getting up to speed?`);
  }

  // Questions from interview pointers
  if (evaluation.interviewPointers && evaluation.interviewPointers.length > 0) {
    const pointer = evaluation.interviewPointers[0];
    questions.push(pointer.question);
  }

  // Fallback questions based on job requirements
  if (questions.length === 0) {
    if (job.mustHaveSkills.length > 0) {
      questions.push(`Can you walk us through a project where you used ${job.mustHaveSkills[0]}?`);
    }
    questions.push(`What excites you about this ${job.title} opportunity?`);
  }

  return questions.slice(0, 3);
}

// Get personalization hooks from evaluation
function getPersonalizationPoints(candidate: Candidate): string[] {
  const points: string[] = [];
  const evaluation = candidate.evaluation;

  if (!evaluation) return points;

  // Add strengths as personalization hooks
  if (evaluation.strengths && evaluation.strengths.length > 0) {
    points.push(...evaluation.strengths.slice(0, 2));
  }

  // Add experience highlights
  if (evaluation.experienceHighlights && evaluation.experienceHighlights.length > 0) {
    const exp = evaluation.experienceHighlights[0];
    points.push(`${exp.role} at ${exp.company}`);
  }

  return points;
}

export function EmailGeneration({ isOpen, onClose, candidate, job, onSave }: EmailGenerationProps) {
  const { isDark } = useTheme();
  const [tone, setTone] = useState<ToneOption>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>([]);
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !body) {
      generateEmail();
    }
  }, [isOpen]);

  const generateEmail = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 500));

    const firstName = candidate.name.split(' ')[0];
    const evaluation = candidate.evaluation;
    const personalizationPoints = getPersonalizationPoints(candidate);
    const questions = generateScreeningQuestions(candidate, job);
    setScreeningQuestions(questions);

    // Get a strength to highlight (evidence-based, no fluff)
    const strengthHighlight = personalizationPoints[0] || '';
    const specificStrength = strengthHighlight
      ? strengthHighlight.charAt(0).toLowerCase() + strengthHighlight.slice(1)
      : '';

    // Get the experience detail for personalization
    const expHighlight = evaluation?.experienceHighlights?.[0];
    const experienceDetail = expHighlight
      ? `your work as ${expHighlight.role} at ${expHighlight.company}`
      : candidate.currentJobTitle && candidate.currentCompany
        ? `your experience as ${candidate.currentJobTitle} at ${candidate.currentCompany}`
        : 'your background';

    const subjects: Record<ToneOption, string> = {
      casual: `Hey ${firstName} - ${job.title} at ${job.company}`,
      professional: `${job.title} Opportunity at ${job.company}`,
      excited: `${firstName} - Perfect fit for ${job.title}!`,
    };

    // Build screening questions section if enabled
    const questionsSection = includeQuestions && questions.length > 0
      ? `\n\nBefore we chat, a couple quick questions:\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    const bodies: Record<ToneOption, string> = {
      casual: `Hi ${firstName},

${specificStrength ? `I noticed ${specificStrength} - ` : ''}I came across your profile and thought you'd be a great fit for what we're building.

We're hiring a ${job.title} at ${job.company}${job.location ? ` in ${job.location}` : ''}. ${job.workMode !== 'on-site' ? `This is a ${job.workMode} position.` : ''}

${experienceDetail ? `Based on ${experienceDetail}, I think you'd bring exactly the skills we need.` : ''}${questionsSection}

Would you be open to a quick chat this week?

Best,
[Your Name]`,

      professional: `Dear ${candidate.name},

I am reaching out regarding the ${job.title} position at ${job.company}.

${experienceDetail ? `I was impressed by ${experienceDetail}.` : ''} ${specificStrength ? `Specifically, ${specificStrength} aligns well with what we're looking for.` : 'Your background aligns well with our requirements.'}

Position details:
- Role: ${job.title}
- Department: ${job.department || 'Engineering'}
- Location: ${job.location || 'Remote'}${job.workMode !== 'on-site' ? ` (${job.workMode})` : ''}
${job.salaryMin && job.salaryMax ? `- Compensation: $${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : ''}${questionsSection}

I would welcome the opportunity to discuss this further at your convenience.

Best regards,
[Your Name]`,

      excited: `Hi ${firstName}!

${specificStrength ? `Wow - ${specificStrength}! ` : ''}I had to reach out because your profile is exactly what we've been looking for.

We're growing the team at ${job.company} and need a ${job.title}${job.location ? ` based in ${job.location}` : ''}. ${experienceDetail ? `Your experience with ${experienceDetail} would be incredibly valuable here!` : ''}${questionsSection}

Would love to tell you more if you're interested!

Cheers,
[Your Name]`,
    };

    setSubject(subjects[tone]);
    setBody(bodies[tone]);
    setIsGenerating(false);
  };

  const handleToneChange = (newTone: ToneOption) => {
    setTone(newTone);
    generateEmail();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave) {
      const draft: EmailDraft = {
        id: `email-${Date.now()}`,
        jobId: job.id,
        candidateId: candidate.id,
        subject,
        body,
        tone,
        personalizationPoints: getPersonalizationPoints(candidate),
        createdAt: new Date(),
      };
      onSave(draft);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-xl overflow-hidden
          ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Generate Email for {candidate.name}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Personalization Insights (from evaluation) */}
          {candidate.evaluation && (
            <div className={`rounded-lg p-3 ${isDark ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-cyan-500" />
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  Personalization Data
                </span>
              </div>
              <div className="space-y-1">
                {candidate.evaluation.strengths?.slice(0, 2).map((strength, i) => (
                  <p key={i} className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    + {strength}
                  </p>
                ))}
                {candidate.evaluation.gaps?.slice(0, 1).map((gap, i) => (
                  <p key={i} className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    ? {gap}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Tone Selection + Screening Questions Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Tone
              </label>
              <div className="flex gap-2">
                {(['casual', 'professional', 'excited'] as ToneOption[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleToneChange(t)}
                    disabled={isGenerating}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                      ${tone === t
                        ? 'bg-blue-600 text-white'
                        : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQuestions}
                  onChange={(e) => {
                    setIncludeQuestions(e.target.checked);
                    setTimeout(generateEmail, 100);
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Include screening questions
                </span>
                <HelpCircle size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
              </label>
            </div>
          </div>

          {/* Auto-generated Screening Questions Preview */}
          {includeQuestions && screeningQuestions.length > 0 && (
            <div className={`rounded-lg p-3 ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={14} className="text-purple-500" />
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  Screening Questions (from gaps)
                </span>
              </div>
              <div className="space-y-1">
                {screeningQuestions.map((q, i) => (
                  <p key={i} className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {i + 1}. {q}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isGenerating}
              className={`w-full px-3 py-2 rounded-lg border outline-none
                ${isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-200 text-slate-900'}
                ${isGenerating ? 'opacity-50' : ''}`}
            />
          </div>

          {/* Body */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Email Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isGenerating}
              rows={10}
              className={`w-full px-3 py-2 rounded-lg border outline-none resize-none font-mono text-sm
                ${isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-200 text-slate-900'}
                ${isGenerating ? 'opacity-50' : ''}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={generateEmail}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
            Regenerate
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isGenerating || !body}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleSave}
              disabled={isGenerating || !body}
              className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

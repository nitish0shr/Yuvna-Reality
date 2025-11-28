import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, Sparkles, Zap, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { useStore } from '../../store/useStore';
import { parseFile, generateId } from '../../utils/fileParser';
import { extractJobDetails, isAPIConfigured } from '../../utils/ai';
import type { Job } from '../../types';

export function JobUploadStep() {
  const { isDark } = useTheme();
  const { play } = useSound();
  const { setCurrentJob, setPhase } = useStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processJobDescription = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);

    try {
      const content = await parseFile(file);

      if (!content || content.trim().length < 50) {
        throw new Error('The file appears to be empty or too short. Please upload a valid job description.');
      }

      const job: Job = {
        id: generateId(),
        title: '',
        company: '',
        department: null,
        location: null,
        workMode: 'remote',
        employmentType: 'full-time',
        salaryMin: null,
        salaryMax: null,
        hiringManager: null,
        status: 'draft',
        rawDescription: content,
        mustHaveSkills: [],
        niceToHaveSkills: [],
        dealBreakers: [],
        areasToAssess: [],
        certifications: [],
        requiresSponsorship: null,
        minYearsExperience: 0,
        notes: '',
        hiringManagerTitle: null,
        executiveSummary: null,
        intakeCompleteness: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isAPIConfigured()) {
        try {
          const extracted = await extractJobDetails(content);
          Object.assign(job, {
            title: extracted.title || '',
            company: extracted.company || '',
            department: extracted.department || null,
            location: extracted.location || null,
            workMode: extracted.workMode || 'remote',
            salaryMin: extracted.salaryMin || null,
            salaryMax: extracted.salaryMax || null,
            mustHaveSkills: extracted.mustHaveSkills || [],
            niceToHaveSkills: extracted.niceToHaveSkills || [],
            dealBreakers: extracted.dealBreakers || [],
            certifications: extracted.certifications || [],
            requiresSponsorship: extracted.requiresSponsorship ?? null,
            minYearsExperience: extracted.minYearsExperience || 0,
            hiringManagerTitle: extracted.hiringManagerTitle || null,
            executiveSummary: extracted.executiveSummary || null,
          });
        } catch (aiError) {
          console.error('AI extraction failed, using basic parsing:', aiError);
          extractBasicDetails(content, job);
        }
      } else {
        extractBasicDetails(content, job);
      }

      setCurrentJob(job);
      play('jd_upload_success');
      setPhase('analyze-job');
    } catch (err) {
      console.error('Error processing job description:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the file');
      play('parse_error');
    } finally {
      setIsProcessing(false);
    }
  }, [setCurrentJob, setPhase, play]);

  const extractBasicDetails = (content: string, job: Job) => {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 100 && !firstLine.includes('@') && !firstLine.includes('http')) {
        job.title = firstLine;
      }
    }

    const companyMatch = content.match(/(?:company|employer|organization)[:\s]+([A-Z][A-Za-z0-9\s&,.\-']{2,40})/i);
    if (companyMatch) {
      job.company = companyMatch[1].trim();
    }

    const locationMatch = content.match(/(?:location|based in|office)[:\s]+([A-Za-z][A-Za-z\s,.\-]{2,50})/i);
    if (locationMatch) {
      job.location = locationMatch[1].trim();
    }

    const expMatch = content.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i);
    if (expMatch) {
      job.minYearsExperience = parseInt(expMatch[1], 10);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processJobDescription(files[0]);
    }
  }, [processJobDescription]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processJobDescription(files[0]);
    }
    if (e.target) e.target.value = '';
  }, [processJobDescription]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Upload Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />

            <motion.div
              whileHover={{ scale: isProcessing ? 1 : 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all
                ${isDragging
                  ? isDark
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]'
                    : 'border-blue-500 bg-blue-50 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                  : isDark
                    ? 'border-slate-700 bg-slate-900/80 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                    : 'border-slate-300 bg-white hover:border-blue-400 hover:shadow-lg'}
                ${isProcessing ? 'pointer-events-none' : ''}`}
            >
              {isProcessing ? (
                <div className="text-center py-4">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <Loader2 className={`w-16 h-16 animate-spin ${isDark ? 'text-cyan-400' : 'text-blue-500'}`} />
                    <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${isDark ? 'bg-cyan-400' : 'bg-blue-400'}`} />
                  </div>
                  <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Processing...
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Analyzing {fileName}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <motion.div
                    animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                    className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center
                      ${isDark
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                        : 'bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200'}`}
                  >
                    {isDragging ? (
                      <FileText className={isDark ? 'text-cyan-400' : 'text-blue-500'} size={36} />
                    ) : (
                      <Upload className={isDark ? 'text-cyan-400' : 'text-blue-500'} size={36} />
                    )}
                  </motion.div>
                  <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {isDragging ? 'Drop it here!' : 'Upload Job Description'}
                  </h2>
                  <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Drag & drop or click to browse
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {['PDF', 'DOCX', 'TXT'].map((format) => (
                      <span
                        key={format}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium
                          ${isDark
                            ? 'bg-slate-800 text-slate-300 border border-slate-700'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl text-sm ${isDark ? 'bg-red-900/30 border border-red-800 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'}`}
              >
                {error}
              </motion.div>
            )}
          </motion.div>

          {/* Right side - Copy & Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <h1 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Start Your Candidate Review
              </h1>
              <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Drop a job description. Watch AI stage a full candidate review in seconds.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Sparkles, title: 'AI-Powered Analysis', desc: 'Extracts skills, requirements, and key criteria automatically' },
                { icon: Zap, title: 'Instant Scoring', desc: 'Candidates ranked by fit with detailed breakdowns' },
                { icon: Users, title: 'Smart Matching', desc: 'Surface top talent with strengths and gaps identified' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-xl
                    ${isDark
                      ? 'bg-slate-900/50 border border-slate-800'
                      : 'bg-white border border-slate-200'}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isDark
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                      : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}
                  >
                    <feature.icon size={20} className={isDark ? 'text-cyan-400' : 'text-blue-500'} />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

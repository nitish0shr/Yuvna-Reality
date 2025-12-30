import type { Job, Candidate, CandidateEvaluation, PersonalizedMessage, EnhancedIntake, SearchStrategy, IdealCandidatePersona, LLMProvider, MultiLLMResult, MultiLLMJobAnalysis } from '../types';

// ============================================
// LLM CONFIGURATION - Multi-provider support
// Uses backend proxy at localhost:3001 to avoid CORS issues
// ============================================
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

// Backend proxy URL - set to empty to use direct API calls
const API_PROXY_URL = 'http://localhost:3001';

export interface LLMConfig {
  provider: LLMProvider;
  isConfigured: boolean;
}

export function getLLMProviders(): LLMConfig[] {
  return [
    { provider: 'openai', isConfigured: !!OPENAI_API_KEY },
    { provider: 'anthropic', isConfigured: !!ANTHROPIC_API_KEY },
    { provider: 'gemini', isConfigured: !!GEMINI_API_KEY },
  ];
}

export function getConfiguredProviders(): LLMProvider[] {
  return getLLMProviders().filter(p => p.isConfigured).map(p => p.provider);
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ============================================
// UNIFIED LLM CALL VIA PROXY
// Routes all requests through backend to avoid CORS issues
// ============================================
async function callViaProxy(
  provider: LLMProvider,
  messages: LLMMessage[],
  jsonMode = false,
  temperature = 0.25
): Promise<string> {
  const response = await fetch(`${API_PROXY_URL}/api/${provider}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, jsonMode, temperature }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to call ${provider} API`);
  }

  const data = await response.json();
  return data.content;
}

// ============================================
// DIRECT API CALLS (fallback if proxy unavailable)
// ============================================
async function callOpenAIDirect(
  messages: LLMMessage[],
  jsonMode = false,
  temperature = 0.25
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature,
      max_tokens: 4000,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to call OpenAI API');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGeminiDirect(
  messages: LLMMessage[],
  jsonMode = false,
  temperature = 0.25
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured.');
  }

  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  if (systemMessage) {
    contents.unshift({
      role: 'user',
      parts: [{ text: `System Instructions:\n${systemMessage}${jsonMode ? '\n\nIMPORTANT: Respond with valid JSON only.' : ''}` }],
    });
    contents.splice(1, 0, {
      role: 'model',
      parts: [{ text: 'Understood. I will follow these instructions.' }],
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: 4096,
          ...(jsonMode && { responseMimeType: 'application/json' }),
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to call Gemini API');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// ============================================
// UNIFIED LLM CALL - Uses proxy first, falls back to direct
// ============================================
export async function callLLM(
  provider: LLMProvider,
  messages: LLMMessage[],
  jsonMode = false,
  temperature = 0.25
): Promise<string> {
  // Try proxy first
  try {
    return await callViaProxy(provider, messages, jsonMode, temperature);
  } catch (proxyError) {
    const errorMessage = proxyError instanceof Error ? proxyError.message : String(proxyError);

    // Don't fall back if the proxy returned a valid error (like rate limit or API error)
    // Only fall back if the proxy itself is unavailable (network/connection error)
    const isProxyError = errorMessage.includes('rate_limit') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('API error') ||
      errorMessage.includes('API key') ||
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('401') ||
      errorMessage.includes('429') ||
      errorMessage.includes('500');

    if (isProxyError) {
      // Proxy is working but returned an API error - don't fall back, just rethrow
      throw proxyError;
    }

    console.warn(`Proxy unavailable for ${provider}, trying direct call...`, proxyError);

    // Fall back to direct calls (only works for OpenAI and Gemini due to CORS)
    switch (provider) {
      case 'openai':
        return callOpenAIDirect(messages, jsonMode, temperature);
      case 'gemini':
        return callGeminiDirect(messages, jsonMode, temperature);
      case 'anthropic':
        throw new Error('Claude requires the backend proxy server. Run: node server.js');
      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }
  }
}

// ============================================
// MULTI-LLM CALL - Calls all configured providers
// ============================================

export async function callAllLLMs<T>(
  messages: LLMMessage[],
  jsonMode = false,
  temperature = 0.25,
  parser?: (response: string) => T
): Promise<MultiLLMResult<T>[]> {
  const providers = getConfiguredProviders();

  if (providers.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    providers.map(async (provider) => {
      const response = await callLLM(provider, messages, jsonMode, temperature);
      const parsed = parser ? parser(response) : (response as unknown as T);
      return { provider, result: parsed, error: null };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        provider: providers[index],
        result: null,
        error: result.reason?.message || 'Unknown error',
      };
    }
  });
}

// Call the selected LLM provider (uses store)
export async function callSelectedLLM(
  messages: LLMMessage[],
  jsonMode = false,
  temperature = 0.25,
  selectedProvider?: LLMProvider
): Promise<string> {
  // If no provider specified, default to anthropic (Claude)
  const provider = selectedProvider || 'anthropic';
  return callLLM(provider, messages, jsonMode, temperature);
}

export async function extractJobDetails(
  jobDescription: string,
  selectedProvider?: LLMProvider
): Promise<Partial<Job>> {
  // MASTER PROMPT: JD ANALYZER with Role Prompting + Chain of Thought
  const systemPrompt = `### SYSTEM ROLE
You are an expert Senior Talent Acquisition Lead with 20 years of experience in technical and executive recruiting. Your specialty is deconstructing complex Job Descriptions (JDs) to extract critical hiring criteria that others often miss.

### INSTRUCTIONS
I will provide you with a Job Description. Your task is to analyze this text deeply. You must read through the JD twice internally before generating an output to ensure no detail is missed.

### ANALYSIS STEPS (Chain of Thought)
1. **First Pass:** Identify the explicit requirements, logistics, and organizational structure.
2. **Second Pass:** Infer the implicit needs, such as "Deal Breakers" (e.g., if a clearance is required, citizenship is an implied deal breaker) and specific sales or certification requirements.
3. **Synthesis:** Structure the data into the specific format below. If a specific detail (like Budget or Manager Name) is not present in the text, explicitly state null.

### CRITICAL EXTRACTION RULES

**Deal Breakers to Infer:**
- Security clearance mentioned → Citizenship is likely required
- "Must be authorized to work" → No sponsorship available
- "On-site required" → Remote not an option
- Specific certifications listed as "required" → Non-negotiable
- "Book of business required" → Sales quota expectation

**Sponsorship Detection:**
- "Visa sponsorship is not available" → requiresSponsorship: false
- "Must be authorized to work in the US" → requiresSponsorship: false
- "US Citizen or Green Card only" → requiresSponsorship: false
- "Will sponsor" or no mention → requiresSponsorship: null
- "Sponsorship available" → requiresSponsorship: true

**Skills Extraction:**
- Must-Have: Skills explicitly listed as "required", "must have", "essential", or in a "Requirements" section
- Nice-to-Have: Skills listed as "preferred", "nice to have", "bonus", "plus", or in a "Preferred Qualifications" section

Return a JSON object with these EXACT fields:
{
  "title": "<string: the job title>",
  "company": "<string: company name, or 'Company' if not found>",
  "department": "<string: department/team name if mentioned, or null>",
  "requiresSponsorship": <boolean | null: true if available, false if not available, null if unclear>,
  "location": "<string | null: city, state, country or 'Remote'>",
  "workMode": "<'remote' | 'hybrid' | 'on-site': infer from description>",
  "salaryMin": <number | null: minimum annual salary>,
  "salaryMax": <number | null: maximum annual salary>,
  "mustHaveSkills": ["<skill 1>", "<skill 2>", ...],
  "niceToHaveSkills": ["<skill 1>", "<skill 2>", ...],
  "minYearsExperience": <number: minimum years required, default 0>,
  "certifications": ["<required cert 1>", ...],
  "dealBreakers": ["<deal breaker 1 - e.g., 'US Citizenship required for security clearance'>", ...],
  "hiringManagerTitle": "<string | null: who does this role report to>",
  "executiveSummary": "<string: 2-3 sentence ELI5 summary of what this person will do day-to-day>"
}

Be precise and evidence-based. For each skill, only include it if you can point to where it appears in the JD.`;

  const response = await callLLM(
    selectedProvider || 'anthropic',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: jobDescription },
    ],
    true,
    0.2 // Very low temperature for precise extraction
  );

  return JSON.parse(response);
}

// ============================================
// MULTI-LLM JD EXTRACTION - Uses all configured LLMs
// ============================================

export async function extractJobDetailsMultiLLM(
  jobDescription: string
): Promise<MultiLLMJobAnalysis> {
  const systemPrompt = `### SYSTEM ROLE
You are an expert Senior Talent Acquisition Lead with 20 years of experience in technical and executive recruiting. Your specialty is deconstructing complex Job Descriptions (JDs) to extract critical hiring criteria that others often miss.

### INSTRUCTIONS
I will provide you with a Job Description. Your task is to analyze this text deeply. You must read through the JD twice internally before generating an output to ensure no detail is missed.

### ANALYSIS STEPS (Chain of Thought)
1. **First Pass:** Identify the explicit requirements, logistics, and organizational structure.
2. **Second Pass:** Infer the implicit needs, such as "Deal Breakers" (e.g., if a clearance is required, citizenship is an implied deal breaker) and specific sales or certification requirements.
3. **Synthesis:** Structure the data into the specific format below. If a specific detail (like Budget or Manager Name) is not present in the text, explicitly state null.

### CRITICAL EXTRACTION RULES

**Deal Breakers to Infer:**
- Security clearance mentioned → Citizenship is likely required
- "Must be authorized to work" → No sponsorship available
- "On-site required" → Remote not an option
- Specific certifications listed as "required" → Non-negotiable
- "Book of business required" → Sales quota expectation

**Sponsorship Detection:**
- "Visa sponsorship is not available" → requiresSponsorship: false
- "Must be authorized to work in the US" → requiresSponsorship: false
- "US Citizen or Green Card only" → requiresSponsorship: false
- "Will sponsor" or no mention → requiresSponsorship: null
- "Sponsorship available" → requiresSponsorship: true

**Skills Extraction:**
- Must-Have: Skills explicitly listed as "required", "must have", "essential", or in a "Requirements" section
- Nice-to-Have: Skills listed as "preferred", "nice to have", "bonus", "plus", or in a "Preferred Qualifications" section

Return a JSON object with these EXACT fields:
{
  "title": "<string: the job title>",
  "company": "<string: company name, or 'Company' if not found>",
  "department": "<string: department/team name if mentioned, or null>",
  "requiresSponsorship": <boolean | null: true if available, false if not available, null if unclear>,
  "location": "<string | null: city, state, country or 'Remote'>",
  "workMode": "<'remote' | 'hybrid' | 'on-site': infer from description>",
  "salaryMin": <number | null: minimum annual salary>,
  "salaryMax": <number | null: maximum annual salary>,
  "mustHaveSkills": ["<skill 1>", "<skill 2>", ...],
  "niceToHaveSkills": ["<skill 1>", "<skill 2>", ...],
  "minYearsExperience": <number: minimum years required, default 0>,
  "certifications": ["<required cert 1>", ...],
  "dealBreakers": ["<deal breaker 1 - e.g., 'US Citizenship required for security clearance'>", ...],
  "hiringManagerTitle": "<string | null: who does this role report to>",
  "executiveSummary": "<string: 2-3 sentence ELI5 summary of what this person will do day-to-day>"
}

Be precise and evidence-based. For each skill, only include it if you can point to where it appears in the JD.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: jobDescription },
  ];

  // Call all configured LLMs in parallel
  const results = await callAllLLMs<Partial<Job>>(
    messages,
    true,
    0.2,
    (response) => JSON.parse(response)
  );

  // Combine results from all LLMs
  const validResults = results.filter((r) => r.result !== null);

  if (validResults.length === 0) {
    throw new Error('No LLM providers returned valid results');
  }

  // Merge results with voting/consensus
  const combinedJob = mergeJobResults(validResults.map((r) => r.result!));

  // Calculate confidence based on agreement
  const confidence = calculateConfidence(validResults.map((r) => r.result!));

  return {
    combinedJob,
    providerResults: results,
    confidence,
  };
}

// Merge job results from multiple LLMs with voting
function mergeJobResults(results: Partial<Job>[]): Partial<Job> {
  if (results.length === 0) return {};
  if (results.length === 1) return results[0];

  // Helper to get most common value
  const getMostCommon = <T>(values: T[]): T | undefined => {
    if (values.length === 0) return undefined;
    const counts = new Map<string, { value: T; count: number }>();
    values.forEach((v) => {
      if (v === undefined || v === null) return;
      const key = JSON.stringify(v);
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { value: v, count: 1 });
      }
    });
    const sorted = Array.from(counts.values()).sort((a, b) => b.count - a.count);
    return sorted.length > 0 ? sorted[0].value : undefined;
  };

  // Helper to merge arrays with deduplication
  const mergeArrays = (arrays: string[][]): string[] => {
    const allItems = arrays.flat();
    const uniqueItems = [...new Set(allItems.map((s) => s.toLowerCase()))];
    // Get original casing from first occurrence
    return uniqueItems.map((lower) => allItems.find((s) => s.toLowerCase() === lower) || lower);
  };

  return {
    title: getMostCommon(results.map((r) => r.title).filter(Boolean) as string[]),
    company: getMostCommon(results.map((r) => r.company).filter(Boolean) as string[]),
    department: getMostCommon(results.map((r) => r.department).filter((d) => d !== null) as string[]) || null,
    location: getMostCommon(results.map((r) => r.location).filter((l) => l !== null) as string[]) || null,
    workMode: getMostCommon(results.map((r) => r.workMode).filter(Boolean) as Job['workMode'][]),
    requiresSponsorship: getMostCommon(results.map((r) => r.requiresSponsorship)),
    salaryMin: getMostCommon(results.map((r) => r.salaryMin).filter((s) => s !== null) as number[]) || null,
    salaryMax: getMostCommon(results.map((r) => r.salaryMax).filter((s) => s !== null) as number[]) || null,
    mustHaveSkills: mergeArrays(results.map((r) => r.mustHaveSkills || [])),
    niceToHaveSkills: mergeArrays(results.map((r) => r.niceToHaveSkills || [])),
    minYearsExperience: getMostCommon(results.map((r) => r.minYearsExperience).filter((y) => y !== undefined) as number[]) || 0,
    certifications: mergeArrays(results.map((r) => r.certifications || [])),
    dealBreakers: mergeArrays(results.map((r) => r.dealBreakers || [])),
    hiringManagerTitle: getMostCommon(results.map((r) => r.hiringManagerTitle).filter((h) => h !== null) as string[]) || null,
    executiveSummary: results[0].executiveSummary || null, // Take the first valid summary
  };
}

// Calculate confidence scores based on agreement between LLMs
function calculateConfidence(results: Partial<Job>[]): { title: number; skills: number; overall: number } {
  if (results.length <= 1) {
    return { title: 100, skills: 100, overall: 100 };
  }

  // Title agreement
  const titles = results.map((r) => r.title?.toLowerCase()).filter(Boolean);
  const uniqueTitles = new Set(titles);
  const titleConfidence = Math.round((1 - (uniqueTitles.size - 1) / results.length) * 100);

  // Skills agreement (Jaccard similarity)
  const allMustHave = results.map((r) => new Set(r.mustHaveSkills?.map((s) => s.toLowerCase()) || []));
  let skillsAgreement = 0;
  if (allMustHave.length > 1) {
    for (let i = 0; i < allMustHave.length; i++) {
      for (let j = i + 1; j < allMustHave.length; j++) {
        const intersection = [...allMustHave[i]].filter((x) => allMustHave[j].has(x)).length;
        const union = new Set([...allMustHave[i], ...allMustHave[j]]).size;
        skillsAgreement += union > 0 ? intersection / union : 1;
      }
    }
    skillsAgreement = skillsAgreement / ((allMustHave.length * (allMustHave.length - 1)) / 2);
  } else {
    skillsAgreement = 1;
  }
  const skillsConfidence = Math.round(skillsAgreement * 100);

  // Overall is average of components
  const overall = Math.round((titleConfidence + skillsConfidence) / 2);

  return { title: titleConfidence, skills: skillsConfidence, overall };
}

// Helper function to truncate text to stay within token limits
// Rough estimate: 1 token ≈ 4 characters for English text
function truncateToTokenLimit(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;

  // Truncate and add indicator
  return text.substring(0, maxChars - 100) + '\n\n[... Resume truncated for length. Key information above should be sufficient for evaluation ...]';
}

export async function evaluateCandidate(
  candidate: Candidate,
  job: Job
): Promise<CandidateEvaluation> {
  // Truncate resume and JD to prevent token limit errors
  // Reserve ~8K tokens for system prompt, ~4K for response = ~12K for content
  const maxResumeTokens = 6000; // ~24K chars
  const maxJDTokens = 4000; // ~16K chars

  const truncatedResume = truncateToTokenLimit(candidate.rawResume || '', maxResumeTokens);
  const truncatedJD = truncateToTokenLimit(job.rawDescription || '', maxJDTokens);

  // MASTER PROMPT: Resume Analysis, Ranking & Screening Notes
  // Combines Role Prompting + Evidence Verification + 11-Section Evaluation Framework
  // FULLY GENERIC - adapts to ANY job description and resume
  const systemPrompt = `### SYSTEM ROLE
You are a Senior Recruiter with 15+ years of experience evaluating candidates against job descriptions. You do NOT rely on keyword matching; you rely on EVIDENCE of experience found within candidate projects and work history. Your evaluation must be ready to share directly with decision-makers.

### CRITICAL: THIS IS A GENERIC, REUSABLE PROMPT
- You will evaluate ANY type of role (technical, non-technical, executive, creative, etc.)
- Extract ALL requirements directly from the provided Job Description
- Never assume or infer skills/requirements not explicitly stated in the JD
- Adapt your evaluation criteria to match the domain of the role

### CRITICAL: FOCUS ON LAST 7-8 YEARS
Evaluate only the last 7-8 years of relevant experience unless older experience is extremely crucial for the role.

### EVALUATION METHODOLOGY (11 Sections)

**Section 1: Candidate Identification**
Extract and identify:
- Full Name, First Name, Last Name
- Current Job Title & Current Employer
- Candidate Location (city/state/country)
- If contractor → label as "Contract Candidate"
- If frequent job changes in last 5-6 years → label as "Frequent Job Changes Noted"

**Section 2: Candidate Summary**
Brief summary of experience level, industries worked in, functional/domain strengths, notable capabilities.

**Section 2.5: Career Journey (Last 10 Years)**
Extract a structured timeline of their career. For each role, identify if it was:
- "Growth": Promotion or increased responsibility within same company or move to better role
- "Pivot": Significant change in industry or function
- "Tenure": Long-term commitment (3+ years) in a role

**Section 3: Must-Have Requirements Match**
For EACH must-have requirement from the JD: Met / Partially Met / Not Met
Include supporting examples from resume. If missing, say "Not demonstrated in resume."

**Section 4: Good-to-Have Skills Match**
Same evaluation as Section 3 for nice-to-have skills.

**Section 5: Experience Relevance (Last 7-8 Years)**
Summarize relevant roles, responsibilities, projects from the last 7-8 years. Note any gaps or irrelevant portions.

**Section 6: Gaps / Risks / Deal Breakers**
Evaluate: Missing must-haves, lack of core experience, resume inconsistencies, unexplained gaps, excessive job hopping, visa/sponsorship concerns, missing mandatory certifications.

**Section 7: Strengths**
List evidence-based strengths tied to the JD.

**Section 8: Weaknesses**
List concerns, missing skills, or misalignment.

**Section 9: Candidate Fit Scores**
Provide: Must-Have Match %, Good-to-Have Match %, Overall Fit Score %

**Section 10: Personalized Screening Notes**
Write recruiter-style notes referencing candidate by name, highlighting strong alignment, mentioning concerns. Be specific, human, and evidence-based.

**Section 11: Recommendation**
Choose: Move to phone screen / Keep warm in pipeline / Reject. Justify with reasoning.

# THE "NO-FLUFF" POLICY (CRITICAL)

**BANNED PHRASES - NEVER USE THESE:**
- "strong background"
- "seasoned professional"
- "impressive track record"
- "wealth of experience"
- "proven ability"
- "extensive experience"
- "strong technical skills"
- "excellent communicator"
- "team player"
- "results-driven"

**EVIDENCE RULE:** Every claim MUST include specific context from the resume.
- BAD: "Candidate has strong skills in [X]."
- GOOD: "Candidate applied [skill] at [Company] ([years]) in the context of [specific project/achievement with measurable outcome]."

# PATTERN DETECTION (Behavioral Analysis)

Analyze employment history to detect:

1. **JOB HOPPING:** Flag as TRUE if candidate has 3+ roles with less than 1.5 years tenure each in the last 5 years.
   - Calculate average tenure from dates
   - Note: Contracting is different from hopping

2. **CONTRACTOR PATTERN:** Flag as TRUE if:
   - Job titles contain "Contract", "Consultant", "Freelance"
   - Resume lists "Clients" rather than employers
   - Multiple short-term engagements by design

Return flags in this format:
"flags": {
  "isJobHopper": boolean,
  "isContractor": boolean,
  "flagReason": "string describing the pattern, e.g., 'X jobs in Y years, avg tenure Z yrs'"
}

# SCORING ALGORITHM (0-100 total)

1. MUST-HAVE SKILLS MATCH (max 20 points):
   - Award 20 points if ALL must-have skills are present WITH CLEAR EVIDENCE (project/work context)
   - Deduct proportionally for each missing skill OR skill without evidence
   - Skills to check (from uploaded JD): ${job.mustHaveSkills.length > 0 ? job.mustHaveSkills.join(', ') : 'Extract from the Job Description provided below'}

2. NICE-TO-HAVE SKILLS MATCH (max 15 points):
   - +3 points per skill with strong evidence
   - +1 point per skill with weak evidence
   - Skills to check (from uploaded JD): ${job.niceToHaveSkills.length > 0 ? job.niceToHaveSkills.join(', ') : 'Extract from the Job Description provided below'}

3. EXPERIENCE DEPTH & RELEVANCE (max 20 points):
   - Required minimum years: ${job.minYearsExperience || 'As specified in JD'}
   - Consider: total years, industry relevance, impact language, leadership evidence
   - 20 = exceeds requirements significantly, 15 = meets well, 10 = meets minimum, 5 = slightly under, 0 = significantly under

4. CONSTRAINT MATCH (max 15 points, 5 each):
   - Sponsorship: ${job.requiresSponsorship === null ? 'Not specified in JD' : job.requiresSponsorship ? 'Required' : 'Not available'}
   - Location: ${job.location || 'As specified in JD'}
   - Salary: ${job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 'As specified in JD'}

5. RED FLAGS PENALTY (max -10 points): Job hopping, unexplained gaps, overlapping dates

6. DEAL-BREAKER PENALTY (-10 points): Hard conflicts with any deal-breakers from JD

7. CULTURAL & MOTIVATION SIGNALS (max 10 points): Passion, ownership, growth mindset

Recommendation mapping: 95-100: Strong Yes, 85-94: Yes, 70-84: Maybe, 50-69: Lean No, 0-49: No

Return a JSON object with this EXACT structure:
{
  "score": <number 0-100>,
  "recommendation": "<Strong Yes|Yes|Maybe|Lean No|No>",
  "summary": "<2-3 sentence summary following NO-FLUFF policy - must include specific company/role citations from the resume>",

  "candidateProfile": {
    "fullName": "<Full name from resume>",
    "firstName": "<First name>",
    "lastName": "<Last name>",
    "currentTitle": "<Current job title>",
    "currentEmployer": "<Current company>",
    "location": "<City, State/Country>",
    "labels": ["<'Contract Candidate' if contractor>", "<'Frequent Job Changes Noted' if applicable>"]
  },

  "careerJourney": [
    {
      "company": "<Company Name>",
      "role": "<Role Title>",
      "startYear": <number>,
      "endYear": <number or "Present">,
      "type": "<Growth|Pivot|Tenure>"
    }
  ],

  "flags": {
    "isJobHopper": <boolean>,
    "isContractor": <boolean>,
    "flagReason": "<null or string describing the pattern>"
  },

  "requirementsMatch": {
    "mustHaveMatchPercent": <number 0-100>,
    "niceToHaveMatchPercent": <number 0-100>,
    "mustHaveDetails": [
      { "skill": "<skill from JD>", "status": "<Met|Partially Met|Not Met>", "evidence": "<supporting example from resume or 'Not demonstrated in resume'>" }
    ],
    "niceToHaveDetails": [
      { "skill": "<skill from JD>", "status": "<Met|Partially Met|Not Met>", "evidence": "<supporting example from resume>" }
    ]
  },

  "experienceRelevance": {
    "yearsRelevant": "<e.g., 'X years in last 8'>",
    "relevantRoles": ["<Role at Company (Years)>"],
    "relevantProjects": ["<Key project with impact from resume>"],
    "gaps": ["<Any gaps in relevant experience>"]
  },

  "strengths": ["<strength with specifics from resume>", ...],
  "gaps": ["<gap with context - referencing JD requirement>", ...],
  "weaknesses": ["<concern or misalignment>", ...],
  "redFlags": ["<red flag if any>", ...],
  "dealBreakers": ["<deal breaker if any>", ...],

  "scoreBreakdown": {
    "mustHaveSkills": { "score": <num>, "max": 20, "details": "<explanation referencing specific skills from JD>" },
    "niceToHaveSkills": { "score": <num>, "max": 15, "details": "<explanation referencing specific skills from JD>" },
    "experienceDepth": { "score": <num>, "max": 20, "details": "<explanation>" },
    "constraintMatch": { "score": <num>, "max": 15, "details": "<explanation>" },
    "redFlags": { "score": <num>, "max": 0, "details": "<explanation>" },
    "dealBreakers": { "score": <num>, "max": 0, "details": "<explanation referencing deal-breakers from JD>" },
    "culturalSignals": { "score": <num>, "max": 10, "details": "<explanation>" }
  },

  "fitSnapshot": {
    "oneLineVerdict": "<One compelling sentence about who this candidate is in context of this specific role>",
    "matchLevel": "<High|Medium|Low>",
    "riskLevel": "<Low|Medium|High>",
    "hiringPriority": "<Top pick|Consider|Backup|Pass>"
  },

  "screeningNotes": {
    "overview": "<2-4 sentence professional overview. Mention seniority level, years of experience, key companies from resume, alignment with this JD.>",
    "matchesWell": [
      "<Specific strength that maps to a job requirement from JD, with concrete evidence from resume. Format: '[Requirement from JD] - [Evidence from resume with company, year, context]'>"
    ],
    "gapsAndLimitations": [
      "<Specific gap with nuance. Format: 'Missing [requirement from JD], which is required per JD. Resume shows [what is present instead].'>"
    ],
    "risksAndConcerns": "<1-3 sentence paragraph about concerns - visa issues, compensation, short tenures, etc.>",
    "positioningToHiringManager": "<2-3 sentences on how to pitch this candidate. What conditions make them viable?>"
  },

  "recruiterRecommendation": {
    "action": "<Move to phone screen|Keep warm in pipeline|Reject>",
    "reasoning": "<Specific justification for the recommendation, referencing JD requirements and resume evidence>",
    "fitScoreSummary": "<e.g., 'Fit Score: X%. [Summary of alignment with specific gaps mentioned].'>"
  },

  "evidenceGrid": [
    { "requirement": "<A key hiring requirement from JD>", "evidence": "<What resume shows - specific company, project, or 'Not found'>", "fit": "<match|partial|gap|blocker>" }
  ],

  "risksNextSteps": {
    "riskSummary": "<1-2 sentence summary of overall risk level>",
    "recommendedNextStep": "<Clear directive based on evaluation>"
  },

  "screeningScript": {
    "theHook": "<Personalized opening referencing specific project/company from the candidate's resume>",
    "verificationQuestions": [
      "<Question to verify a skill from JD that's listed in resume but lacks clear project context>"
    ],
    "gapProbes": [
      "<Question to explore a gap between JD requirements and resume constructively>"
    ],
    "logisticsCheck": "<Question about location/salary/visa constraints based on JD requirements>"
  }
}

CRITICAL REQUIREMENTS FOR SPECIFICITY:

**Evidence Grid Rules:**
- Include 6-10 items covering ALL must-have skills from JD plus key nice-to-have skills
- Each "evidence" field MUST cite a specific project, company, or achievement from the resume
- GOOD: "[Skill from JD] demonstrated at [Company from resume] ([Years]) - [specific project/metric from resume]"
- BAD: "Has [skill] experience" (too generic)

**Screening Notes Rules:**
- "matchesWell" items must follow this format: "[Skill/Requirement from JD] - [Specific evidence from resume with company name, year, and context]"
- "gapsAndLimitations" must be honest but constructive, referencing what the JD requires vs. what the resume shows

**Gap Analysis:**
- Explicitly list EVERY must-have skill from the JD that is NOT clearly demonstrated in the resume
- For each gap, explain why it's a gap (e.g., "JD requires X years of [skill], resume shows only Y years" or "Not mentioned in resume")

**No Generic Statements:**
- Never write generic phrases without evidence
- Every claim must reference: company name from resume, project name from resume, year from resume, or metric from resume

JOB DETAILS (from uploaded JD):
Title: ${job.title}
Company: ${job.company}
${job.dealBreakers?.length > 0 ? `Deal Breakers: ${job.dealBreakers.join(', ')}` : ''}
${job.certifications?.length > 0 ? `Required Certifications: ${job.certifications.join(', ')}` : ''}
${job.notes ? `Notes: ${job.notes}` : ''}

FULL JOB DESCRIPTION (source of truth for all requirements):
${truncatedJD}`;

  // Debug logging for diagnosis
  const isDebugMode = import.meta.env.VITE_LOTUS_DEBUG === '1';

  if (isDebugMode) {
    console.group(`[LOTUS DEBUG] Evaluating: ${candidate.name}`);
    console.log('Original resume length:', candidate.rawResume?.length || 0);
    console.log('Truncated resume length:', truncatedResume.length);
    console.log('Original JD length:', job.rawDescription?.length || 0);
    console.log('Truncated JD length:', truncatedJD.length);
    console.log('Resume preview (first 500 chars):', truncatedResume.substring(0, 500));
    console.log('Job title:', job.title);
    console.log('Must-have skills:', job.mustHaveSkills);
    console.log('Nice-to-have skills:', job.niceToHaveSkills);
  }

  try {
    const response = await callLLM(
      'anthropic',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `CANDIDATE RESUME:\n\n${truncatedResume}` },
      ],
      true
    );

    if (isDebugMode) {
      console.log('Raw LLM response length:', response?.length || 0);
      console.log('Raw LLM response preview:', response?.substring(0, 1000));
    }

    const parsed = JSON.parse(response);

    if (isDebugMode) {
      console.log('Parsed evaluation score:', parsed.score);
      console.log('Parsed recommendation:', parsed.recommendation);
      console.log('Candidate profile from evaluation:', parsed.candidateProfile);
      console.groupEnd();
    }

    return parsed;
  } catch (error) {
    if (isDebugMode) {
      console.error('Evaluation failed:', error);
      console.groupEnd();
    }
    throw error;
  }
}

export async function generateOutreachEmail(
  candidate: Candidate,
  job: Job
): Promise<string> {
  const message = await generatePersonalizedMessage(candidate, job);
  return `Subject: ${message.subject}\n\n${message.body}`;
}

export async function generatePersonalizedMessage(
  candidate: Candidate,
  job: Job
): Promise<PersonalizedMessage> {
  const evaluation = candidate.evaluation;
  const recommendation = evaluation?.recommendation || 'Maybe';
  const firstName = candidate.name.split(' ')[0];

  // Determine tone based on recommendation
  let tone: PersonalizedMessage['tone'] = 'curious';
  let toneGuidance = '';

  if (recommendation === 'Strong Yes' || recommendation === 'Yes') {
    tone = 'excited';
    toneGuidance = `TONE: Warm, excited, moving toward next steps. This is a strong candidate you want to move fast with. Questions should be deeper, like "help us move fast" rather than "prove yourself."`;
  } else if (recommendation === 'Maybe') {
    tone = 'curious';
    toneGuidance = `TONE: Curious, cautious, clarifying. This candidate has potential but you need to fill gaps before deciding. Questions should focus on the specific gaps that are blocking a decision.`;
  } else if (recommendation === 'Lean No') {
    tone = 'cautious';
    toneGuidance = `TONE: Honest, respectful, exploratory. Be transparent that the role may not be a perfect match but you want to give them a fair chance to address concerns. Fewer questions, softer framing.`;
  } else {
    tone = 'decline';
    toneGuidance = `TONE: Warm, respectful decline. Be kind and specific about why this isn't the right fit, but still mention something genuine from their background. This is a polite rejection, not a screening request.`;
  }

  // Build specific question guidance based on evaluation
  const strengthsForQuestions = evaluation?.screeningNotes?.matchesWell || evaluation?.strengths || [];
  const gapsForQuestions = evaluation?.screeningNotes?.gapsAndLimitations || evaluation?.gaps || [];
  const risksForQuestions = evaluation?.screeningNotes?.risksAndConcerns || evaluation?.redFlags?.join('; ') || '';

  const systemPrompt = `You are a thoughtful, senior recruiter writing a HIGHLY personalized outreach message. You have carefully read both the job description and this candidate's resume.

WRITING STYLE: "PROFESSIONAL CASUAL"
- Concise, high-energy, and warm
- Avoid overly formal corporate jargon (no "Dear Sir/Madam", "pursuant to", "kindly")
- Use contractions naturally (we're, you've, it's)
- Sound like a real human who's excited, not a template
- Key message: Convey genuine excitement about moving forward
- Keep paragraphs short (2-3 sentences max)
- Use "!" sparingly but authentically when excited

${toneGuidance}

YOUR TASK:
Generate a personalized message that demonstrates you have actually read their resume. Every message should feel unique to THIS candidate and THIS role. Sound like a real person, not HR-speak.

CRITICAL SUBJECT LINE RULES:
- Subject line MUST start with the candidate's first name: "${firstName}"
- Subject MUST reference something SPECIFIC from their resume (a company, project, skill, or achievement)
- Examples:
  - "${firstName}, your design systems work at [Company] caught our attention"
  - "${firstName}, we'd love to discuss your experience scaling [specific thing]"
  - "${firstName}, your [specific project/achievement] stood out to us"
- NEVER use generic subjects like "Application for [Role]" or "Thank you for applying"

STRUCTURE FOR ${tone === 'decline' ? 'DECLINE' : 'SCREENING'} MESSAGE:

${tone === 'decline' ? `
1. Subject line: Start with "${firstName}," then reference something specific and genuine from their background
2. Warm opening using their first name
3. Honest but kind explanation that after careful review, this particular role isn't the right fit
4. Mention 1-2 SPECIFIC positive things about their background (reference actual companies, projects, achievements)
5. Encourage them to apply for future roles that might be a better match
6. Warm sign-off
` : `
1. Subject line: Start with "${firstName}," then reference something specific from their resume that excited you
2. Warm opening using their first name
3. Acknowledge high volume but careful review of every application
4. Call out 2-3 SPECIFIC things from their resume that stood out (actual company names, project names, achievements)
5. Transparent context about the evaluation process

SCREENING QUESTIONS REQUIREMENTS:
You must generate exactly 3-5 screening questions that come from THREE distinct sources:

**SOURCE 1 - JOB REQUIREMENTS (at least 1 question):**
The job requires: ${job.mustHaveSkills.join(', ') || 'skills specified in the job description'}
Ask about how they've applied these specific skills in their previous work.
Format: "Your resume shows [skill from JD] experience—can you walk us through how you approached [specific challenge related to that skill] in your work at [company from their resume]?"

**SOURCE 2 - CANDIDATE STRENGTHS (at least 1 question):**
Their strengths: ${strengthsForQuestions.slice(0, 3).join('; ') || 'relevant experience'}
Ask them to go deeper on a strength to confirm it and understand context.
Format: "I noticed you [specific achievement from their resume] at [Company from resume]—what was the biggest challenge you faced in that work?"

**SOURCE 3 - CANDIDATE GAPS/RISKS (at least 1 question):**
Their gaps/risks: ${gapsForQuestions.slice(0, 3).join('; ') || 'some areas to explore'}
${risksForQuestions ? `Additional concerns: ${risksForQuestions}` : ''}
Ask questions that give them a chance to address the gap without being accusatory.
Format: "The role requires [skill/experience from JD]. While your background shows [what they do have from resume], have you had any exposure to [gap area] that might not be fully reflected?"

**CONSTRAINT QUESTION (if applicable):**
${job.location ? `Location constraint: ${job.location}` : ''}
${job.salaryMin && job.salaryMax ? `Salary range: $${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : ''}
${job.requiresSponsorship !== null ? `Sponsorship: ${job.requiresSponsorship ? 'Required' : 'Not available'}` : ''}

If any constraint applies, include one question like:
- "This role is based in [location]—are you open to that, or would you need remote flexibility?"
- "Is the compensation range of [range] aligned with your expectations?"

NEVER ASK GENERIC QUESTIONS LIKE:
- "Tell me about yourself"
- "What are your career goals?"
- "Why are you interested in this role?"
- "What's your greatest strength/weakness?"

7. Offer to reply via email or video
8. Warm, professional sign-off using their first name again
`}

CANDIDATE CONTEXT:
Full Name: ${candidate.name}
First Name: ${firstName}
Score: ${evaluation?.score || 'Not evaluated'}
Recommendation: ${recommendation}
${evaluation?.fitSnapshot?.oneLineVerdict ? `Verdict: ${evaluation.fitSnapshot.oneLineVerdict}` : ''}

STRENGTHS IDENTIFIED:
${strengthsForQuestions.join('\n') || 'Not yet analyzed'}

GAPS/CONCERNS IDENTIFIED:
${gapsForQuestions.join('\n') || 'None identified'}

RISKS:
${risksForQuestions || 'None identified'}

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Must-have skills: ${job.mustHaveSkills.join(', ') || 'Not specified'}
Nice-to-have skills: ${job.niceToHaveSkills.join(', ') || 'Not specified'}
Location: ${job.location || 'Flexible'}
Salary range: ${job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 'Not specified'}
Min years experience: ${job.minYearsExperience || 'Not specified'}

CANDIDATE RESUME:
${candidate.rawResume}

Return a JSON object:
{
  "subject": "<MUST start with '${firstName},' followed by specific reference to their work>",
  "body": "<full email body with proper formatting, line breaks, and bullet points where appropriate>",
  "tone": "${tone}",
  "screeningQuestions": ["<question tied to job requirement>", "<question about their strength>", "<question addressing a gap>", ...]
}

CRITICAL REMINDERS:
1. Subject line MUST start with "${firstName}," - this is non-negotiable
2. Reference SPECIFIC companies, projects, or achievements from their resume
3. Each screening question must clearly connect to either: job requirements, candidate strengths, OR candidate gaps
4. Questions should help you decide if they're right for THIS specific role
5. Write as a real human, not a template`;

  const response = await callLLM(
    'anthropic',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate the personalized message now.' },
    ],
    true
  );

  return JSON.parse(response);
}

// Demo mode functions for when API key is not available
// FULLY GENERIC - no hardcoded skills or technologies
export function getDemoEvaluation(candidateName: string, job?: Job): CandidateEvaluation {
  const score = Math.floor(Math.random() * 40) + 60; // 60-100

  const getRecommendation = (s: number): CandidateEvaluation['recommendation'] => {
    if (s >= 95) return 'Strong Yes';
    if (s >= 85) return 'Yes';
    if (s >= 70) return 'Maybe';
    if (s >= 50) return 'Lean No';
    return 'No';
  };

  const recommendation = getRecommendation(score);

  const getMatchLevel = (s: number): 'High' | 'Medium' | 'Low' => {
    if (s >= 85) return 'High';
    if (s >= 70) return 'Medium';
    return 'Low';
  };

  const getRiskLevel = (s: number): 'Low' | 'Medium' | 'High' => {
    if (s >= 85) return 'Low';
    if (s >= 70) return 'Medium';
    return 'High';
  };

  const getHiringPriority = (s: number): 'Top pick' | 'Consider' | 'Backup' | 'Pass' => {
    if (s >= 90) return 'Top pick';
    if (s >= 80) return 'Consider';
    if (s >= 65) return 'Backup';
    return 'Pass';
  };

  // Randomly generate pattern flags for demo (20% chance of job hopper)
  const isJobHopper = Math.random() < 0.2;
  const isContractor = Math.random() < 0.15;

  // Extract name parts
  const nameParts = candidateName.split(' ');
  const firstName = nameParts[0] || candidateName;
  const lastName = nameParts.slice(1).join(' ') || '';

  // Use job-provided skills or generic placeholders
  const mustHaveSkills = job?.mustHaveSkills?.slice(0, 3) || ['Primary Skill', 'Secondary Skill', 'Third Skill'];
  const niceToHaveSkills = job?.niceToHaveSkills?.slice(0, 2) || ['Bonus Skill 1', 'Bonus Skill 2'];
  const jobTitle = job?.title || 'the role';
  const location = job?.location || 'Location TBD';

  return {
    score,
    recommendation,
    summary: `${candidateName} has ${score >= 85 ? '5+' : '3-4'} years of relevant experience. ${score >= 80 ? `Core strength in ${mustHaveSkills[0]} demonstrated through hands-on project work.` : `Shows foundational experience in ${mustHaveSkills[0]} with room for growth.`} ${isJobHopper ? 'Risk: Short tenure pattern across last 3 roles.' : 'Solid tenure history.'}`,

    // Section 1: Candidate Profile
    candidateProfile: {
      fullName: candidateName,
      firstName,
      lastName,
      currentTitle: score >= 85 ? `Senior ${jobTitle}` : jobTitle,
      currentEmployer: 'Current Employer',
      location: 'Candidate Location',
      labels: isJobHopper ? ['Frequent Job Changes Noted'] : isContractor ? ['Contract Candidate'] : [],
    },

    flags: {
      isJobHopper,
      isContractor,
      flagReason: isJobHopper
        ? '3 jobs in 4 years, avg tenure 1.2 yrs'
        : isContractor
          ? 'Multiple consulting engagements listed'
          : null,
    },

    // Section 2-3: Requirements Match - uses skills from JD
    requirementsMatch: {
      mustHaveMatchPercent: Math.min(100, score + 5),
      niceToHaveMatchPercent: Math.min(100, score - 10),
      mustHaveDetails: mustHaveSkills.map((skill, i) => ({
        skill,
        status: i === 0 ? 'Met' : (score >= 80 ? 'Partially Met' : 'Not Met') as 'Met' | 'Partially Met' | 'Not Met',
        evidence: i === 0
          ? `Demonstrated through project work over ${score >= 85 ? '3+' : '1-2'} years`
          : (score >= 80 ? 'Some exposure mentioned in resume' : 'Not demonstrated in resume'),
      })),
      niceToHaveDetails: niceToHaveSkills.map((skill, i) => ({
        skill,
        status: (score >= 75 && i === 0 ? 'Met' : 'Partially Met') as 'Met' | 'Partially Met' | 'Not Met',
        evidence: score >= 75 && i === 0 ? 'Evidence found in project descriptions' : 'Mentioned but limited context',
      })),
    },

    // Section 4: Experience Relevance
    experienceRelevance: {
      yearsRelevant: `${score >= 85 ? '6' : '4'} years in last 8`,
      relevantRoles: [
        `Senior Role at Previous Company (2021-2023)`,
        `Mid-Level Role at Earlier Company (2019-2021)`,
      ],
      relevantProjects: [
        `Key project demonstrating ${mustHaveSkills[0]} expertise`,
        `Initiative that delivered measurable business impact`,
      ],
      gaps: score < 80 ? [`Limited recent experience in ${mustHaveSkills[mustHaveSkills.length - 1]}`] : [],
    },

    strengths: [
      `${mustHaveSkills[0]} expertise demonstrated through hands-on project work`,
      `Led initiatives that delivered measurable results`,
      `Mentored team members during growth phase`,
    ],
    gaps: [
      `Limited evidence of ${mustHaveSkills[mustHaveSkills.length - 1]} experience - JD lists this as required`,
      `Some required skills from JD need verification during screening`,
    ],
    weaknesses: [
      `${mustHaveSkills[mustHaveSkills.length - 1]} experience not clearly demonstrated despite JD requirement`,
      score < 80 ? 'Limited leadership experience for senior role' : 'May need ramp-up on some required skills',
    ],
    redFlags: score < 70 ? ['Multiple short-term positions'] : [],
    dealBreakers: [],
    scoreBreakdown: {
      mustHaveSkills: { score: Math.min(20, Math.floor(score * 0.2)), max: 20, details: `Most required skills from JD present` },
      niceToHaveSkills: { score: Math.min(15, Math.floor(score * 0.15)), max: 15, details: `Some preferred skills from JD demonstrated` },
      experienceDepth: { score: Math.min(20, Math.floor(score * 0.2)), max: 20, details: 'Relevant experience level' },
      constraintMatch: { score: Math.min(15, Math.floor(score * 0.15)), max: 15, details: 'Constraints appear compatible' },
      redFlags: { score: score < 70 ? -5 : 0, max: 0, details: score < 70 ? 'Some concerns noted' : 'No significant concerns' },
      dealBreakers: { score: 0, max: 0, details: 'No deal breakers identified' },
      culturalSignals: { score: Math.min(10, Math.floor(score * 0.1)), max: 10, details: 'Positive cultural indicators' },
    },
    fitSnapshot: {
      oneLineVerdict: `${candidateName} appears to be a ${score >= 85 ? 'strong' : score >= 70 ? 'promising' : 'borderline'} candidate for ${jobTitle} with relevant experience in the target domain.`,
      matchLevel: getMatchLevel(score),
      riskLevel: getRiskLevel(score),
      hiringPriority: getHiringPriority(score),
    },
    screeningNotes: {
      overview: `${candidateName} presents as a ${score >= 85 ? 'senior-level' : 'mid-level'} professional with experience that aligns reasonably well with the ${jobTitle} role. Their background suggests they understand the core competencies required, though some areas may need exploration during interviews.`,
      matchesWell: [
        `${mustHaveSkills[0]} requirement - Resume shows relevant project experience`,
        `Experience at comparable organizations suggests familiarity with similar operating environments`,
        `Demonstrated progression and growth throughout their career trajectory`,
      ],
      gapsAndLimitations: [
        `${mustHaveSkills[mustHaveSkills.length - 1]} - Listed as required in JD but limited evidence in resume`,
        `Some specific requirements from JD need verification during screening`,
      ],
      risksAndConcerns: score < 75 ? 'Some tenure patterns and gaps require clarification. Worth exploring motivations and career goals in initial conversation.' : 'No major concerns identified. Standard verification of skills and culture fit recommended.',
      positioningToHiringManager: score >= 85
        ? `I would present ${candidateName} as a strong candidate who checks most boxes for ${jobTitle}. Worth prioritizing for initial screen.`
        : `${candidateName} shows promise for ${jobTitle} but would benefit from a screening conversation to clarify fit. Consider as part of a balanced pipeline.`,
    },
    evidenceGrid: [
      { requirement: mustHaveSkills[0], evidence: 'Resume indicates relevant project experience', fit: score >= 80 ? 'match' : 'partial' },
      { requirement: 'Years of experience', evidence: 'Career timeline suggests appropriate experience level', fit: 'match' },
      { requirement: mustHaveSkills[1] || 'Secondary requirement', evidence: score >= 75 ? 'Some evidence in resume' : 'Limited evidence', fit: score >= 75 ? 'partial' : 'gap' },
      { requirement: 'Domain relevance', evidence: 'Background includes related industry exposure', fit: score >= 75 ? 'match' : 'partial' },
    ],
    risksNextSteps: {
      riskSummary: score >= 85 ? 'Low risk overall - strong alignment with JD requirements.' : score >= 70 ? 'Medium risk - some gaps to explore but worth pursuing.' : 'Higher risk - significant gaps relative to JD may limit fit.',
      recommendedNextStep: score >= 85 ? 'Proceed to structured screening call within the next 48 hours.' : score >= 70 ? 'Send screening questions to gather additional context before deciding on interview.' : 'Consider only if pipeline is thin; otherwise, prioritize stronger candidates.',
    },

    // Section 11: Recruiter Recommendation
    recruiterRecommendation: {
      action: score >= 85 ? 'Move to phone screen' : score >= 70 ? 'Keep warm in pipeline' : 'Reject',
      reasoning: score >= 85
        ? `Reviewed ${candidateName} for ${jobTitle}. Strong ${score >= 85 ? '5+' : '3-4'} year background aligning with JD requirements. Hands-on experience and demonstrated leadership. Minor gaps appear bridgeable. Recommend moving forward.`
        : score >= 70
          ? `${candidateName} shows potential for ${jobTitle} but has gaps in key JD requirements. Worth keeping warm while we see stronger candidates.`
          : `${candidateName} does not meet minimum requirements for ${jobTitle}. Multiple critical gaps identified relative to JD.`,
      fitScoreSummary: `Fit Score: ${score}%. ${score >= 85 ? 'Strong alignment on core skills from JD.' : score >= 70 ? 'Moderate alignment with gaps to address.' : 'Significant gaps limiting fit.'}`,
    },

    experienceHighlights: [
      {
        role: 'Previous Role',
        company: 'Previous Company',
        duration: '2+ years',
        highlights: ['Led key initiatives relevant to this role', 'Delivered measurable results'],
        relevantSkills: mustHaveSkills.slice(0, 2),
      },
    ],
    interviewPointers: [
      {
        area: mustHaveSkills[0],
        question: `Can you walk us through a challenging ${mustHaveSkills[0]} problem you solved recently?`,
        reason: `To assess depth of experience in ${mustHaveSkills[0]}`,
      },
      {
        area: 'Team Collaboration',
        question: 'Describe a time when you had to work with a difficult stakeholder.',
        reason: 'To evaluate interpersonal skills and conflict resolution',
      },
    ],
    screeningScript: {
      theHook: `I see you have experience with ${mustHaveSkills[0]}. That aligns well with what we're looking for in this ${jobTitle} role.`,
      verificationQuestions: [
        `You mentioned ${mustHaveSkills[0]} in your resume. Can you walk me through a specific project where this was central to your work?`,
        `Your resume references leadership experience. What did that look like in practice - team size, scope, decision-making authority?`,
      ],
      gapProbes: [
        `The role requires ${mustHaveSkills[mustHaveSkills.length - 1]}. I don't see much detail on this in your resume. Have you had any exposure we might have missed?`,
        `Some of our requirements weren't explicitly covered in your resume. How would you approach ramping up in those areas?`,
      ],
      logisticsCheck: location !== 'Location TBD'
        ? `This role is based in ${location}. Does that work for your current situation?`
        : 'What are your location preferences and flexibility for this role?',
    },
  };
}

export function getDemoOutreachEmail(candidate: Candidate, job: Job): string {
  const firstName = candidate.name.split(' ')[0];
  const evaluation = candidate.evaluation;
  const recommendation = evaluation?.recommendation || 'Maybe';

  // Get specific details for personalization
  const strengths = evaluation?.screeningNotes?.matchesWell || evaluation?.strengths || [];
  const gaps = evaluation?.screeningNotes?.gapsAndLimitations || evaluation?.gaps || [];
  const mustHaveSkills = job.mustHaveSkills.slice(0, 3);

  // Generate role-specific questions based on evaluation
  const questions: string[] = [];

  // Question about job requirement (must-have skill)
  if (mustHaveSkills.length > 0) {
    questions.push(`Your resume mentions experience with ${mustHaveSkills[0]}—can you walk us through a specific project where you applied this skill and what the outcome was?`);
  }

  // Question about strength (if available)
  if (strengths.length > 0) {
    const strengthText = strengths[0].length > 100 ? strengths[0].substring(0, 100) + '...' : strengths[0];
    questions.push(`I noticed ${strengthText.toLowerCase()} What was the biggest challenge you faced in that work, and how did you overcome it?`);
  } else {
    questions.push(`What's been your most impactful project in your career so far, and what made it successful?`);
  }

  // Question about gap (if available)
  if (gaps.length > 0 && recommendation !== 'Strong Yes') {
    const gapText = gaps[0].length > 80 ? gaps[0].substring(0, 80) : gaps[0];
    questions.push(`We're looking for someone with experience in areas like ${gapText.toLowerCase()} Have you had any exposure to this that might not be fully reflected in your resume?`);
  }

  // Constraint question if applicable
  if (job.location) {
    questions.push(`This role is based in ${job.location}. Are you open to that location, or would you need remote flexibility?`);
  } else if (job.salaryMin && job.salaryMax) {
    questions.push(`Is the compensation range of $${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()} aligned with your expectations?`);
  }

  // Ensure we have at least 3 questions
  if (questions.length < 3) {
    if (mustHaveSkills.length > 1) {
      questions.push(`How do you approach staying current with ${mustHaveSkills.slice(0, 2).join(' and ')} best practices?`);
    } else {
      questions.push(`What attracted you to this particular role, and how does it fit into your career trajectory?`);
    }
  }

  const questionsText = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

  // Build subject line that references something specific
  const subjectDetail = mustHaveSkills.length > 0
    ? `your ${mustHaveSkills[0]} experience`
    : strengths.length > 0
      ? 'your background'
      : `the ${job.title} role`;

  return `Subject: ${firstName}, we'd love to learn more about ${subjectDetail}

Hey ${firstName}!

Thanks for throwing your hat in the ring for the ${job.title} role at ${job.company}. I actually read through your background (I know, shocking for a recruiter, right?) and wanted to reach out directly.

${strengths.length > 0 ? `What caught my eye: ${strengths[0].toLowerCase()}` : `Your experience looks like a solid fit for what we're building here.`}

We're moving fast on this one, so I've got a few quick questions to help us get to know you better:

${questionsText}

No need for a formal cover letter—just shoot me a quick reply with your thoughts. If you'd rather do a quick video (2-3 min), that works too!

Excited to learn more about what you've been up to.

Cheers,
The ${job.company} Team`;
}

// ============================================
// ENHANCED INTAKE - Extract structured intake from JD
// ============================================
export async function generateEnhancedIntake(
  rawJobDescription: string
): Promise<EnhancedIntake> {
  const systemPrompt = `### SYSTEM ROLE
You are an expert Technical Recruiter and Hiring Strategist with 15+ years of experience. Your task is to analyze a Job Description and extract a structured intake form that will help source the perfect candidates.

### INSTRUCTIONS
Analyze the provided Job Description thoroughly. Extract both explicit information and infer implicit requirements based on context clues, industry norms, and common patterns.

### EXTRACTION RULES

**Title Analysis:**
- Identify the primary job title as stated
- Generate 3-5 alternate titles that candidates with similar backgrounds might use (e.g., "Software Engineer" → "Software Developer", "Full Stack Developer", "Application Engineer")
- Determine seniority level based on years of experience, responsibilities, and title keywords

**Location & Work Model:**
- Extract all mentioned locations
- Determine work model: onsite (must be in office), hybrid (some days remote), remote (fully remote), flexible (candidate choice)
- If multiple locations mentioned with "or", list all

**Skills Extraction:**
- Must-Have: Skills explicitly required, mentioned in "Requirements" section, or stated as essential
- Nice-to-Have: Skills in "Preferred", "Bonus", "Plus" sections

**Domain Context:**
- Infer industry from company name, product descriptions, or explicit mentions
- Determine product type (B2B SaaS, Consumer Mobile, Enterprise Platform, Fintech, Healthcare Tech, etc.)
- Extract team size and reporting structure if mentioned

**Target Companies:**
- Infer companies where similar talent might work based on the role requirements, industry, and tech stack
- Include direct competitors if identifiable
- Consider companies known for the required skills/technologies

**Experience Range:**
- Extract minimum years if stated (e.g., "5+ years" → min: 5)
- Infer maximum based on seniority level (e.g., Senior typically caps at 10-12 years)

Return a JSON object with this EXACT structure:
{
  "primaryTitle": "<exact title from JD>",
  "alternateTitles": ["<alt title 1>", "<alt title 2>", ...],
  "seniorityLevel": "<Junior|Mid|Senior|Staff|Principal|Director|VP|C-Level>",

  "locations": ["<location 1>", "<location 2>", ...],
  "workModel": "<onsite|hybrid|remote|flexible>",
  "willingToRelocate": <true|false|null if unclear>,

  "mustHaveSkills": ["<skill 1>", "<skill 2>", ...],
  "niceToHaveSkills": ["<skill 1>", "<skill 2>", ...],

  "domainContext": {
    "industry": "<e.g., Financial Services, Healthcare, Technology>",
    "productType": "<e.g., B2B SaaS, Consumer Mobile, Enterprise Platform>",
    "teamSize": "<e.g., 5-10 engineers or null>",
    "reportingTo": "<e.g., VP of Engineering or null>"
  },

  "targetCompanies": ["<company where talent might work>", ...],
  "competitorCompanies": ["<direct competitor if identifiable>", ...],

  "yearsOfExperienceMin": <number>,
  "yearsOfExperienceMax": <number>,

  "salaryRangeMin": <number or null>,
  "salaryRangeMax": <number or null>,

  "keyResponsibilities": ["<responsibility 1>", "<responsibility 2>", ...],
  "hiringUrgency": "<Immediate|Within 30 days|Within 90 days|Evergreen|null>"
}

Be comprehensive but evidence-based. For each field, only include information you can reasonably extract or infer from the JD.`;

  const response = await callLLM(
    'anthropic',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `JOB DESCRIPTION:\n\n${rawJobDescription}` },
    ],
    true,
    0.2
  );

  return JSON.parse(response);
}

// Demo version for when API is not configured
export function getDemoEnhancedIntake(job: Job): EnhancedIntake {
  return {
    primaryTitle: job.title || 'Software Engineer',
    alternateTitles: ['Software Developer', 'Application Engineer', 'Full Stack Developer'],
    seniorityLevel: job.minYearsExperience >= 8 ? 'Senior' : job.minYearsExperience >= 5 ? 'Mid' : 'Junior',

    locations: job.location ? [job.location] : ['Remote'],
    workModel: job.workMode === 'on-site' ? 'onsite' : job.workMode === 'hybrid' ? 'hybrid' : 'remote',
    willingToRelocate: null,

    mustHaveSkills: job.mustHaveSkills || [],
    niceToHaveSkills: job.niceToHaveSkills || [],

    domainContext: {
      industry: 'Technology',
      productType: 'B2B SaaS',
      teamSize: null,
      reportingTo: job.hiringManagerTitle || null,
    },

    targetCompanies: ['Similar companies in the industry'],
    competitorCompanies: [],

    yearsOfExperienceMin: job.minYearsExperience || 3,
    yearsOfExperienceMax: Math.max((job.minYearsExperience || 3) + 5, 10),

    salaryRangeMin: job.salaryMin,
    salaryRangeMax: job.salaryMax,

    keyResponsibilities: ['Key responsibilities extracted from JD'],
    hiringUrgency: null,
  };
}

// ============================================
// SEARCH STRATEGY - Generate LinkedIn sourcing strategy
// ============================================
export async function generateSearchStrategy(
  jobOrIntake: Job | EnhancedIntake,
  intakeOrRawDescription?: EnhancedIntake | string
): Promise<SearchStrategy> {
  // Handle overloaded signatures:
  // 1. generateSearchStrategy(job: Job, intake?: EnhancedIntake)
  // 2. generateSearchStrategy(intake: EnhancedIntake, rawJobDescription: string) [legacy]
  let intake: EnhancedIntake;
  let rawJobDescription: string;

  if ('rawDescription' in jobOrIntake) {
    // Called with Job as first argument
    const job = jobOrIntake as Job;
    rawJobDescription = job.rawDescription || '';

    // If intake provided as second arg, use it; otherwise create from job
    if (intakeOrRawDescription && typeof intakeOrRawDescription === 'object') {
      intake = intakeOrRawDescription as EnhancedIntake;
    } else {
      // Create a minimal intake from the job
      intake = {
        primaryTitle: job.title,
        alternateTitles: [],
        seniorityLevel: job.minYearsExperience >= 8 ? 'Senior' : job.minYearsExperience >= 5 ? 'Mid' : 'Junior',
        locations: job.location ? [job.location] : [],
        workModel: job.workMode === 'on-site' ? 'onsite' : job.workMode === 'hybrid' ? 'hybrid' : 'remote',
        willingToRelocate: null,
        mustHaveSkills: job.mustHaveSkills || [],
        niceToHaveSkills: job.niceToHaveSkills || [],
        domainContext: {
          industry: 'Technology',
          productType: 'B2B SaaS',
          teamSize: null,
          reportingTo: job.hiringManagerTitle || null,
        },
        targetCompanies: [],
        competitorCompanies: [],
        yearsOfExperienceMin: job.minYearsExperience || 3,
        yearsOfExperienceMax: Math.max((job.minYearsExperience || 3) + 5, 10),
        salaryRangeMin: job.salaryMin,
        salaryRangeMax: job.salaryMax,
        keyResponsibilities: [],
        hiringUrgency: null,
      };
    }
  } else {
    // Called with EnhancedIntake as first argument (legacy)
    intake = jobOrIntake as EnhancedIntake;
    rawJobDescription = (intakeOrRawDescription as string) || '';
  }
  const systemPrompt = `### SYSTEM ROLE
You are an expert Technical Sourcer and Recruiting Strategist. Your specialty is crafting highly effective LinkedIn search strategies that surface the best candidates.

### TASK
Based on the intake form and job description provided, generate a comprehensive LinkedIn sourcing strategy. This includes target companies, search titles, keywords, and ready-to-paste Boolean search strings.

### IMPORTANT RULES

**Target Companies:**
- Tier 1: Companies with EXACT match to requirements (same industry, same tech stack, similar scale)
- Tier 2: Companies with STRONG overlap (adjacent industry, similar tech, compatible culture)
- Tier 3: Companies worth exploring (might have hidden talent, emerging players)
- Include 5-8 companies per tier with a brief reason for each

**Recommended Titles:**
- Include the primary title and common variations
- Consider how titles differ across company sizes (startup vs enterprise)
- Include both IC and hybrid roles if applicable

**Boolean Search Strings:**
- Create 2-3 different search strings with varying specificity
- Include a "broad" search for volume
- Include a "precise" search for quality
- Include a "creative" search for hidden talent
- Use proper LinkedIn Boolean syntax: AND, OR, NOT, quotes for exact phrases, parentheses for grouping

**Keywords:**
- Must-have: Core skills that are non-negotiable
- Nice-to-have: Skills that strengthen candidacy
- Exclude: Keywords that indicate wrong fit (e.g., if looking for backend, exclude "frontend only")

**Search Tips:**
- Include 3-5 actionable tips specific to this search

Return a JSON object with this EXACT structure:
{
  "targetCompanies": {
    "tier1": [
      { "company": "<company name>", "reason": "<why this is tier 1>" }
    ],
    "tier2": [
      { "company": "<company name>", "reason": "<why this is tier 2>" }
    ],
    "tier3": [
      { "company": "<company name>", "reason": "<why worth exploring>" }
    ]
  },

  "recommendedTitles": ["<title 1>", "<title 2>", ...],

  "yearsOfExperience": {
    "min": <number>,
    "max": <number>
  },

  "locations": ["<location 1>", "<location 2>", ...],

  "mustHaveKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "niceToHaveKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "excludeKeywords": ["<keyword to avoid 1>", ...],

  "booleanSearchStrings": [
    {
      "query": "<LinkedIn Boolean search string>",
      "description": "<what this search targets, e.g., 'Broad search for senior engineers'>"
    }
  ],

  "searchTips": [
    "<actionable tip 1>",
    "<actionable tip 2>",
    ...
  ],

  "generatedAt": "<ISO date string>"
}

**Boolean Search Syntax Examples:**
- Exact title: "Senior Software Engineer"
- OR for variations: ("Software Engineer" OR "Software Developer")
- AND for requirements: Python AND (AWS OR GCP)
- NOT for exclusions: NOT "junior" NOT "intern"
- Company filter: current company: ("Google" OR "Meta")`;

  const intakeContext = `
INTAKE SUMMARY:
- Primary Title: ${intake.primaryTitle}
- Alternate Titles: ${intake.alternateTitles.join(', ')}
- Seniority: ${intake.seniorityLevel}
- Locations: ${intake.locations.join(', ')}
- Work Model: ${intake.workModel}
- Must-Have Skills: ${intake.mustHaveSkills.join(', ')}
- Nice-to-Have Skills: ${intake.niceToHaveSkills.join(', ')}
- Industry: ${intake.domainContext.industry}
- Product Type: ${intake.domainContext.productType}
- Experience Range: ${intake.yearsOfExperienceMin}-${intake.yearsOfExperienceMax} years
- Target Companies (from intake): ${intake.targetCompanies.join(', ')}
- Competitors: ${intake.competitorCompanies.join(', ')}
`;

  const response = await callLLM(
    'anthropic',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${intakeContext}\n\nFULL JOB DESCRIPTION:\n\n${rawJobDescription}` },
    ],
    true,
    0.3 // Slightly higher temperature for more creative search suggestions
  );

  const parsed = JSON.parse(response);
  // Ensure generatedAt is a proper Date
  parsed.generatedAt = new Date();
  return parsed;
}

// Demo version for when API is not configured
export function getDemoSearchStrategy(intake: EnhancedIntake): SearchStrategy {
  const title = intake.primaryTitle || 'Software Engineer';
  const skills = intake.mustHaveSkills.slice(0, 3);

  return {
    targetCompanies: {
      tier1: [
        { company: 'Top Tech Company 1', reason: 'Direct competitor with similar tech stack' },
        { company: 'Top Tech Company 2', reason: 'Known for strong engineering culture' },
        { company: 'Top Tech Company 3', reason: 'Same industry, similar scale' },
      ],
      tier2: [
        { company: 'Growing Startup 1', reason: 'Adjacent industry with overlapping skills' },
        { company: 'Growing Startup 2', reason: 'Emerging player in the space' },
      ],
      tier3: [
        { company: 'Consulting Firm', reason: 'May have consultants with relevant project experience' },
        { company: 'Agency', reason: 'Diverse project exposure' },
      ],
    },

    recommendedTitles: [title, ...intake.alternateTitles.slice(0, 4)],

    yearsOfExperience: {
      min: intake.yearsOfExperienceMin,
      max: intake.yearsOfExperienceMax,
    },

    locations: intake.locations,

    mustHaveKeywords: skills,
    niceToHaveKeywords: intake.niceToHaveSkills.slice(0, 5),
    excludeKeywords: ['intern', 'junior', 'entry level'],

    booleanSearchStrings: [
      {
        query: `"${title}" AND (${skills.map(s => `"${s}"`).join(' OR ')})`,
        description: 'Broad search for candidates with primary title and key skills',
      },
      {
        query: `("${title}" OR "${intake.alternateTitles[0] || 'Developer'}") AND ${skills[0] || 'software'} AND ${intake.locations[0] || 'United States'}`,
        description: 'Targeted search with location filter',
      },
    ],

    searchTips: [
      'Start with Tier 1 companies for highest quality matches',
      'Use the "Open to Work" filter to find active job seekers',
      'Check the "Past Company" filter for alumni from target companies',
      'Look at the "Skills" section to verify technical fit',
    ],

    generatedAt: new Date(),
  };
}

// ============================================
// RESUME PARSING - Extract structured data from resume text
// ============================================
export interface ParsedResume {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;
  skills: string[];
  workHistory: Array<{
    title: string;
    company: string;
    duration: string;
    startDate: string | null;
    endDate: string | null;
    highlights: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string | null;
  }>;
  summary: string | null;
  requiresSponsorship: boolean | null;
}

export async function parseResumeWithAI(resumeText: string, fileName?: string): Promise<ParsedResume> {
  // If API not configured or resume too short, use basic parsing
  if (!isAPIConfigured() || resumeText.length < 100) {
    return parseResumeBasic(resumeText, fileName);
  }

  const systemPrompt = `You are an expert resume parser. Extract structured information from the resume text provided.

Return a JSON object with this EXACT structure:
{
  "name": "Full name of the candidate",
  "email": "email@example.com or null",
  "phone": "phone number or null",
  "location": "City, State/Country or null",
  "currentTitle": "Current or most recent job title or null",
  "currentCompany": "Current or most recent employer or null",
  "yearsExperience": <number of years of professional experience or null>,
  "skills": ["skill1", "skill2", ...],
  "workHistory": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "2020 - Present",
      "startDate": "2020-01 or null",
      "endDate": "present or 2024-01 or null",
      "highlights": ["key achievement 1", "key achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "BS Computer Science",
      "institution": "University Name",
      "year": "2018 or null"
    }
  ],
  "summary": "1-2 sentence professional summary or null",
  "requiresSponsorship": true/false/null
}

IMPORTANT:
- Only include information that is ACTUALLY in the resume
- Do NOT invent or guess missing information
- For yearsExperience, calculate from the earliest work date to present
- For skills, extract technical and professional skills mentioned
- Keep workHistory to the last 10 years maximum
- For requiresSponsorship, only set true/false if explicitly stated, otherwise null`;

  // Debug logging for diagnosis
  const isDebugMode = import.meta.env.VITE_LOTUS_DEBUG === '1';

  if (isDebugMode) {
    console.group(`[LOTUS DEBUG] Parsing Resume: ${fileName || 'Unknown'}`);
    console.log('Resume text length:', resumeText?.length || 0);
    console.log('Resume preview (first 500 chars):', resumeText?.substring(0, 500));
  }

  try {
    const response = await callLLM(
      'anthropic',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Parse this resume:\n\n${resumeText}` },
      ],
      true,
      0.1
    );

    if (isDebugMode) {
      console.log('Raw AI response length:', response?.length || 0);
      console.log('Raw AI response:', response?.substring(0, 1500));
    }

    const parsed = JSON.parse(response);

    if (isDebugMode) {
      console.log('Parsed resume data:', {
        name: parsed.name,
        email: parsed.email,
        currentTitle: parsed.currentTitle,
        currentCompany: parsed.currentCompany,
        yearsExperience: parsed.yearsExperience,
        skillsCount: parsed.skills?.length || 0,
        workHistoryCount: parsed.workHistory?.length || 0
      });
      console.groupEnd();
    }

    return {
      name: parsed.name || 'Unknown Candidate',
      email: parsed.email || null,
      phone: parsed.phone || null,
      location: parsed.location || null,
      currentTitle: parsed.currentTitle || null,
      currentCompany: parsed.currentCompany || null,
      yearsExperience: parsed.yearsExperience || null,
      skills: parsed.skills || [],
      workHistory: parsed.workHistory || [],
      education: parsed.education || [],
      summary: parsed.summary || null,
      requiresSponsorship: parsed.requiresSponsorship ?? null,
    };
  } catch (error) {
    if (isDebugMode) {
      console.error('AI resume parsing failed:', error);
      console.groupEnd();
    }
    console.error('AI resume parsing failed, using basic parsing:', error);
    return parseResumeBasic(resumeText, fileName);
  }
}

// Basic resume parsing without AI (fallback)
function parseResumeBasic(resumeText: string, fileName?: string): ParsedResume {
  // Extract email with multiple patterns
  let email: string | null = null;
  const emailPatterns = [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    /(?:e-?mail|email)[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/,
  ];
  for (const pattern of emailPatterns) {
    const match = resumeText.match(pattern);
    if (match) {
      email = match[1] || match[0];
      break;
    }
  }

  // Extract phone with multiple patterns
  let phone: string | null = null;
  const phonePatterns = [
    /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/,
    /\+[0-9]{1,3}[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{2,4}/,
    /(?:phone|tel|mobile|cell)[:\s]+(\+?[0-9][-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i,
    /\b[0-9]{10}\b/,
    /\b[0-9]{3}\s[0-9]{3}\s[0-9]{4}\b/,
  ];
  for (const pattern of phonePatterns) {
    const match = resumeText.match(pattern);
    if (match) {
      let phoneNum = match[0];
      if (/^(?:phone|tel|mobile|cell)/i.test(phoneNum)) {
        const numMatch = phoneNum.match(/[0-9+][0-9\s.\-()]+/);
        if (numMatch) phoneNum = numMatch[0];
      }
      phone = phoneNum.trim();
      break;
    }
  }

  // Extract name from first lines with improved detection
  const lines = resumeText.split('\n').filter(l => l.trim());
  let name = 'Unknown Candidate';

  // Skip lines that look like headers, contact info, URLs
  const skipPatterns = [
    /^(resume|cv|curriculum vitae|contact|portfolio|linkedin|http|www\.)/i,
    /@/, // Skip email lines
    /^\+?\d[\d\s\-().]{8,}$/, // Skip phone number lines
    /^(phone|tel|email|address|location)/i,
  ];

  for (const line of lines.slice(0, 10)) {
    const cleaned = line.trim();

    // Skip if matches any skip pattern
    if (skipPatterns.some(p => p.test(cleaned))) continue;

    // Remove common prefixes
    const nameCleaned = cleaned
      .replace(/^(name|full name|candidate)[\s:]+/i, '')
      .replace(/[|•·\-–—]/g, '')
      .trim();

    // Check if it looks like a name
    if (nameCleaned.length >= 3 && nameCleaned.length <= 50 && /^[A-Za-z\s'-]+$/.test(nameCleaned)) {
      const words = nameCleaned.split(/\s+/).filter(w => w.length >= 2);
      if (words.length >= 1 && words.length <= 4) {
        name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        break;
      }
    }
  }

  // If still unknown, try to extract from email
  if (name === 'Unknown Candidate' && email) {
    const emailName = email.split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\d+/g, '')
      .trim();
    if (emailName.length >= 3) {
      const words = emailName.split(/\s+/).filter(w => w.length >= 2);
      if (words.length >= 1 && words.length <= 3) {
        name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }
  }

  // If still unknown, try filename
  if (name === 'Unknown Candidate' && fileName) {
    const baseName = fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    const cleaned = baseName.replace(/\b(resume|cv|final|draft|\d+)\b/gi, '').trim();
    if (cleaned.length >= 3) {
      name = cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  // Extract skills (look for common skill-related sections)
  const skills: string[] = [];
  const skillPatterns = [
    /(?:skills|technologies|tech stack|proficient in|expertise)[:\s]*([^\n]+)/gi,
    /\b(javascript|typescript|python|java|c\+\+|go|rust|ruby|php|swift|kotlin|react|angular|vue|node\.?js|express|django|flask|spring|aws|azure|gcp|docker|kubernetes|sql|mongodb|postgresql|mysql|redis|graphql|rest|api|git|agile|scrum)\b/gi,
  ];

  for (const pattern of skillPatterns) {
    const matches = resumeText.matchAll(pattern);
    for (const match of matches) {
      const skill = match[1] || match[0];
      if (skill && !skills.includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    }
  }

  return {
    name,
    email,
    phone,
    location: null,
    currentTitle: null,
    currentCompany: null,
    yearsExperience: null,
    skills: skills.slice(0, 20),
    workHistory: [],
    education: [],
    summary: null,
    requiresSponsorship: null,
  };
}

// Get the API key for the selected LLM provider
export function getSelectedAPIKey(): string {
  // Get the selected provider from the store (if available)
  // This is a bit of a workaround since we can't use hooks here
  const selectedLLM = (typeof window !== 'undefined' && (window as unknown as { __selectedLLM?: LLMProvider }).__selectedLLM) || 'anthropic';

  switch (selectedLLM) {
    case 'anthropic': return ANTHROPIC_API_KEY;
    case 'gemini': return GEMINI_API_KEY;
    default: return OPENAI_API_KEY;
  }
}

export function isAPIConfigured(): boolean {
  // Check if any LLM provider is configured
  return !!OPENAI_API_KEY || !!ANTHROPIC_API_KEY || !!GEMINI_API_KEY;
}

export function isProviderConfigured(provider: LLMProvider): boolean {
  switch (provider) {
    case 'openai': return !!OPENAI_API_KEY;
    case 'anthropic': return !!ANTHROPIC_API_KEY;
    case 'gemini': return !!GEMINI_API_KEY;
    default: return false;
  }
}

// ============================================
// ROLE CALIBRATION - Market sense and difficulty assessment
// ============================================
import type { RoleCalibration, EmployerBranding, SourcingRedFlags, ResumeQuality, EvaluationConfidence, ConstraintMatch, CareerTimeline, EmploymentGap } from '../types';

export async function generateRoleCalibration(job: Job): Promise<RoleCalibration> {
  const systemPrompt = `You are an expert Technical Recruiting Strategist with 15+ years of market intelligence experience. Your specialty is assessing role difficulty and providing calibration insights.

### TASK
Analyze the job description and requirements to assess:
1. How difficult this role will be to fill
2. Whether the requirements are realistic for the compensation/level
3. Market conditions for this type of talent
4. Potential red flags or misalignments

### DIFFICULTY SCORING (1-10)
- 1-2 (Easy): Common skills, good compensation, flexible requirements
- 3-4 (Moderate): Some specialized skills, competitive market
- 5-6 (Hard): Rare skill combination, strict requirements, competitive compensation needed
- 7-8 (Very Hard): Unicorn hunt, unrealistic expectations, or below-market compensation
- 9-10 (Near Impossible): Multiple conflicting requirements, severely below market, extreme skill rarity

### RED FLAGS TO DETECT
- Senior expectations with junior title/salary
- Too many must-have skills (over 8-10 is a red flag)
- Unrealistic years of experience for the tech/skill (e.g., "10 years React" when React is 11 years old)
- Mismatch between title seniority and responsibilities
- Below-market salary for the required experience
- Location constraints that limit candidate pool significantly

Return a JSON object:
{
  "difficulty": "easy|moderate|hard|very_hard",
  "difficultyScore": <1-10>,
  "calibrationNotes": [
    "<observation about the role's fillability>"
  ],
  "marketInsights": {
    "salaryAssessment": "<assessment of salary vs market or null if no salary>",
    "skillDemand": "<assessment of skill availability in market>",
    "locationImpact": "<how location affects candidate pool>",
    "experienceMatch": "<whether experience requirements match title level>"
  },
  "redFlags": [
    "<any concerning mismatches or unrealistic expectations>"
  ],
  "suggestions": [
    "<actionable suggestion to improve fillability>"
  ],
  "timeToFillEstimate": "<estimated time to fill with reasoning>"
}`;

  const jobContext = `
JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Work Mode: ${job.workMode}
Min Years Experience: ${job.minYearsExperience}
Salary Range: ${job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 'Not specified'}

MUST-HAVE SKILLS (${job.mustHaveSkills.length}):
${job.mustHaveSkills.join(', ') || 'None specified'}

NICE-TO-HAVE SKILLS (${job.niceToHaveSkills.length}):
${job.niceToHaveSkills.join(', ') || 'None specified'}

DEAL BREAKERS:
${job.dealBreakers?.join(', ') || 'None specified'}

CERTIFICATIONS REQUIRED:
${job.certifications?.join(', ') || 'None'}

RAW JOB DESCRIPTION:
${job.rawDescription}`;

  try {
    const response = await callLLM(
      'anthropic',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: jobContext },
      ],
      true,
      0.3
    );

    return JSON.parse(response);
  } catch (error) {
    console.error('Role calibration failed:', error);
    return getDemoRoleCalibration(job);
  }
}

export function getDemoRoleCalibration(job: Job): RoleCalibration {
  const skillCount = job.mustHaveSkills.length;
  const hasCompetitiveSalary = job.salaryMax && job.salaryMax > 150000;
  const isRemote = job.workMode === 'remote';

  let difficultyScore = 5;
  const redFlags: string[] = [];
  const suggestions: string[] = [];
  const calibrationNotes: string[] = [];

  // Assess skill count
  if (skillCount > 10) {
    difficultyScore += 2;
    redFlags.push(`High number of must-have skills (${skillCount}) may limit candidate pool`);
    suggestions.push('Consider moving 2-3 must-have skills to nice-to-have');
  } else if (skillCount > 7) {
    difficultyScore += 1;
    calibrationNotes.push(`${skillCount} must-have skills is on the higher end`);
  }

  // Assess experience requirements
  if (job.minYearsExperience >= 10) {
    difficultyScore += 1;
    calibrationNotes.push('10+ years experience significantly narrows candidate pool');
  }

  // Assess salary
  if (!job.salaryMin && !job.salaryMax) {
    calibrationNotes.push('No salary range specified - may affect candidate interest');
    suggestions.push('Adding a salary range can increase application rates by 30%+');
  }

  // Assess location
  if (!isRemote && job.location) {
    difficultyScore += 1;
    calibrationNotes.push(`On-site requirement in ${job.location} limits to local candidates`);
    suggestions.push('Consider offering hybrid or remote options to expand candidate pool');
  } else if (isRemote) {
    difficultyScore -= 1;
    calibrationNotes.push('Remote option significantly expands candidate pool');
  }

  // Determine difficulty level
  let difficulty: RoleCalibration['difficulty'];
  if (difficultyScore <= 3) difficulty = 'easy';
  else if (difficultyScore <= 5) difficulty = 'moderate';
  else if (difficultyScore <= 7) difficulty = 'hard';
  else difficulty = 'very_hard';

  // Estimate time to fill
  const timeEstimates = {
    easy: '2-3 weeks',
    moderate: '4-6 weeks',
    hard: '6-10 weeks',
    very_hard: '10+ weeks (consider adjusting requirements)',
  };

  return {
    difficulty,
    difficultyScore,
    calibrationNotes,
    marketInsights: {
      salaryAssessment: job.salaryMin && job.salaryMax
        ? (hasCompetitiveSalary ? 'Competitive range for this level' : 'May be below market for senior talent')
        : null,
      skillDemand: skillCount > 8
        ? 'Combination of skills is rare in the market'
        : 'Skills are commonly found in market',
      locationImpact: isRemote
        ? 'Remote option maximizes candidate pool globally'
        : `${job.location || 'Specified location'} requirement limits to regional candidates`,
      experienceMatch: job.minYearsExperience >= 8
        ? 'Senior-level experience requirement aligns with expectations'
        : 'Experience requirement is reasonable for this level',
    },
    redFlags,
    suggestions,
    timeToFillEstimate: timeEstimates[difficulty],
  };
}

// ============================================
// QUICK ROLE CALIBRATION - Fast business rules without AI
// Use this for immediate feedback in Phase 1 before AI calibration
// ============================================
export function quickRoleCalibration(job: Job): RoleCalibration {
  let difficultyScore = 5; // Start at moderate
  const redFlags: string[] = [];
  const suggestions: string[] = [];
  const calibrationNotes: string[] = [];

  const titleLower = job.title.toLowerCase();
  const skillCount = job.mustHaveSkills.length;
  const isRemote = job.workMode === 'remote';
  const minExp = job.minYearsExperience;
  const salaryMax = job.salaryMax || 0;

  // === BUSINESS RULE 1: Title vs Experience Mismatch ===
  const isSeniorTitle = /senior|staff|principal|lead|architect|director|vp|head/i.test(titleLower);
  const isJuniorTitle = /junior|entry|associate|intern/i.test(titleLower);
  const isMidTitle = !isSeniorTitle && !isJuniorTitle;

  if (isSeniorTitle && minExp < 5) {
    difficultyScore += 2;
    redFlags.push(`Senior title "${job.title}" typically requires 5+ years, but only ${minExp} specified`);
    suggestions.push('Consider increasing experience requirement to 5+ years for credibility');
  }
  if (isJuniorTitle && minExp > 3) {
    difficultyScore += 1;
    redFlags.push(`Junior title with ${minExp} years experience is contradictory`);
    suggestions.push('Consider adjusting title to match experience level');
  }

  // === BUSINESS RULE 2: Salary vs Seniority Mismatch ===
  // 2024 tech market benchmarks (rough)
  if (salaryMax > 0) {
    if (isSeniorTitle && salaryMax < 150000) {
      difficultyScore += 2;
      redFlags.push(`Senior role salary ($${(salaryMax / 1000).toFixed(0)}k max) is below market for experienced talent`);
      suggestions.push('Consider raising salary range to $150k+ to attract senior candidates');
    }
    if (isJuniorTitle && salaryMax > 120000) {
      calibrationNotes.push(`Junior salary ($${(salaryMax / 1000).toFixed(0)}k) is above typical market - great for attracting talent`);
      difficultyScore -= 1;
    }
    if (isMidTitle && salaryMax < 100000) {
      calibrationNotes.push('Mid-level salary may limit candidate pool in competitive markets');
    }
  } else {
    calibrationNotes.push('No salary range specified - candidates may not apply');
    suggestions.push('Adding a salary range can increase application rates by 30%+');
  }

  // === BUSINESS RULE 3: Too Many Must-Haves ===
  if (skillCount > 10) {
    difficultyScore += 2;
    redFlags.push(`${skillCount} must-have skills is unrealistic - narrows pool to near zero`);
    suggestions.push('Move 3-5 skills to "nice-to-have" to widen candidate pool');
  } else if (skillCount > 7) {
    difficultyScore += 1;
    calibrationNotes.push(`${skillCount} must-have skills is on the higher end`);
    suggestions.push('Consider whether all must-haves are truly required');
  } else if (skillCount < 3) {
    calibrationNotes.push('Few specific requirements may attract many unqualified applicants');
  }

  // === BUSINESS RULE 4: Location Impact ===
  if (!isRemote && job.location) {
    difficultyScore += 1;
    calibrationNotes.push(`On-site requirement limits to ${job.location} area candidates`);
    suggestions.push('Consider hybrid or remote options to expand pool');
  } else if (isRemote) {
    difficultyScore -= 1;
    calibrationNotes.push('Remote option significantly expands candidate pool globally');
  }

  // === BUSINESS RULE 5: Sponsorship + Location Complexity ===
  if (isRemote && job.requiresSponsorship === false) {
    calibrationNotes.push('Remote + no sponsorship is optimal for wide candidate reach');
  }
  if (!isRemote && job.requiresSponsorship === true) {
    difficultyScore += 1;
    calibrationNotes.push('On-site with visa sponsorship creates legal and logistic complexity');
  }

  // === BUSINESS RULE 6: Experience Extremes ===
  if (minExp >= 10) {
    difficultyScore += 1;
    calibrationNotes.push('10+ years requirement significantly narrows candidate pool');
    suggestions.push('Consider if 7-8 years would suffice - opens more candidates');
  }

  // === BUSINESS RULE 7: Certifications ===
  if (job.certifications && job.certifications.length > 2) {
    difficultyScore += 1;
    calibrationNotes.push(`${job.certifications.length} required certifications limits pool`);
  }

  // Clamp score
  difficultyScore = Math.max(1, Math.min(10, difficultyScore));

  // Determine difficulty level
  let difficulty: RoleCalibration['difficulty'];
  if (difficultyScore <= 3) difficulty = 'easy';
  else if (difficultyScore <= 5) difficulty = 'moderate';
  else if (difficultyScore <= 7) difficulty = 'hard';
  else difficulty = 'very_hard';

  // Time to fill estimates
  const timeEstimates = {
    easy: '2-3 weeks',
    moderate: '4-6 weeks',
    hard: '6-10 weeks',
    very_hard: '10+ weeks (consider adjusting requirements)',
  };

  // Market supply estimate
  let marketSupply = 'moderate';
  if (difficultyScore <= 3) marketSupply = 'abundant';
  else if (difficultyScore <= 5) marketSupply = 'moderate';
  else if (difficultyScore <= 7) marketSupply = 'limited';
  else marketSupply = 'scarce';

  return {
    difficulty,
    difficultyScore,
    difficultyRating: difficultyScore, // Alias for UI
    marketSupply,
    calibrationNotes,
    marketInsights: {
      salaryAssessment: salaryMax > 0
        ? (salaryMax >= 150000 ? 'Competitive range' : (salaryMax >= 100000 ? 'Market rate' : 'Below market'))
        : null,
      skillDemand: skillCount > 8
        ? 'Rare skill combination - competitive market'
        : (skillCount > 5 ? 'Moderately specialized' : 'Common skills available'),
      locationImpact: isRemote
        ? 'Remote option maximizes global candidate pool'
        : `${job.location || 'On-site'} limits to regional candidates`,
      experienceMatch: isSeniorTitle && minExp >= 5
        ? 'Experience aligns with title level'
        : (isSeniorTitle && minExp < 5 ? 'Experience may be low for title' : 'Reasonable match'),
    },
    redFlags,
    suggestions,
    timeToFill: timeEstimates[difficulty],
    timeToFillEstimate: timeEstimates[difficulty],
  };
}

// ============================================
// EMPLOYER BRANDING - Why candidates should care
// ============================================
export async function generateEmployerBranding(job: Job): Promise<EmployerBranding> {
  const systemPrompt = `You are an expert Employer Branding Strategist. Your task is to create compelling messaging that will attract top talent to this role.

### TASK
Based on the job description, create:
1. A main value proposition (1-2 sentences) that captures why a top candidate should be excited
2. 3-5 specific selling points
3. Key differentiators for this role/company
4. Appeal points for different motivations (technical challenges, career growth, culture)
5. Recommended outreach tone

### GUIDELINES
- Be specific to what's in the JD, not generic
- Focus on impact, growth, and unique aspects
- Avoid buzzwords like "fast-paced" or "rockstar"
- Think about what would genuinely excite a passive candidate

Return a JSON object:
{
  "valueProposition": "<compelling 1-2 sentence pitch>",
  "sellingPoints": ["<specific point 1>", ...],
  "differentiators": ["<what makes this unique>", ...],
  "targetPersonaAppeal": {
    "technicalAppeal": ["<appeals to technical interests>"],
    "careerAppeal": ["<growth/advancement opportunities>"],
    "cultureAppeal": ["<work environment/culture aspects>"]
  },
  "suggestedOutreachTone": "technical|career-growth|mission-driven|culture-focused"
}`;

  try {
    const response = await callLLM(
      'anthropic',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `JOB DESCRIPTION:\n${job.rawDescription}` },
      ],
      true,
      0.4
    );

    return JSON.parse(response);
  } catch (error) {
    console.error('Employer branding generation failed:', error);
    return getDemoEmployerBranding(job);
  }
}

export function getDemoEmployerBranding(job: Job): EmployerBranding {
  return {
    valueProposition: `Join ${job.company} as a ${job.title} and work on impactful problems with a team that values both technical excellence and work-life balance.`,
    sellingPoints: [
      `Opportunity to shape the ${job.title} function at a growing organization`,
      `Work with modern tech stack: ${job.mustHaveSkills.slice(0, 3).join(', ') || 'cutting-edge technologies'}`,
      `${job.workMode === 'remote' ? 'Fully remote position with flexible hours' : `${job.workMode} role in ${job.location || 'a great location'}`}`,
      job.salaryMax ? `Competitive compensation up to $${job.salaryMax.toLocaleString()}` : 'Competitive compensation package',
      'Collaborative team environment with mentorship opportunities',
    ],
    differentiators: [
      `Direct impact on ${job.company}'s core product/mission`,
      'Opportunity for technical leadership and growth',
      'Modern engineering practices and tooling',
    ],
    targetPersonaAppeal: {
      technicalAppeal: [
        `Work with ${job.mustHaveSkills[0] || 'modern technologies'}`,
        'Solve complex technical challenges at scale',
        'Influence architectural decisions',
      ],
      careerAppeal: [
        'Clear path to senior/lead positions',
        'Cross-functional collaboration opportunities',
        'Mentorship and learning budget',
      ],
      cultureAppeal: [
        job.workMode === 'remote' ? 'Remote-first culture' : 'Collaborative office environment',
        'Focus on work-life balance',
        'Inclusive and diverse team',
      ],
    },
    suggestedOutreachTone: job.minYearsExperience >= 8 ? 'technical' : 'career-growth',
  };
}

// ============================================
// IDEAL CANDIDATE PERSONA - Who we're looking for
// ============================================
export async function generateIdealCandidatePersona(job: Job): Promise<IdealCandidatePersona> {
  const systemPrompt = `You are an expert Technical Recruiter building an Ideal Candidate Persona (ICP). Create a detailed profile of the perfect candidate for this role.

### TASK
Based on the job description, create a comprehensive persona that describes:
1. Their current professional background (titles, companies, industries)
2. What motivates them and what they're looking for in their next role
3. Their skills and experience patterns
4. Behavioral signals to look for during sourcing
5. Outreach hooks that would resonate with them

### GUIDELINES
- Be specific to the role, not generic
- Think about what a 90th percentile candidate for this role looks like
- Consider both what they have (skills/experience) and what they want (motivations)
- Include specific signals recruiters can look for on LinkedIn

Return a JSON object:
{
  "backgroundProfile": {
    "typicalTitles": ["<titles they'd currently hold>"],
    "typicalCompanies": ["<types of companies, e.g., 'Series B-D startups', 'FAANG'>"],
    "careerStage": "<e.g., 'Mid-career professional 5-8 years in, seeking senior IC track'>",
    "industryBackground": ["<industries they'd have experience in>"]
  },
  "careerMotivations": {
    "primaryDrivers": ["<what drives them, e.g., 'Technical challenge', 'Impact'>"],
    "dealMakers": ["<what would make them say yes>"],
    "dealBreakers": ["<what would make them decline>"]
  },
  "skillsProfile": {
    "coreCompetencies": ["<must-have skills>"],
    "adjacentSkills": ["<related skills they'd likely have>"],
    "experiencePatterns": ["<e.g., 'Built systems serving 1M+ users'>"]
  },
  "behavioralIndicators": {
    "linkedInSignals": ["<what to look for on their profile>"],
    "resumePatterns": ["<what their resume would show>"],
    "redFlags": ["<warning signs this isn't the right fit>"]
  },
  "outreachHooks": ["<conversation starters that would resonate>"]
}`;

  try {
    const response = await callLLM(
      'anthropic',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `JOB DESCRIPTION:\n${job.rawDescription}\n\nROLE: ${job.title}\nCOMPANY: ${job.company}\nLOCATION: ${job.location || 'Remote'}\nEXPERIENCE REQUIRED: ${job.minYearsExperience}+ years\nMUST-HAVE SKILLS: ${job.mustHaveSkills.join(', ')}` },
      ],
      true,
      0.5
    );

    return JSON.parse(response);
  } catch (error) {
    console.error('Persona generation failed:', error);
    return getDemoIdealCandidatePersona(job);
  }
}

export function getDemoIdealCandidatePersona(job: Job): IdealCandidatePersona {
  const isSenior = job.minYearsExperience >= 7 || /senior|staff|principal|lead/i.test(job.title);
  const isManager = /manager|director|head|vp/i.test(job.title);

  return {
    backgroundProfile: {
      typicalTitles: isSenior
        ? [`Senior ${job.title.replace(/senior\s*/i, '')}`, `Staff ${job.title.replace(/senior|staff\s*/i, '')}`, `Lead ${job.title.replace(/lead\s*/i, '')}`]
        : [job.title, `${job.title} II`, `Junior ${job.title}`],
      typicalCompanies: [
        'Series B-D funded startups',
        'Mid-size tech companies (500-2000 employees)',
        'Tech divisions of large enterprises',
      ],
      careerStage: isSenior
        ? `Experienced professional with ${job.minYearsExperience}+ years, seeking high-impact senior IC or early management role`
        : `Early to mid-career professional looking to grow their ${job.mustHaveSkills[0] || 'technical'} expertise`,
      industryBackground: ['Technology/Software', 'SaaS', 'Fintech', 'E-commerce'],
    },
    careerMotivations: {
      primaryDrivers: isSenior
        ? ['Technical leadership', 'Architectural impact', 'Mentoring others', 'Challenging problems']
        : ['Learning and growth', 'Working with modern tech', 'Career advancement', 'Good mentorship'],
      dealMakers: [
        `Opportunity to work with ${job.mustHaveSkills[0] || 'cutting-edge technology'}`,
        job.workMode === 'remote' ? 'Remote-first culture with flexibility' : `Great ${job.location} office with hybrid flexibility`,
        isManager ? 'Team building and leadership scope' : 'Individual contributor track with growth',
        job.salaryMax ? `Competitive compensation ($${Math.round(job.salaryMax / 1000)}k+)` : 'Competitive total compensation',
      ],
      dealBreakers: [
        'Outdated tech stack with no modernization plans',
        'No clear growth path or learning opportunities',
        'Poor work-life balance / always-on culture',
        job.requiresSponsorship === false ? 'Visa sponsorship required but not offered' : 'Inflexible on compensation',
      ],
    },
    skillsProfile: {
      coreCompetencies: job.mustHaveSkills.slice(0, 5),
      adjacentSkills: job.niceToHaveSkills.slice(0, 4),
      experiencePatterns: [
        `${job.minYearsExperience}+ years in ${job.mustHaveSkills[0] || 'relevant'} development`,
        isSenior ? 'Led technical initiatives or mentored junior developers' : 'Contributed to production systems',
        'Experience with agile/scrum methodologies',
        'Track record of shipping features end-to-end',
      ],
    },
    behavioralIndicators: {
      linkedInSignals: [
        `Current title includes: ${job.mustHaveSkills[0] || job.title}`,
        'Profile shows progression (promotions or increased scope)',
        'Endorsements for key skills from colleagues',
        'Active engagement (posts, comments) on technical topics',
      ],
      resumePatterns: [
        'Quantified achievements (metrics, scale, impact)',
        'Progressive responsibility across roles',
        `Technology stack overlap with ${job.mustHaveSkills.slice(0, 3).join(', ')}`,
        'Side projects or open source contributions (bonus)',
      ],
      redFlags: [
        'Job hopping with tenures under 1 year consistently',
        'No progression in responsibilities over 3+ years',
        'Skills listed but no context of application',
        'Gaps without explanation or unrelated roles recently',
      ],
    },
    outreachHooks: [
      `I noticed your experience with ${job.mustHaveSkills[0]} at [their company] - we're solving similar challenges at ${job.company}`,
      `Your background in [their industry] caught my attention - we're looking for someone who's built ${job.mustHaveSkills[1] || 'scalable systems'} before`,
      `I see you've been at [company] for X years - curious if you're open to exploring a ${isSenior ? 'senior IC' : 'growth'} opportunity?`,
      `${job.company} is building [brief product pitch] and your ${job.mustHaveSkills[0]} expertise would be a great fit`,
    ],
  };
}

// ============================================
// SOURCING RED FLAGS - Patterns to watch during sourcing
// ============================================
export async function generateSourcingRedFlags(job: Job): Promise<SourcingRedFlags> {
  const systemPrompt = `You are an expert Technical Recruiter. Based on the job requirements, identify patterns and signals that would indicate a candidate is NOT a good fit, even if their resume looks good at first glance.

### TASK
Generate red flags and warning signals specific to THIS role that recruiters should watch for when sourcing candidates.

Return a JSON object:
{
  "patternsToAvoid": ["<profile patterns that suggest misfit>"],
  "warningSignals": ["<resume/profile signals to be cautious about>"],
  "dealBreakerIndicators": ["<immediate disqualifiers>"],
  "industryMismatches": ["<industries that may not transfer well>"]
}`;

  try {
    const response = await callLLM(
      'anthropic',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `JOB REQUIREMENTS:\nTitle: ${job.title}\nMust-Have: ${job.mustHaveSkills.join(', ')}\nDeal Breakers: ${job.dealBreakers?.join(', ') || 'None'}\n\nFULL JD:\n${job.rawDescription}` },
      ],
      true,
      0.3
    );

    return JSON.parse(response);
  } catch (error) {
    console.error('Sourcing red flags generation failed:', error);
    return getDemoSourcingRedFlags(job);
  }
}

export function getDemoSourcingRedFlags(job: Job): SourcingRedFlags {
  return {
    patternsToAvoid: [
      'Candidates with only agency/consulting background if looking for product experience',
      'Profiles that emphasize management over hands-on work (if IC role)',
      'Career trajectory that shows declining seniority',
    ],
    warningSignals: [
      'Multiple positions under 1 year in the last 5 years',
      'Gaps between roles without explanation',
      'Skills listed without project context',
      'Vague job descriptions that hide actual contributions',
    ],
    dealBreakerIndicators: job.dealBreakers?.length ? job.dealBreakers : [
      'No relevant experience in core must-have skills',
      'Location incompatibility (if on-site required)',
      'Sponsorship needed when not offered',
    ],
    industryMismatches: [
      'Pure academic/research background for fast-paced product role',
      'Government/defense contractors if fast iteration is needed',
      'Early-stage startup background if role needs process discipline',
    ],
  };
}

// ============================================
// RESUME QUALITY - Assess parsing quality and completeness
// ============================================
export function assessResumeQuality(
  candidate: Candidate,
  rawResume: string
): ResumeQuality {
  const completeness = {
    hasName: candidate.name !== 'Unknown Candidate' && candidate.name.length > 2,
    hasEmail: !!candidate.email,
    hasPhone: !!candidate.phone,
    hasLocation: !!candidate.location,
    hasCurrentTitle: !!candidate.currentJobTitle,
    hasWorkHistory: rawResume.length > 500 && /\b(experience|work|employment|history)\b/i.test(rawResume),
    hasDates: /\b(20\d{2}|19\d{2})\b/.test(rawResume),
    hasSkills: /\b(skills?|technologies|proficient|expertise)\b/i.test(rawResume),
  };

  const missingFields: string[] = [];
  if (!completeness.hasName) missingFields.push('Name');
  if (!completeness.hasEmail) missingFields.push('Email');
  if (!completeness.hasPhone) missingFields.push('Phone');
  if (!completeness.hasLocation) missingFields.push('Location');
  if (!completeness.hasCurrentTitle) missingFields.push('Current Title');
  if (!completeness.hasWorkHistory) missingFields.push('Work History');
  if (!completeness.hasDates) missingFields.push('Employment Dates');

  const warnings: string[] = [];

  // Check for PDF artifacts
  if (/obj|endobj|stream|<<|>>/i.test(rawResume)) {
    warnings.push('Resume may contain PDF parsing artifacts');
  }

  // Check for very short content
  if (rawResume.length < 300) {
    warnings.push('Resume content is unusually short');
  }

  // Check for inconsistent dates
  const years = rawResume.match(/\b(20\d{2}|19\d{2})\b/g);
  if (years && years.length > 0) {
    const sortedYears = years.map(Number).sort((a, b) => a - b);
    if (sortedYears[sortedYears.length - 1] - sortedYears[0] > 40) {
      warnings.push('Date range in resume spans over 40 years - verify accuracy');
    }
  }

  // Calculate score
  const fieldScores = Object.values(completeness);
  const trueCount = fieldScores.filter(Boolean).length;
  const baseScore = (trueCount / fieldScores.length) * 100;
  const warningPenalty = warnings.length * 10;
  const score = Math.max(0, Math.min(100, Math.round(baseScore - warningPenalty)));

  // Determine level
  let level: ResumeQuality['level'];
  if (score >= 80) level = 'high';
  else if (score >= 50) level = 'medium';
  else level = 'low';

  // Calculate parse confidence
  const parseConfidence = Math.round(
    (completeness.hasName ? 30 : 0) +
    (completeness.hasWorkHistory ? 30 : 0) +
    (completeness.hasDates ? 20 : 0) +
    (warnings.length === 0 ? 20 : 10)
  );

  return {
    score,
    level,
    completeness,
    missingFields,
    warnings,
    parseConfidence,
  };
}

// ============================================
// EVALUATION CONFIDENCE - How certain is the AI evaluation
// ============================================
export function assessEvaluationConfidence(
  candidate: Candidate,
  resumeQuality: ResumeQuality
): EvaluationConfidence {
  const evaluation = candidate.evaluation;

  // Assess individual factors
  const resumeQualityLevel: EvaluationConfidence['factors']['resumeQuality'] =
    resumeQuality.level === 'high' ? 'high' : resumeQuality.level === 'medium' ? 'medium' : 'low';

  const skillMatchClarity: EvaluationConfidence['factors']['skillMatchClarity'] =
    evaluation?.requirementsMatch?.mustHaveDetails?.every(d => d.evidence !== 'Not demonstrated in resume')
      ? 'high'
      : evaluation?.requirementsMatch?.mustHaveDetails?.some(d => d.evidence !== 'Not demonstrated in resume')
        ? 'medium'
        : 'low';

  const experienceVerifiability: EvaluationConfidence['factors']['experienceVerifiability'] =
    resumeQuality.completeness.hasDates && resumeQuality.completeness.hasWorkHistory
      ? 'high'
      : resumeQuality.completeness.hasWorkHistory
        ? 'medium'
        : 'low';

  const dataCompleteness: EvaluationConfidence['factors']['dataCompleteness'] =
    resumeQuality.missingFields.length <= 1
      ? 'high'
      : resumeQuality.missingFields.length <= 3
        ? 'medium'
        : 'low';

  // Calculate overall confidence
  const levelScores = { high: 3, medium: 2, low: 1 };
  const avgScore = (
    levelScores[resumeQualityLevel] +
    levelScores[skillMatchClarity] +
    levelScores[experienceVerifiability] +
    levelScores[dataCompleteness]
  ) / 4;

  const overall: EvaluationConfidence['overall'] =
    avgScore >= 2.5 ? 'high' : avgScore >= 1.75 ? 'medium' : 'low';

  const score = Math.round((avgScore / 3) * 100);

  // Generate caveats
  const caveats: string[] = [];
  if (resumeQualityLevel === 'low') caveats.push('Resume parsing quality is low - verify key details manually');
  if (skillMatchClarity === 'low') caveats.push('Limited evidence for skill claims - deeper verification needed');
  if (!resumeQuality.completeness.hasDates) caveats.push('Employment dates not clear - timeline may be inaccurate');
  if (resumeQuality.warnings.length > 0) caveats.push(...resumeQuality.warnings);

  return {
    overall,
    score,
    factors: {
      resumeQuality: resumeQualityLevel,
      skillMatchClarity,
      experienceVerifiability,
      dataCompleteness,
    },
    caveats,
  };
}

// ============================================
// CONSTRAINT MATCHING - Check how well candidate matches constraints
// ============================================
export function assessConstraintMatch(candidate: Candidate, job: Job): ConstraintMatch {
  // Location matching
  const locationStatus = (() => {
    if (!job.location || job.workMode === 'remote') return 'match' as const;
    if (!candidate.location) return 'unknown' as const;
    const jobLoc = job.location.toLowerCase();
    const candLoc = candidate.location.toLowerCase();
    if (candLoc.includes(jobLoc) || jobLoc.includes(candLoc)) return 'match' as const;
    // Check for same state/region
    const jobState = jobLoc.split(',').pop()?.trim();
    const candState = candLoc.split(',').pop()?.trim();
    if (jobState && candState && jobState === candState) return 'partial' as const;
    return 'mismatch' as const;
  })();

  // Work mode matching
  const workModeStatus = (() => {
    if (job.workMode === 'remote') return 'match' as const;
    if (!candidate.location) return 'unknown' as const;
    return locationStatus === 'match' ? 'match' as const : 'partial' as const;
  })();

  // Sponsorship matching
  const sponsorshipStatus = (() => {
    if (job.requiresSponsorship === null) return 'unknown' as const;
    if (candidate.requiresSponsorship === null) return 'unknown' as const;
    if (!job.requiresSponsorship && candidate.requiresSponsorship) return 'mismatch' as const;
    return 'match' as const;
  })();

  // Experience matching
  const experienceStatus = (() => {
    if (!candidate.yearsExperience) return 'unknown' as const;
    if (candidate.yearsExperience >= job.minYearsExperience) return 'match' as const;
    if (candidate.yearsExperience >= job.minYearsExperience - 2) return 'partial' as const;
    return 'mismatch' as const;
  })();

  return {
    location: {
      status: locationStatus,
      candidateLocation: candidate.location,
      jobLocation: job.location,
      notes: locationStatus === 'match' ? 'Location compatible' :
        locationStatus === 'mismatch' ? 'Location mismatch - verify flexibility' :
          'Location unknown',
    },
    workMode: {
      status: workModeStatus,
      candidatePreference: null, // Would need to extract from resume
      jobRequirement: job.workMode,
      notes: job.workMode === 'remote' ? 'Remote role - location flexible' :
        `${job.workMode} role in ${job.location || 'specified location'}`,
    },
    sponsorship: {
      status: sponsorshipStatus,
      candidateNeeds: candidate.requiresSponsorship,
      companyOffers: job.requiresSponsorship,
      notes: sponsorshipStatus === 'mismatch' ? 'Candidate needs sponsorship but company does not offer' :
        sponsorshipStatus === 'match' ? 'Sponsorship requirements aligned' :
          'Sponsorship status unclear',
    },
    salary: {
      status: 'unknown',
      candidateExpectation: null,
      jobRange: { min: job.salaryMin, max: job.salaryMax },
      notes: job.salaryMin && job.salaryMax
        ? `Role offers $${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
        : 'Salary range not specified',
    },
    experience: {
      status: experienceStatus === 'unknown' ? 'partial' : experienceStatus,
      candidateYears: candidate.yearsExperience,
      requiredYears: job.minYearsExperience,
      notes: experienceStatus === 'match' ? 'Experience meets requirements' :
        experienceStatus === 'partial' ? 'Slightly under required experience' :
          experienceStatus === 'mismatch' ? 'Below minimum experience requirement' :
            'Experience not determined',
    },
  };
}

// ============================================
// CAREER TIMELINE - Build enhanced timeline with gap detection
// ============================================
export function buildCareerTimeline(evaluation: CandidateEvaluation | null): CareerTimeline {
  if (!evaluation?.careerJourney || evaluation.careerJourney.length === 0) {
    return {
      entries: [],
      gaps: [],
      totalYearsExperience: 0,
      averageTenure: 0,
      longestTenure: 0,
      isJobHopper: false,
      careerProgression: 'unclear',
    };
  }

  const entries: CareerTimeline['entries'] = [];
  const gaps: EmploymentGap[] = [];
  const currentYear = new Date().getFullYear();

  // Sort by start year descending
  const sortedJourney = [...(evaluation.careerJourney as Array<{
    company: string;
    role: string;
    startYear: number;
    endYear: number | 'Present';
    type: string;
  }>)].sort((a, b) => {
    const aEnd = a.endYear === 'Present' ? currentYear : a.endYear;
    const bEnd = b.endYear === 'Present' ? currentYear : b.endYear;
    return bEnd - aEnd;
  });

  let prevStartYear: number | null = null;

  sortedJourney.forEach((role) => {
    const endYear = role.endYear === 'Present' ? currentYear : role.endYear;
    const durationMonths = (endYear - role.startYear) * 12;

    entries.push({
      company: role.company,
      role: role.role,
      startYear: role.startYear,
      endYear: role.endYear,
      type: role.type as CareerTimeline['entries'][0]['type'],
      durationMonths,
      isCurrentRole: role.endYear === 'Present',
    });

    // Detect gaps
    if (prevStartYear !== null && role.endYear !== 'Present') {
      const gapMonths = (prevStartYear - endYear) * 12;
      if (gapMonths > 3) { // More than 3 months gap
        gaps.push({
          startDate: `${endYear}`,
          endDate: `${prevStartYear}`,
          durationMonths: gapMonths,
          significance: gapMonths < 6 ? 'minor' : gapMonths < 12 ? 'notable' : 'significant',
        });
      }
    }

    prevStartYear = role.startYear;
  });

  // Calculate stats
  const tenures = entries.map(e => e.durationMonths);
  const totalMonths = tenures.reduce((a, b) => a + b, 0);
  const averageTenure = tenures.length > 0 ? Math.round(totalMonths / tenures.length) : 0;
  const longestTenure = tenures.length > 0 ? Math.max(...tenures) : 0;
  const isJobHopper = averageTenure < 18 && entries.length >= 3;

  // Determine career progression
  let careerProgression: CareerTimeline['careerProgression'] = 'unclear';
  const growthCount = entries.filter(e => e.type === 'Growth').length;
  const pivotCount = entries.filter(e => e.type === 'Pivot').length;
  if (growthCount > entries.length / 2) careerProgression = 'upward';
  else if (pivotCount > entries.length / 2) careerProgression = 'mixed';
  else if (entries.length > 0) careerProgression = 'lateral';

  return {
    entries,
    gaps,
    totalYearsExperience: Math.round(totalMonths / 12),
    averageTenure,
    longestTenure,
    isJobHopper,
    careerProgression,
  };
}

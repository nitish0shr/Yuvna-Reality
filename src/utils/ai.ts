import type { Job, Candidate, CandidateEvaluation, PersonalizedMessage, EnhancedIntake, SearchStrategy } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callOpenAI(
  messages: OpenAIMessage[],
  jsonMode = false,
  temperature = 0.25 // Low temperature for analytical, factual responses
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
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

export async function extractJobDetails(
  jobDescription: string
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

  const response = await callOpenAI(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: jobDescription },
    ],
    true,
    0.2 // Very low temperature for precise extraction
  );

  return JSON.parse(response);
}

export async function evaluateCandidate(
  candidate: Candidate,
  job: Job
): Promise<CandidateEvaluation> {
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
${job.rawDescription}`;

  const response = await callOpenAI(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `CANDIDATE RESUME:\n\n${candidate.rawResume}` },
    ],
    true
  );

  return JSON.parse(response);
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

  const response = await callOpenAI(
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

  const response = await callOpenAI(
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
  intake: EnhancedIntake,
  rawJobDescription: string
): Promise<SearchStrategy> {
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

  const response = await callOpenAI(
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

export function isAPIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}

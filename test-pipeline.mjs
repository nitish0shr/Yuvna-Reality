/**
 * Pipeline Test Script - UPDATED with 5-Section Screening
 * Tests the candidate parsing pipeline with John Doe and Priya Sharma resumes.
 * Now includes all 5 required sections.
 */

const BACKEND_URL = 'http://localhost:3001';

// Test resume texts
const JOHN_DOE_RESUME = `Name: John Doe
Email: john.doe@example.com
Current Title: Senior Software Engineer
Current Company: Amazon

Employment:
Jan 2020 – Dec 2024: Senior Software Engineer, Amazon
- Led development of microservices architecture for order processing system
- Managed team of 5 engineers
- Technologies: Java, AWS, Kubernetes, PostgreSQL`;

const PRIYA_SHARMA_RESUME = `Name: Priya Sharma
Email: priya.sharma@example.com
Current Title: Software Engineer
Current Company: Google

Employment:
Mar 2018 – Present: Software Engineer, Google
- Built recommendation engine for YouTube using TensorFlow
- Worked on distributed systems serving 1B+ users
- Technologies: Python, Go, BigQuery, TensorFlow`;

const JOB_DESCRIPTION = `Job Title: Senior Software Engineer
Company: TechStartup Inc.
Location: San Francisco, CA (Remote OK)

About the Role:
We are looking for a Senior Software Engineer to join our team. You will work on building scalable backend systems.

Requirements:
- 5+ years of software engineering experience
- Experience with TypeScript, Node.js, and cloud platforms (AWS preferred)
- Strong problem-solving skills

Nice to Have:
- Experience with React
- Leadership experience`;

// Updated system message with 5-section requirement
const SYSTEM_MESSAGE = `You are an expert technical recruiter performing a full recruiter-level screening of candidates.

HARD RULES (YOU MUST OBEY ALL OF THESE):
- Use ONLY the resume text as the source of truth for candidate identity and employment history.
- Do NOT guess or infer names, companies, titles, dates, emails, or locations that are not explicitly present in the resume.
- If information is missing or unclear, set it to null or "Not Provided". Never fabricate or hallucinate values.
- Do NOT infer employer names from technologies or responsibilities.
- Do NOT infer job titles from responsibilities.
- Do NOT invent dates to fill gaps. Explicitly treat gaps as gaps if dates are missing.
- If the resume is garbage, corrupted, or clearly not a resume, set fullName to "Unknown Candidate" and leave most fields null.
- All strengths and gaps MUST be directly tied to the job description requirements.
- All descriptions must be SPECIFIC and reference actual resume details (project names, clients, technologies, team sizes).
- NO generic statements like "worked in this domain" or "has experience with X".
- You MUST produce ALL required sections - no skipping or collapsing.

OUTPUT RULES:
- You MUST respond with a single valid JSON object that matches exactly the schema the user gives you.
- Do NOT wrap the JSON in markdown.
- Do NOT add explanations, commentary, or any text outside the JSON.
- If you cannot produce valid JSON, return an error JSON with a clear message.`;

function buildUserMessage(resumeText, jobText) {
  return `You will perform a FULL recruiter-level screening of the following RESUME against the JOB DESCRIPTION.

The job description has already been analyzed. Use it to evaluate fit. Do not re-analyze it.
You MUST produce ALL 5 sections below. No skipping or collapsing sections.

You must return JSON that matches exactly this TypeScript type:

interface CareerHistoryEntry {
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  duration: string;
  description: string;  // MUST be specific: project names, clients, products, technologies, team sizes
  isGap?: boolean;
}

interface CandidateSummary {
  fullName: string | null;
  email: string | null;
  location: string | null;
  currentEmployer: string | null;
  currentJobTitle: string | null;
  totalExperienceYears: number | null;
}

interface FitAssessment {
  strengths: string[];      // MUST be specific, tied to JD requirements, reference exact resume details
  gaps: string[];           // MUST be specific, identify missing skills or mismatches vs JD
  overallFitScore: "High" | "Medium" | "Low";
  fitJustification: string;
}

interface InterviewNextSteps {
  recommendation: "Proceed to Interview" | "Request Clarification" | "Schedule Phone Screen" | "Reject";
  details: string;
  questionsToAsk: string[];
}

interface ScreeningEmail {
  subject: string;
  body: string;             // Warm, friendly, professional. Reference JD and specific resume details.
  screeningQuestions: string[];
}

interface ScoreBreakdown {
  mustHaveSkills: number;
  niceToHaveSkills: number;
  experienceDepth: number;
  constraintMatch: number;
  redFlagsPenalty: number;
  dealBreakersPenalty: number;
  culturalSignals: number;
  totalScore: number;
}

interface LotusCandidateResponse {
  candidateSummary: CandidateSummary;
  careerHistory: CareerHistoryEntry[];
  fitAssessment: FitAssessment;
  interviewNextSteps: InterviewNextSteps;
  screeningEmail: ScreeningEmail;
  score: number;
  recommendation: "Strong Yes" | "Yes" | "Maybe" | "Lean No" | "No";
  scoreBreakdown: ScoreBreakdown;
  redFlags: string[];
  dealBreakers: string[];
}

SECTION REQUIREMENTS:

1. CANDIDATE SUMMARY - Extract directly from resume. If missing, state "Not Provided"

2. CAREER HISTORY (Last 10 Years) - Description MUST be specific: project names, clients, technologies, team sizes

3. FIT ASSESSMENT - Strengths MUST reference exact resume details. Gaps MUST identify specific missing skills vs JD.

4. INTERVIEW NEXT STEPS - Specific recommendations based on this candidate

5. PERSONALIZED SCREENING EMAIL - Must feel like you personally reviewed their resume. NO generic phrases.

RESUME TEXT:
<<<
${resumeText}
>>>

JOB DESCRIPTION TEXT:
<<<
${jobText}
>>>

Return ONLY a LotusCandidateResponse JSON object. All 5 sections are REQUIRED.`;
}

async function testCandidate(candidateName, resumeText) {
  console.log('\n' + '='.repeat(80));
  console.log(`TESTING: ${candidateName}`);
  console.log('='.repeat(80));

  // STEP A: Log parsed resume text
  console.log('\n--- STEP A: Parsed Resume Text (first 500 chars) ---');
  console.log(resumeText.slice(0, 500));

  // Build the prompt
  const userMessage = buildUserMessage(resumeText, JOB_DESCRIPTION);

  // STEP B: Log full prompt being sent
  console.log('\n--- STEP B: Full Prompt Sent to AI ---');
  console.log('SYSTEM MESSAGE:');
  console.log(SYSTEM_MESSAGE.slice(0, 500) + '...');
  console.log('\nUSER MESSAGE (first 1000 chars):');
  console.log(userMessage.slice(0, 1000) + '...');

  // Call the LLM via backend
  console.log('\n--- Calling LLM API... ---');
  const response = await fetch(`${BACKEND_URL}/api/llm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'claude',
      messages: [
        { role: 'system', content: SYSTEM_MESSAGE },
        { role: 'user', content: userMessage },
      ],
      jsonMode: true,
      temperature: 0.0,
      maxTokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('LLM API Error:', error);
    return;
  }

  const data = await response.json();
  const rawContent = data.content;

  // STEP C: Log raw AI response
  console.log('\n--- STEP C: Raw AI Response (first 1500 chars) ---');
  console.log(rawContent.slice(0, 1500));

  // STEP D: Parse JSON
  let parsed;
  try {
    // Extract JSON from response
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```')) {
      const firstNewline = cleaned.indexOf('\n');
      if (firstNewline !== -1) cleaned = cleaned.substring(firstNewline + 1);
      if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
      cleaned = cleaned.trim();
    }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON Parse Error:', e.message);
    console.log('Raw content:', rawContent);
    return;
  }

  // STEP D: Parsed JSON with all 5 sections
  console.log('\n--- STEP D: Parsed JSON - ALL 5 SECTIONS ---');

  console.log('\n=== SECTION 1: CANDIDATE SUMMARY ===');
  console.log('fullName:', parsed.candidateSummary?.fullName);
  console.log('email:', parsed.candidateSummary?.email);
  console.log('location:', parsed.candidateSummary?.location);
  console.log('currentEmployer:', parsed.candidateSummary?.currentEmployer);
  console.log('currentJobTitle:', parsed.candidateSummary?.currentJobTitle);
  console.log('totalExperienceYears:', parsed.candidateSummary?.totalExperienceYears);

  console.log('\n=== SECTION 2: CAREER HISTORY ===');
  (parsed.careerHistory || []).forEach((entry, i) => {
    console.log(`[${i + 1}] ${entry.jobTitle} at ${entry.company}`);
    console.log(`    ${entry.startDate} - ${entry.endDate} (${entry.duration})`);
    console.log(`    Description: ${entry.description?.slice(0, 100)}...`);
  });

  console.log('\n=== SECTION 3: FIT ASSESSMENT ===');
  console.log('Overall Fit Score:', parsed.fitAssessment?.overallFitScore);
  console.log('Justification:', parsed.fitAssessment?.fitJustification);
  console.log('Strengths:', (parsed.fitAssessment?.strengths || []).length, 'items');
  (parsed.fitAssessment?.strengths || []).forEach((s, i) => console.log(`  [${i + 1}] ${s}`));
  console.log('Gaps:', (parsed.fitAssessment?.gaps || []).length, 'items');
  (parsed.fitAssessment?.gaps || []).forEach((g, i) => console.log(`  [${i + 1}] ${g}`));

  console.log('\n=== SECTION 4: INTERVIEW NEXT STEPS ===');
  console.log('Recommendation:', parsed.interviewNextSteps?.recommendation);
  console.log('Details:', parsed.interviewNextSteps?.details);
  console.log('Questions to Ask:', (parsed.interviewNextSteps?.questionsToAsk || []).length, 'items');

  console.log('\n=== SECTION 5: SCREENING EMAIL ===');
  console.log('Subject:', parsed.screeningEmail?.subject);
  console.log('Body preview:', parsed.screeningEmail?.body?.slice(0, 200) + '...');
  console.log('Screening Questions:', (parsed.screeningEmail?.screeningQuestions || []).length, 'items');

  console.log('\n=== SCORE ===');
  console.log('Score:', parsed.score);
  console.log('Recommendation:', parsed.recommendation);

  // STEP E: Simulated state object
  const candidateStateObject = {
    id: 'test-' + Date.now(),
    fileName: candidateName.toLowerCase().replace(' ', '_') + '_resume.txt',
    core: {
      fullName: parsed.candidateSummary?.fullName,
      email: parsed.candidateSummary?.email,
      currentTitle: parsed.candidateSummary?.currentJobTitle,
      currentCompany: parsed.candidateSummary?.currentEmployer,
      totalExperienceYears: parsed.candidateSummary?.totalExperienceYears,
      location: parsed.candidateSummary?.location,
    },
    careerHistory: parsed.careerHistory,
    fitAssessment: parsed.fitAssessment,
    interviewNextSteps: parsed.interviewNextSteps,
    screeningEmail: parsed.screeningEmail,
    score: parsed.score,
    recommendation: parsed.recommendation,
  };

  // Verification
  console.log('\n--- VERIFICATION ---');
  const resumeLower = resumeText.toLowerCase();
  const nameMatch = candidateStateObject.core.fullName && resumeText.includes(candidateStateObject.core.fullName);
  const emailMatch = candidateStateObject.core.email && resumeText.includes(candidateStateObject.core.email);
  const companyMatch = candidateStateObject.core.currentCompany && resumeLower.includes(candidateStateObject.core.currentCompany.toLowerCase());

  // Check all 5 sections are present
  const hasSection1 = !!parsed.candidateSummary;
  const hasSection2 = Array.isArray(parsed.careerHistory) && parsed.careerHistory.length > 0;
  const hasSection3 = !!parsed.fitAssessment && !!parsed.fitAssessment.overallFitScore;
  const hasSection4 = !!parsed.interviewNextSteps && !!parsed.interviewNextSteps.recommendation;
  const hasSection5 = !!parsed.screeningEmail && !!parsed.screeningEmail.body;

  console.log('Name matches resume:', nameMatch ? '✓ YES' : '✗ NO');
  console.log('Email matches resume:', emailMatch ? '✓ YES' : '✗ NO');
  console.log('Company matches resume:', companyMatch ? '✓ YES' : '✗ NO');
  console.log('Section 1 (Summary) present:', hasSection1 ? '✓ YES' : '✗ NO');
  console.log('Section 2 (Career History) present:', hasSection2 ? '✓ YES' : '✗ NO');
  console.log('Section 3 (Fit Assessment) present:', hasSection3 ? '✓ YES' : '✗ NO');
  console.log('Section 4 (Next Steps) present:', hasSection4 ? '✓ YES' : '✗ NO');
  console.log('Section 5 (Email) present:', hasSection5 ? '✓ YES' : '✗ NO');

  return {
    candidateName,
    nameMatch,
    emailMatch,
    companyMatch,
    extractedName: candidateStateObject.core.fullName,
    extractedEmail: candidateStateObject.core.email,
    extractedCompany: candidateStateObject.core.currentCompany,
    allSectionsPresent: hasSection1 && hasSection2 && hasSection3 && hasSection4 && hasSection5,
    fitScore: parsed.fitAssessment?.overallFitScore,
    recommendation: parsed.interviewNextSteps?.recommendation,
  };
}

async function main() {
  console.log('Pipeline Test Script');
  console.log('Testing with backend at:', BACKEND_URL);
  console.log('');

  // Test John Doe
  const johnResult = await testCandidate('John Doe', JOHN_DOE_RESUME);

  // Test Priya Sharma
  const priyaResult = await testCandidate('Priya Sharma', PRIYA_SHARMA_RESUME);

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY - 5-SECTION SCREENING');
  console.log('='.repeat(80));

  if (johnResult) {
    console.log(`\nJohn Doe:`);
    console.log(`  Expected: Name="John Doe", Email="john.doe@example.com", Company="Amazon"`);
    console.log(`  Got:      Name="${johnResult.extractedName}", Email="${johnResult.extractedEmail}", Company="${johnResult.extractedCompany}"`);
    console.log(`  Match:    Name=${johnResult.nameMatch ? '✓' : '✗'}, Email=${johnResult.emailMatch ? '✓' : '✗'}, Company=${johnResult.companyMatch ? '✓' : '✗'}`);
    console.log(`  All 5 Sections Present: ${johnResult.allSectionsPresent ? '✓ YES' : '✗ NO'}`);
    console.log(`  Fit Score: ${johnResult.fitScore}`);
    console.log(`  Interview Recommendation: ${johnResult.recommendation}`);
  }

  if (priyaResult) {
    console.log(`\nPriya Sharma:`);
    console.log(`  Expected: Name="Priya Sharma", Email="priya.sharma@example.com", Company="Google"`);
    console.log(`  Got:      Name="${priyaResult.extractedName}", Email="${priyaResult.extractedEmail}", Company="${priyaResult.extractedCompany}"`);
    console.log(`  Match:    Name=${priyaResult.nameMatch ? '✓' : '✗'}, Email=${priyaResult.emailMatch ? '✓' : '✗'}, Company=${priyaResult.companyMatch ? '✓' : '✗'}`);
    console.log(`  All 5 Sections Present: ${priyaResult.allSectionsPresent ? '✓ YES' : '✗ NO'}`);
    console.log(`  Fit Score: ${priyaResult.fitScore}`);
    console.log(`  Interview Recommendation: ${priyaResult.recommendation}`);
  }
}

main().catch(console.error);

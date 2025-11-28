import mammoth from 'mammoth';

export async function parseFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  console.log(`[FileParser] Processing file: ${file.name}, type: ${extension}, size: ${file.size}`);

  try {
    switch (extension) {
      case 'txt':
        const textContent = await file.text();
        console.log(`[FileParser] TXT parsed, length: ${textContent.length}`);
        return textContent;

      case 'pdf':
        return await parsePDF(file);

      case 'doc':
      case 'docx':
        return await parseWord(file);

      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error(`[FileParser] Error processing ${file.name}:`, error);
    throw error;
  }
}

async function parsePDF(file: File): Promise<string> {
  console.log('[FileParser] Starting PDF parse...');

  try {
    // Dynamic import for PDF.js to avoid worker issues
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    console.log('[FileParser] PDF arrayBuffer size:', arrayBuffer.byteLength);

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    console.log(`[FileParser] PDF loaded, pages: ${pdf.numPages}`);

    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: unknown) => (item as { str: string }).str)
        .join(' ');
      textParts.push(pageText);
    }

    const result = textParts.join('\n\n');
    console.log(`[FileParser] PDF parsed successfully, total length: ${result.length}`);
    return result;
  } catch (error) {
    console.error('[FileParser] PDF parsing failed:', error);
    // Fallback: try to read as text
    try {
      const text = await file.text();
      if (text.length > 100) {
        console.log('[FileParser] Fallback text extraction worked');
        return text;
      }
    } catch {}
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}

async function parseWord(file: File): Promise<string> {
  console.log('[FileParser] Starting Word parse...');

  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('[FileParser] Word arrayBuffer size:', arrayBuffer.byteLength);

    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log(`[FileParser] Word parsed successfully, length: ${result.value.length}`);
    return result.value;
  } catch (error) {
    console.error('[FileParser] Word parsing failed:', error);
    throw new Error(`Failed to parse Word document: ${error}`);
  }
}

export function extractNameFromResume(text: string, fileName?: string): string {
  if (!text || text.trim().length === 0) {
    // Try to extract from filename as absolute last resort
    if (fileName) {
      return extractNameFromFileName(fileName);
    }
    return 'Unknown Candidate';
  }

  // Strategy 1: Look for name patterns in first few lines
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    if (fileName) return extractNameFromFileName(fileName);
    return 'Unknown Candidate';
  }

  // Check first 5 lines for a name-like pattern
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();

    // Skip lines that look like headers, titles, or contact info
    if (/^(resume|cv|curriculum vitae|contact|phone|email|address|portfolio|linkedin)/i.test(line)) {
      continue;
    }

    // Skip lines with URLs or email addresses as the main content
    if (/^(https?:\/\/|www\.|.*@.*\.\w{2,})/.test(line)) {
      continue;
    }

    // Skip lines with phone numbers
    if (/^\+?\d[\d\s\-().]{8,}$/.test(line)) {
      continue;
    }

    // Clean up common prefixes
    const cleaned = line
      .replace(/^(name|full name|candidate)[\s:]+/i, '')
      .replace(/[|•·\-–—]/g, '')
      .trim();

    // Check if it looks like a name (1-4 words, mostly letters, reasonable length)
    const words = cleaned.split(/\s+/);
    if (
      words.length >= 1 &&
      words.length <= 4 &&
      cleaned.length >= 2 &&
      cleaned.length <= 60 &&
      words.every((w) => /^[A-Za-z'-]+$/.test(w) && w.length >= 2)
    ) {
      // Capitalize properly
      const properName = words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      return properName;
    }
  }

  // Strategy 2: Look for "Name:" or similar patterns in the document
  const namePatterns = [
    /(?:^|\n)\s*(?:full\s*)?name\s*[:\-]\s*([A-Za-z][A-Za-z'\-\s]{2,40})/i,
    /(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*(?:\n|$)/m,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length >= 3 && name.length <= 50 && !/\d/.test(name)) {
        return name;
      }
    }
  }

  // Strategy 3: Try to find name near email and extract from it
  const emailMatch = text.match(
    /([a-zA-Z][a-zA-Z0-9._%+-]*)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  if (emailMatch) {
    const emailName = emailMatch[1]
      .replace(/[._]/g, ' ')
      .replace(/\d+/g, '')
      .trim();
    if (emailName.length >= 3) {
      const words = emailName.split(/\s+/).filter(w => w.length >= 2);
      if (words.length >= 1 && words.length <= 3) {
        return words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }
  }

  // Strategy 4: Use first line if it's short enough and doesn't look like junk
  const firstLine = lines[0].trim();
  if (
    firstLine.length >= 3 &&
    firstLine.length <= 40 &&
    !/\d/.test(firstLine) &&
    !/[@#$%^&*()]/.test(firstLine) &&
    !/^(http|www|resume|cv|professional)/i.test(firstLine)
  ) {
    return firstLine;
  }

  // Last resort: try filename
  if (fileName) {
    const nameFromFile = extractNameFromFileName(fileName);
    if (nameFromFile !== 'Unknown Candidate') {
      return nameFromFile;
    }
  }

  return 'Unknown Candidate';
}

function extractNameFromFileName(fileName: string): string {
  // Remove extension
  const baseName = fileName.replace(/\.[^.]+$/, '');

  // Remove common resume-related words
  const cleaned = baseName
    .replace(/[-_]/g, ' ')
    .replace(/\b(resume|cv|curriculum|vitae|final|draft|v\d+|\d{4}|\d{2})\b/gi, '')
    .trim();

  // Split into words and capitalize
  const words = cleaned.split(/\s+/).filter(w => w.length >= 2);

  if (words.length >= 1 && words.length <= 4) {
    const name = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    if (name.length >= 3 && /^[A-Za-z\s'-]+$/.test(name)) {
      return `${name} (from file)`;
    }
  }

  return 'Unknown Candidate';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Extract current job title from resume
export function extractCurrentJobTitle(text: string): string | null {
  if (!text || text.trim().length === 0) return null;

  // Common job title patterns
  const titlePatterns = [
    // "Current Role: Title" or "Title: Role"
    /(?:current\s*(?:role|position|title)|title|role|position)\s*[:–\-]\s*([A-Za-z][A-Za-z\s&,\/\-]{2,50})/i,
    // Look for titles near "at" or "@" company
    /\b((?:senior|junior|lead|principal|staff|chief|head|vp|director|manager|engineer|developer|designer|analyst|consultant|specialist|coordinator|associate|intern)[A-Za-z\s&,\/\-]{0,40})\s+(?:at|@)\s+/i,
    // Experience section - first job title after "Experience" header
    /(?:experience|work\s*history|employment)\s*[\n\r]+[^A-Za-z]*([A-Za-z][A-Za-z\s&,\/\-]{2,50})(?:\s*[-–|•]|\s+at\s+|\s*\n)/i,
    // Common title patterns standalone
    /\b((?:software|senior|junior|lead|principal|staff|full[\s-]?stack|front[\s-]?end|back[\s-]?end|mobile|data|ml|ai|devops|cloud|security|qa|test|ux|ui|product|project|program|engineering|technical|solutions|sales|marketing|business|operations|customer|hr|finance|legal)\s+(?:engineer|developer|designer|analyst|scientist|architect|manager|director|consultant|specialist|lead|coordinator|associate))/i,
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      // Validate it looks like a job title (not too long, no weird characters)
      if (title.length >= 3 && title.length <= 60 && !/[\d@#$%^*(){}[\]]/.test(title)) {
        // Clean up and capitalize
        return title.replace(/\s+/g, ' ').trim();
      }
    }
  }

  return null;
}

// Extract current company from resume
export function extractCurrentCompany(text: string): string | null {
  if (!text || text.trim().length === 0) return null;

  // Common company patterns
  const companyPatterns = [
    // "at Company" or "@ Company"
    /(?:currently\s+(?:at|with)|working\s+(?:at|for)|employed\s+(?:at|by)|at|@)\s+([A-Z][A-Za-z0-9\s&,.\-']{1,40}?)(?:\s*[-–|•]|\s*\n|\s+as\s+|\s+since|\s*$)/i,
    // Company name before date range
    /([A-Z][A-Za-z0-9\s&,.\-']{2,40})\s*[-–|]\s*(?:present|current|ongoing|now|\d{4})/i,
    // Experience section - company after title
    /(?:experience|work\s*history|employment)\s*[\n\r]+[^A-Za-z]*[A-Za-z][A-Za-z\s&,\/\-]{2,50}\s*(?:[-–|•]|at|@)\s*([A-Z][A-Za-z0-9\s&,.\-']{2,40})/i,
    // Well-known tech companies
    /\b(Google|Meta|Facebook|Amazon|Apple|Microsoft|Netflix|Tesla|Uber|Lyft|Airbnb|Stripe|Square|Shopify|Salesforce|Oracle|IBM|Intel|Nvidia|Adobe|Spotify|Twitter|LinkedIn|Snap|Pinterest|Reddit|Discord|Slack|Zoom|Dropbox|Box|Twilio|Atlassian|Databricks|Snowflake|Palantir|Coinbase|Robinhood|Plaid|Figma|Notion|Airtable|Webflow|Vercel|Netlify|Cloudflare|Datadog|Hashicorp|MongoDB|Elastic|Confluent|Okta|CrowdStrike|Zscaler|Palo Alto Networks|Fortinet)\b/,
  ];

  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const company = match[1].trim();
      // Validate it looks like a company name
      if (company.length >= 2 && company.length <= 50 && !/^[\d\s]+$/.test(company)) {
        // Clean up
        return company.replace(/\s+/g, ' ').replace(/[,.\-]+$/, '').trim();
      }
    }
  }

  return null;
}

// Extract sponsorship requirement from resume
export function extractSponsorshipNeed(text: string): boolean | null {
  if (!text || text.trim().length === 0) return null;

  const textLower = text.toLowerCase();

  // Patterns indicating they need sponsorship
  const needsSponsorshipPatterns = [
    /require[sd]?\s+(?:visa\s+)?sponsorship/i,
    /need[sd]?\s+(?:visa\s+)?sponsorship/i,
    /seeking\s+(?:visa\s+)?sponsorship/i,
    /will\s+require\s+(?:visa\s+)?sponsorship/i,
    /visa\s+sponsorship\s+(?:is\s+)?required/i,
    /h[- ]?1b\s+(?:visa\s+)?(?:sponsorship\s+)?(?:required|needed)/i,
    /opt[\s-]?(?:stem)?[\s-]?extension/i,
  ];

  // Patterns indicating they don't need sponsorship
  const noSponsorshipPatterns = [
    /(?:do\s+)?not\s+require\s+(?:visa\s+)?sponsorship/i,
    /(?:no|don't)\s+need\s+(?:visa\s+)?sponsorship/i,
    /authorized\s+to\s+work/i,
    /work\s+authorization/i,
    /us\s+citizen/i,
    /permanent\s+resident/i,
    /green\s+card/i,
    /(?:no\s+)?visa\s+sponsorship\s+(?:is\s+)?not\s+required/i,
    /legally\s+authorized/i,
  ];

  // Check for no sponsorship needed first (it's more definitive)
  for (const pattern of noSponsorshipPatterns) {
    if (pattern.test(textLower)) {
      return false;
    }
  }

  // Then check if they need sponsorship
  for (const pattern of needsSponsorshipPatterns) {
    if (pattern.test(textLower)) {
      return true;
    }
  }

  return null; // Unknown
}

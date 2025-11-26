import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

interface AnalysisResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

const SKILL_KEYWORDS = [
  'angular', 'react', 'vue', 'svelte', 'next', 'nuxt', 'ember',
  'html', 'html5', 'css', 'css3', 'javascript', 'js', 'typescript', 'ts',
  'responsive', 'bootstrap', 'tailwind', 'sass', 'scss', 'less',
  'webpack', 'vite', 'parcel', 'rollup', 'gulp',
  'redux', 'mobx', 'zustand', 'recoil', 'context',
  'rxjs', 'observable', 'promise', 'async', 'await',
  'nodejs', 'express', 'nest', 'fastify', 'koa',
  'python', 'django', 'flask', 'fastapi',
  'java', 'spring', 'maven', 'gradle',
  'csharp', 'dotnet', 'asp',
  'ruby', 'rails',
  'go', 'rust', 'php', 'laravel',
  'rest', 'graphql', 'grpc', 'websocket', 'socket',
  'sql', 'mysql', 'postgresql', 'postgres', 'oracle', 'mssql', 'sqlite',
  'mongodb', 'mongo', 'nosql', 'firebase', 'firestore', 'dynamodb',
  'supabase', 'redis', 'elasticsearch', 'cassandra',
  'docker', 'kubernetes', 'k8s',
  'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify',
  'cicd', 'jenkins', 'github', 'gitlab', 'bitbucket',
  'terraform', 'ansible', 'cloudformation',
  'linux', 'bash', 'shell', 'git',
  'testing', 'jest', 'mocha', 'jasmine', 'vitest', 'playwright', 'cypress',
  'selenium', 'puppeteer', 'protractor',
  'junit', 'pytest', 'unittest', 'rspec',
  'tdd', 'bdd', 'coverage',
  'jira', 'confluence', 'slack', 'asana', 'trello',
  'vscode', 'intellij', 'webstorm', 'visual studio',
  'figma', 'sketch', 'adobe', 'photoshop',
  'postman', 'insomnia', 'swagger', 'api',
  'material', 'antd', 'chakra',
  'leadership', 'communication', 'teamwork', 'collaboration',
  'agile', 'scrum', 'kanban', 'waterfall',
  'project', 'management', 'mentoring', 'training'
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { resumeText, jobDescription }: AnalysisRequest = await req.json();

    if (!resumeText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const analysis = performAIAnalysis(resumeText, jobDescription);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Analysis failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function performAIAnalysis(resumeText: string, jobDescription: string): AnalysisResult {
  const resume = normalizeText(resumeText);
  const jobDesc = normalizeText(jobDescription);

  const jobSkills = extractSkills(jobDesc);
  const resumeSkills = extractSkills(resume);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jobSkills) {
    const skillMatched = resumeSkills.some(rs => compareSkills(rs, skill));
    if (skillMatched) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const matchPercentage = jobSkills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 0;

  const strengths = analyzeStrengths(resume, matchedSkills, resumeSkills);
  const recommendations = generateRecommendations(missingSkills, matchPercentage);
  const summary = createSummary(matchPercentage, matchedSkills.length, jobSkills.length);

  return {
    matchPercentage,
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    strengths,
    recommendations,
    summary,
  };
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s./+#()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSkills(text: string): string[] {
  const skills = new Set<string>();

  for (const keyword of SKILL_KEYWORDS) {
    if (text.includes(keyword)) {
      skills.add(formatSkillName(keyword));
    }
  }

  const phrases = text.split(/[,;:|]/)
    .map(p => p.trim())
    .filter(p => p.length > 2 && p.length < 50);

  for (const phrase of phrases) {
    const words = phrase.split(/\s+/);
    if (words.length <= 3) {
      const cleaned = cleanPhrase(phrase);
      if (cleaned && !isCommon(cleaned) && !skills.has(cleaned)) {
        skills.add(cleaned);
      }
    }
  }

  return Array.from(skills);
}

function formatSkillName(keyword: string): string {
  const mapping: Record<string, string> = {
    'nodejs': 'Node.js',
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'csharp': 'C#',
    'dotnet': '.NET',
    'asp': 'ASP.NET',
    'postgres': 'PostgreSQL',
    'cicd': 'CI/CD',
    'k8s': 'Kubernetes',
    'rxjs': 'RxJS',
    'observable': 'Observables',
    'async': 'Async/Await',
    'websocket': 'WebSockets',
    'rest': 'REST API',
    'graphql': 'GraphQL',
  };

  if (mapping[keyword]) {
    return mapping[keyword];
  }

  return keyword.split(/[-./+#]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function compareSkills(skill1: string, skill2: string): boolean {
  const s1 = skill1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = skill2.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (s1 === s2) return true;
  if (s1.includes(s2) || s2.includes(s1)) return true;

  const similarity = calculateSimilarity(s1, s2);
  return similarity > 0.8;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }

  return costs[s2.length];
}

function cleanPhrase(phrase: string): string {
  const cleaned = phrase.replace(/[^a-z0-9\s/+#-]/g, '').trim();
  if (cleaned.length < 2 || cleaned.length > 40) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function isCommon(word: string): boolean {
  const common = [
    'the', 'and', 'or', 'is', 'are', 'be', 'have', 'with', 'from', 'for',
    'by', 'to', 'of', 'in', 'on', 'at', 'as', 'experience', 'education',
    'skills', 'required', 'preferred', 'ability', 'strong', 'excellent',
    'knowledge', 'proficiency', 'understanding', 'familiar', 'degree',
    'years', 'role', 'position', 'job'
  ];
  return common.includes(word.toLowerCase());
}

function analyzeStrengths(resume: string, matched: string[], allResumeSkills: string[]): string[] {
  const strengths: string[] = [];

  if (matched.length >= 10) {
    strengths.push(`Excellent match with ${matched.length} key requirements`);
  } else if (matched.length >= 7) {
    strengths.push(`Strong match with ${matched.length} required skills`);
  } else if (matched.length >= 4) {
    strengths.push(`Good alignment with ${matched.length} skills`);
  } else if (matched.length > 0) {
    strengths.push(`${matched.length} skill(s) match the requirements`);
  }

  const bonusSkills = allResumeSkills.length - matched.length;
  if (bonusSkills > 8) {
    strengths.push(`Additional ${bonusSkills} advanced skills`);
  } else if (bonusSkills > 3) {
    strengths.push(`${bonusSkills} extra skill(s) not required`);
  }

  if (resume.includes('lead') || resume.includes('senior') || resume.includes('manager')) {
    strengths.push('Leadership experience shown');
  }

  if ((resume.includes('built') || resume.includes('developed')) &&
      (resume.includes('team') || resume.includes('project'))) {
    strengths.push('Proven project delivery capability');
  }

  if (resume.includes('certification') || resume.includes('certified')) {
    strengths.push('Professional certifications');
  }

  return strengths.length > 0 ? strengths : ['Candidate assessment complete'];
}

function generateRecommendations(missing: string[], percentage: number): string[] {
  const recommendations: string[] = [];

  if (percentage >= 90) {
    recommendations.push('Highly qualified - apply immediately');
  } else if (percentage >= 80) {
    recommendations.push('Excellent fit - strong candidate profile');
  } else if (percentage >= 70) {
    recommendations.push('Good candidate - highlight strengths');
  } else if (percentage >= 50) {
    recommendations.push('Moderate fit - emphasize transferable skills');
  } else if (percentage >= 30) {
    recommendations.push('Build experience in key areas first');
  } else {
    recommendations.push('Significant skill gap - consider training');
  }

  if (missing.length > 0 && missing.length <= 2) {
    recommendations.push(`Learn: ${missing.slice(0, 2).join(', ')}`);
  } else if (missing.length > 2) {
    recommendations.push(`Focus on: ${missing.slice(0, 2).join(', ')}`);
  }

  return recommendations;
}

function createSummary(percentage: number, matched: number, total: number): string {
  if (percentage >= 90) {
    return `Perfect match! ${matched}/${total} required skills found. Outstanding candidate.`;
  } else if (percentage >= 80) {
    return `Excellent match - ${matched}/${total} skills align. Only ${total - matched} area(s) to develop.`;
  } else if (percentage >= 70) {
    return `Strong match - ${matched} of ${total} requirements met. Ready for role with minor growth.`;
  } else if (percentage >= 50) {
    return `Good match - ${matched}/${total} skills present. Build experience in missing areas.`;
  } else if (percentage >= 30) {
    return `Moderate alignment - ${matched} matching skill(s). Significant development needed.`;
  } else if (percentage > 0) {
    return `Limited match - ${matched} skill(s) align. Consider focused skill development.`;
  } else {
    return 'Resume and job requirements need better alignment.';
  }
}

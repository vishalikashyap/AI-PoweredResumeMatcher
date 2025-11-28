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
  resumeText: string;
  resumeSkills: string[];
  jobDescriptionText: string;
  jobRequiredSkills: string[];
}

const SKILLS_DATABASE = [
  'angular', 'react', 'vue', 'svelte', 'next', 'nuxt', 'ember', 'backbone',
  'html', 'html5', 'css', 'css3', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx',
  'responsive', 'bootstrap', 'tailwind', 'sass', 'scss', 'less', 'styled-components',
  'webpack', 'vite', 'parcel', 'rollup', 'gulp', 'grunt', 'esbuild', 'browsify',
  'redux', 'mobx', 'zustand', 'recoil', 'context', 'vuex', 'pinia',
  'rxjs', 'observable', 'promise', 'async', 'await', 'generator',
  'nodejs', 'node.js', 'express', 'nest', 'nestjs', 'fastify', 'koa', 'hapi', 'restify',
  'python', 'django', 'flask', 'fastapi', 'celery', 'bottle', 'tornado',
  'java', 'spring', 'springboot', 'maven', 'gradle', 'junit',
  'csharp', 'c#', 'dotnet', '.net', 'asp', 'aspnet',
  'ruby', 'rails', 'sinatra', 'hanami', 'padrino',
  'go', 'golang', 'rust', 'php', 'laravel', 'symfony', 'yii', 'codeigniter',
  'rest', 'restapi', 'graphql', 'grpc', 'websocket', 'socket', 'mqtt', 'amqp',
  'sql', 'mysql', 'postgresql', 'postgres', 'oracle', 'mssql', 'sqlite', 'mariadb',
  'mongodb', 'mongo', 'nosql', 'firebase', 'firestore', 'dynamodb', 'cosmosdb', 'couchdb',
  'supabase', 'redis', 'memcached', 'elasticsearch', 'cassandra', 'neo4j', 'influxdb',
  'docker', 'kubernetes', 'k8s', 'swarm', 'rancher', 'openshift',
  'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'fly.io', 'render',
  'cicd', 'ci/cd', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis', 'drone', 'buildkite',
  'terraform', 'ansible', 'cloudformation', 'pulumi', 'bicep', 'arm',
  'linux', 'bash', 'shell', 'zsh', 'powershell', 'git', 'github', 'gitlab', 'bitbucket',
  'testing', 'test', 'jest', 'mocha', 'jasmine', 'vitest', 'playwright', 'cypress', 'e2e',
  'selenium', 'puppeteer', 'protractor', 'testcafe', 'webdriverio',
  'junit', 'pytest', 'unittest', 'rspec', 'mockito', 'sinon',
  'tdd', 'bdd', 'coverage', 'sonarqube', 'code review',
  'jira', 'confluence', 'slack', 'asana', 'trello', 'monday', 'notion',
  'vscode', 'intellij', 'webstorm', 'visual studio', 'sublime', 'atom', 'nvim',
  'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'after effects',
  'postman', 'insomnia', 'swagger', 'openapi', 'api', 'documentation',
  'material', 'antd', 'chakra', 'styled', 'emotion', 'tailwindcss',
  'leadership', 'communication', 'teamwork', 'collaboration', 'team',
  'agile', 'scrum', 'kanban', 'waterfall', 'sprint', 'standup',
  'project', 'management', 'mentoring', 'training', 'onboarding',
  'security', 'oauth', 'jwt', 'saml', 'encryption', 'hashing',
  'performance', 'optimization', 'caching', 'cdn', 'lazy loading',
  'monitoring', 'logging', 'alerting', 'metrics', 'observability',
  'machine learning', 'ml', 'ai', 'neural', 'tensorflow', 'pytorch', 'scikit-learn'
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

    const analysis = performAnalysis(resumeText, jobDescription);

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

function performAnalysis(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeNormalized = normalizeAndClean(resumeText);
  const jobDescNormalized = normalizeAndClean(jobDescription);

  const jobRequiredSkills = extractSkillsFromText(jobDescNormalized);
  const resumeSkills = extractSkillsFromText(resumeNormalized);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const jobSkill of jobRequiredSkills) {
    let found = false;
    for (const resumeSkill of resumeSkills) {
      if (skillsMatch(jobSkill, resumeSkill)) {
        matchedSkills.push(jobSkill);
        found = true;
        break;
      }
    }
    if (!found) {
      missingSkills.push(jobSkill);
    }
  }

  const matchPercentage = jobRequiredSkills.length > 0
    ? Math.round((matchedSkills.length / jobRequiredSkills.length) * 100)
    : 0;

  const strengths = buildStrengths(resumeNormalized, matchedSkills, resumeSkills);
  const recommendations = buildRecommendations(missingSkills, matchPercentage);
  const summary = buildSummary(matchPercentage, matchedSkills.length, jobRequiredSkills.length);

  return {
    matchPercentage,
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    strengths,
    recommendations,
    summary,
    resumeText: resumeText.substring(0, 1000),
    resumeSkills: [...new Set(resumeSkills)].slice(0, 25),
    jobDescriptionText: jobDescription.substring(0, 1000),
    jobRequiredSkills: [...new Set(jobRequiredSkills)],
  };
}

function normalizeAndClean(text: string): string {
  if (!text) return '';

  let cleaned = text.toLowerCase();
  cleaned = cleaned.replace(/[^a-z0-9\s./+#()-]/g, ' ');
  cleaned = cleaned.split('\n').join(' ');
  cleaned = cleaned.split('\r').join(' ');
  cleaned = cleaned.split('\t').join(' ');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();

  return cleaned;
}

function extractSkillsFromText(text: string): string[] {
  const skills = new Set<string>();

  for (const skill of SKILLS_DATABASE) {
    const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'gi');
    if (regex.test(text)) {
      skills.add(normalizeSkillName(skill));
    }
  }

  const phrases = text.split(/[,;:|]/)
    .map(p => p.trim())
    .filter(p => p.length > 2 && p.length < 60);

  for (const phrase of phrases) {
    const words = phrase.split(/\s+/);
    if (words.length <= 3) {
      const candidate = cleanSkillPhrase(phrase);
      if (candidate && candidate.length > 2 && !isStopword(candidate)) {
        skills.add(candidate);
      }
    }
  }

  return Array.from(skills);
}

function skillsMatch(skill1: string, skill2: string): boolean {
  const s1 = normalize(skill1);
  const s2 = normalize(skill2);

  if (s1 === s2) return true;
  if (s1.includes(s2) || s2.includes(s1)) return true;

  const similarity = calculateSimilarity(s1, s2);
  return similarity > 0.75;
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const editDist = levenshteinDistance(longer, shorter);
  return 1 - (editDist / longer.length);
}

function levenshteinDistance(s1: string, s2: string): number {
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

function cleanSkillPhrase(phrase: string): string {
  let cleaned = phrase.replace(/[^a-z0-9\s/#.+-]/g, '').trim();
  if (cleaned.length < 2 || cleaned.length > 50) return '';
  return cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function normalizeSkillName(skill: string): string {
  const mapping: Record<string, string> = {
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'csharp': 'C#',
    'c#': 'C#',
    'dotnet': '.NET',
    'asp': 'ASP.NET',
    'postgres': 'PostgreSQL',
    'cicd': 'CI/CD',
    'ci/cd': 'CI/CD',
    'k8s': 'Kubernetes',
    'rxjs': 'RxJS',
    'observable': 'Observables',
    'async': 'Async/Await',
    'websocket': 'WebSockets',
    'rest': 'REST API',
    'restapi': 'REST API',
    'graphql': 'GraphQL',
    'springboot': 'Spring Boot',
    'nestjs': 'NestJS',
    'html5': 'HTML5',
    'css3': 'CSS3',
  };

  if (mapping[skill.toLowerCase()]) {
    return mapping[skill.toLowerCase()];
  }

  return skill.split(/[-/. ]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isStopword(word: string): boolean {
  const stopwords = [
    'the', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'have', 'has', 'had', 'do', 'does',
    'with', 'from', 'for', 'by', 'to', 'of', 'in', 'on', 'at', 'as', 'an', 'a',
    'required', 'must', 'should', 'preferred', 'experience', 'education', 'skills',
    'knowledge', 'understanding', 'ability', 'capable', 'strong', 'excellent',
    'years', 'role', 'position', 'job', 'degree', 'bachelor', 'master', 'phd',
    'proficiency', 'familiar', 'good', 'basic', 'advanced', 'intermediate', 'expert'
  ];
  return stopwords.includes(word.toLowerCase());
}

function buildStrengths(resume: string, matched: string[], allSkills: string[]): string[] {
  const strengths: string[] = [];

  if (matched.length >= 15) {
    strengths.push(`Perfect match - ${matched.length} key skills found`);
  } else if (matched.length >= 10) {
    strengths.push(`Excellent match - ${matched.length} required skills present`);
  } else if (matched.length >= 7) {
    strengths.push(`Strong match - ${matched.length} core skills align`);
  } else if (matched.length >= 4) {
    strengths.push(`Good foundation with ${matched.length} matching skills`);
  } else if (matched.length > 0) {
    strengths.push(`${matched.length} skill(s) match the role requirements`);
  }

  const bonus = allSkills.length - matched.length;
  if (bonus > 10) {
    strengths.push(`Additional ${bonus} advanced skills beyond requirements`);
  } else if (bonus > 5) {
    strengths.push(`${bonus} bonus skills not required`);
  }

  if (resume.includes('lead') || resume.includes('senior') || resume.includes('architect')) {
    strengths.push('Leadership and architecture experience');
  }

  if ((resume.includes('built') || resume.includes('developed') || resume.includes('created')) &&
      (resume.includes('team') || resume.includes('project'))) {
    strengths.push('Proven ability to deliver projects with teams');
  }

  if (resume.includes('certification') || resume.includes('certified')) {
    strengths.push('Professional certifications');
  }

  return strengths.length > 0 ? strengths : ['Candidate profile analyzed'];
}

function buildRecommendations(missing: string[], percentage: number): string[] {
  const recs: string[] = [];

  if (percentage >= 90) {
    recs.push('Highly qualified - apply immediately');
  } else if (percentage >= 80) {
    recs.push('Excellent fit for the role');
  } else if (percentage >= 70) {
    recs.push('Strong candidate - highlight key strengths');
  } else if (percentage >= 50) {
    recs.push('Moderate fit - emphasize transferable skills');
  } else if (percentage >= 30) {
    recs.push('Build experience in required areas');
  } else {
    recs.push('Significant skill development recommended');
  }

  if (missing.length > 0 && missing.length <= 2) {
    recs.push(`Learn: ${missing.join(', ')}`);
  } else if (missing.length > 2 && missing.length <= 5) {
    recs.push(`Focus on: ${missing.slice(0, 3).join(', ')}`);
  }

  return recs;
}

function buildSummary(percentage: number, matched: number, total: number): string {
  if (percentage >= 90) {
    return `Outstanding match! ${matched}/${total} required skills found. Highly qualified candidate.`;
  } else if (percentage >= 80) {
    return `Excellent match - ${matched}/${total} skills align. Only ${total - matched} minor gap(s).`;
  } else if (percentage >= 70) {
    return `Strong match - ${matched} of ${total} requirements met. Good fit with room to grow.`;
  } else if (percentage >= 50) {
    return `Good potential - ${matched}/${total} skills present. Build experience in ${total - matched} area(s).`;
  } else if (percentage >= 30) {
    return `Moderate alignment - ${matched} matching skill(s). Significant development needed in ${total - matched} area(s).`;
  } else if (percentage > 0) {
    return `Limited match - ${matched} skill(s) align. Consider focused skill development before applying.`;
  } else {
    return 'Limited skill alignment. Resume and requirements need better alignment.';
  }
}

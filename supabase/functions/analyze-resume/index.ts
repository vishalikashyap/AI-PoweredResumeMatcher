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

const SKILL_DATABASE = {
  frontend: [
    'angular', 'react', 'vue', 'svelte', 'next.js', 'nextjs', 'nuxt', 'ember',
    'html', 'css', 'javascript', 'typescript', 'jsx', 'tsx',
    'responsive design', 'material design', 'bootstrap', 'tailwind', 'sass', 'scss', 'less',
    'webpack', 'vite', 'parcel', 'rollup', 'gulp', 'grunt',
    'redux', 'mobx', 'zustand', 'recoil', 'context api', 'vuex', 'pinia',
    'rxjs', 'observables', 'promises', 'async/await'
  ],
  backend: [
    'node.js', 'nodejs', 'express', 'nest.js', 'nestjs', 'fastify', 'koa',
    'python', 'django', 'flask', 'fastapi', 'celery',
    'java', 'spring', 'spring boot', 'maven', 'gradle',
    'c#', 'csharp', '.net', 'asp.net', 'entity framework',
    'ruby', 'rails', 'sinatra',
    'go', 'rust', 'php', 'laravel', 'symfony',
    'rest api', 'graphql', 'grpc', 'websockets', 'socket.io'
  ],
  database: [
    'sql', 'mysql', 'postgresql', 'oracle', 'mssql', 'sqlite',
    'mongodb', 'nosql', 'firebase', 'firestore', 'dynamodb',
    'supabase', 'redis', 'elasticsearch', 'cassandra', 'couchdb',
    'database design', 'orm', 'sql queries', 'indexing', 'normalization'
  ],
  devops: [
    'docker', 'kubernetes', 'k8s', 'containerization',
    'aws', 'azure', 'gcp', 'google cloud', 'heroku',
    'ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci', 'circleci',
    'terraform', 'ansible', 'cloudformation',
    'linux', 'bash', 'shell scripting', 'git', 'github', 'gitlab',
    'monitoring', 'logging', 'prometheus', 'grafana', 'elk'
  ],
  testing: [
    'testing', 'unit testing', 'integration testing', 'e2e testing',
    'jest', 'mocha', 'jasmine', 'vitest', 'playwright',
    'cypress', 'selenium', 'puppeteer', 'testcafe',
    'junit', 'pytest', 'unittest', 'rspec',
    'tdd', 'bdd', 'test coverage'
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket',
    'jira', 'confluence', 'slack', 'asana', 'trello',
    'vscode', 'sublime', 'intellij', 'webstorm',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'postman', 'insomnia', 'swagger', 'api documentation'
  ],
  softSkills: [
    'leadership', 'communication', 'teamwork', 'collaboration',
    'problem solving', 'critical thinking', 'analytical',
    'project management', 'agile', 'scrum', 'kanban',
    'time management', 'attention to detail', 'mentoring',
    'negotiation', 'stakeholder management', 'presentation'
  ]
};

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

    const analysis = analyzeResume(resumeText, jobDescription);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Analysis failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function analyzeResume(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeLower = resumeText.toLowerCase();
  const jobDescLower = jobDescription.toLowerCase();

  const jobSkills = extractAllSkills(jobDescLower);
  const resumeSkills = extractAllSkills(resumeLower);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jobSkills.forEach((skill) => {
    if (resumeSkills.includes(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const matchPercentage = jobSkills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 0;

  const strengths = identifyStrengths(resumeLower, matchedSkills, resumeSkills);
  const recommendations = generateRecommendations(missingSkills, matchPercentage);
  const summary = generateSummary(matchPercentage, matchedSkills.length, missingSkills.length);

  return {
    matchPercentage,
    matchedSkills: Array.from(new Set(matchedSkills)),
    missingSkills: Array.from(new Set(missingSkills)),
    strengths,
    recommendations,
    summary,
  };
}

function extractAllSkills(text: string): string[] {
  const skills = new Set<string>();

  const allSkills = Object.values(SKILL_DATABASE).flat();

  for (const skill of allSkills) {
    const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (skillRegex.test(text)) {
      skills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  const lines = text.split(/[\n\r]+/);
  for (const line of lines) {
    const skillTokens = parseLineForSkills(line);
    skillTokens.forEach(token => skills.add(token));
  }

  return Array.from(skills);
}

function parseLineForSkills(line: string): string[] {
  const skills: string[] = [];
  const phrases = line.split(/[,;:|]/);

  for (const phrase of phrases) {
    const trimmed = phrase.trim();

    if (trimmed.length > 2 && trimmed.length < 50) {
      const words = trimmed.split(/\s+/).filter(w => w.length > 2);

      if (words.length <= 3) {
        const candidate = words.join(' ');
        if (/^[a-zA-Z0-9.+#()/\-*&]+$/.test(candidate) && !isCommonWord(candidate)) {
          const capitalized = candidate.split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          skills.push(capitalized);
        }
      }
    }
  }

  return skills;
}

function isCommonWord(word: string): boolean {
  const commonWords = [
    'the', 'and', 'or', 'if', 'is', 'are', 'was', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'with', 'from', 'for', 'by', 'to', 'of', 'in', 'on', 'at',
    'required', 'must', 'should', 'nice', 'good', 'strong', 'excellent',
    'skills', 'experience', 'knowledge', 'proficiency', 'understanding'
  ];
  return commonWords.includes(word.toLowerCase());
}

function identifyStrengths(resumeText: string, matchedSkills: string[], resumeSkills: string[]): string[] {
  const strengths: string[] = [];

  if (matchedSkills.length >= 10) {
    strengths.push(`Outstanding match with ${matchedSkills.length} required skills`);
  } else if (matchedSkills.length >= 6) {
    strengths.push(`Strong match with ${matchedSkills.length} required skills`);
  } else if (matchedSkills.length >= 3) {
    strengths.push(`Good match with ${matchedSkills.length} required skills`);
  }

  const extraSkills = resumeSkills.length - matchedSkills.length;
  if (extraSkills > 0) {
    strengths.push(`Additional ${extraSkills} bonus skills not required`);
  }

  if (resumeText.includes('lead') || resumeText.includes('senior') || resumeText.includes('manager') || resumeText.includes('director')) {
    strengths.push('Leadership and senior-level experience demonstrated');
  }

  if ((resumeText.includes('project') || resumeText.includes('developed') || resumeText.includes('built')) && (resumeText.includes('team') || resumeText.includes('collaborated'))) {
    strengths.push('Proven team collaboration on successful projects');
  }

  if (resumeText.includes('bachelor') || resumeText.includes('master') || resumeText.includes('phd') || resumeText.includes('degree')) {
    strengths.push('Strong academic qualifications');
  }

  if (resumeText.includes('years') || resumeText.includes('experience')) {
    const experienceMatch = resumeText.match(/(\d+)\+?\s+years/);
    if (experienceMatch) {
      strengths.push(`${experienceMatch[1]}+ years of professional experience`);
    }
  }

  if (resumeText.includes('certification') || resumeText.includes('certified') || resumeText.includes('award')) {
    strengths.push('Professional certifications and achievements');
  }

  return strengths.length > 0 ? strengths : ['Relevant skills and experience present'];
}

function generateRecommendations(missingSkills: string[], matchPercentage: number): string[] {
  const recommendations: string[] = [];

  if (matchPercentage >= 90) {
    recommendations.push('Perfect fit - your profile strongly aligns with the role requirements');
  } else if (matchPercentage >= 80) {
    recommendations.push('Excellent candidate - highlight your matching expertise prominently');
  } else if (matchPercentage >= 60) {
    recommendations.push('Good alignment - emphasize your strongest matching skills in cover letter');
  } else if (matchPercentage >= 40) {
    recommendations.push('Moderate fit - focus on transferable skills and learning ability');
  } else {
    recommendations.push('Consider gaining more experience in the core requirements before applying');
  }

  if (missingSkills.length > 0 && missingSkills.length <= 3) {
    const missing = missingSkills.slice(0, 3).map(s => s.toLowerCase()).join(', ');
    recommendations.push(`Priority areas: ${missing}`);
  } else if (missingSkills.length > 3) {
    const missing = missingSkills.slice(0, 2).map(s => s.toLowerCase()).join(', ');
    recommendations.push(`Top priority skills to develop: ${missing}`);
  }

  if (matchPercentage < 50) {
    recommendations.push('Pursue training or certifications in key missing areas');
  }

  return recommendations.length > 0 ? recommendations : ['Continue building relevant experience'];
}

function generateSummary(matchPercentage: number, matched: number, missing: number): string {
  if (matchPercentage >= 90) {
    return `Perfect match! Your resume demonstrates ${matched} of the required skills. You are highly qualified for this role.`;
  } else if (matchPercentage >= 80) {
    return `Excellent match with ${matched} matching skills. Only ${missing} skill(s) to potentially develop.`;
  } else if (matchPercentage >= 70) {
    return `Strong match with ${matched} relevant skills. Address ${missing} skill gap(s) to be fully qualified.`;
  } else if (matchPercentage >= 50) {
    return `Good match with ${matched} relevant skills. Develop ${missing} additional areas for better fit.`;
  } else if (matchPercentage >= 30) {
    return `Moderate match with ${matched} relevant skills. ${missing} key areas need significant development.`;
  } else {
    return `Limited match with ${matched} relevant skills. Substantial experience needed in ${missing} core requirement(s).`;
  }
}

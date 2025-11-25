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

  const skillKeywords = extractKeywords(jobDescLower);
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  skillKeywords.forEach((skill) => {
    if (resumeLower.includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const matchPercentage = skillKeywords.length > 0
    ? Math.round((matchedSkills.length / skillKeywords.length) * 100)
    : 0;

  const strengths = identifyStrengths(resumeLower, matchedSkills);
  const recommendations = generateRecommendations(missingSkills, matchPercentage);
  const summary = generateSummary(matchPercentage, matchedSkills.length, missingSkills.length);

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    strengths,
    recommendations,
    summary,
  };
}

function extractKeywords(text: string): string[] {
  const commonSkills = [
    'angular', 'react', 'vue', 'javascript', 'typescript', 'html', 'css',
    'node.js', 'python', 'java', 'c++', 'c#', 'sql', 'mongodb', 'postgresql',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
    'rest api', 'graphql', 'redux', 'rxjs', 'webpack', 'ci/cd',
    'microservices', 'testing', 'junit', 'jest', 'cypress', 'selenium',
    'ux/ui', 'figma', 'responsive design', 'sass', 'tailwind',
    'machine learning', 'ai', 'data structures', 'algorithms',
    'leadership', 'communication', 'problem solving', 'teamwork'
  ];

  const foundSkills = commonSkills.filter(skill => text.includes(skill));

  const words = text.split(/\s+/);
  const technicalTerms = words.filter(word => {
    return word.length > 3 &&
           /^[a-z0-9.#+/-]+$/.test(word) &&
           !['the', 'and', 'with', 'for', 'this', 'that', 'have', 'from', 'will', 'your'].includes(word);
  });

  const uniqueSkills = [...new Set([...foundSkills, ...technicalTerms.slice(0, 10)])];
  return uniqueSkills.slice(0, 20);
}

function identifyStrengths(resumeText: string, matchedSkills: string[]): string[] {
  const strengths: string[] = [];

  if (matchedSkills.length > 5) {
    strengths.push(`Strong technical skill set with ${matchedSkills.length} matching competencies`);
  }

  if (resumeText.includes('lead') || resumeText.includes('senior') || resumeText.includes('manager')) {
    strengths.push('Demonstrates leadership and senior-level experience');
  }

  if (resumeText.includes('project') && resumeText.includes('team')) {
    strengths.push('Experience with team collaboration and project delivery');
  }

  if (resumeText.includes('bachelor') || resumeText.includes('master') || resumeText.includes('phd')) {
    strengths.push('Relevant educational background');
  }

  return strengths.length > 0 ? strengths : ['Candidate shows relevant experience in the field'];
}

function generateRecommendations(missingSkills: string[], matchPercentage: number): string[] {
  const recommendations: string[] = [];

  if (matchPercentage < 50) {
    recommendations.push('Consider gaining more experience in the core requirements of this role');
  }

  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3).join(', ');
    recommendations.push(`Focus on developing skills in: ${topMissing}`);
  }

  if (matchPercentage >= 70) {
    recommendations.push('Strong candidate - consider highlighting specific project achievements');
  }

  if (missingSkills.some(s => ['leadership', 'communication', 'teamwork'].includes(s))) {
    recommendations.push('Emphasize soft skills and team collaboration experiences');
  }

  return recommendations.length > 0
    ? recommendations
    : ['Continue building relevant experience and update resume with recent projects'];
}

function generateSummary(matchPercentage: number, matched: number, missing: number): string {
  if (matchPercentage >= 80) {
    return `Excellent match! The resume demonstrates ${matched} key qualifications with only ${missing} areas for potential growth.`;
  } else if (matchPercentage >= 60) {
    return `Good match with ${matched} relevant qualifications. ${missing} additional skills could strengthen the application.`;
  } else if (matchPercentage >= 40) {
    return `Moderate match with ${matched} relevant qualifications. Consider developing ${missing} additional areas to better align with the role.`;
  } else {
    return `The resume shows ${matched} relevant qualifications. Significant development needed in ${missing} key areas to match the job requirements.`;
  }
}

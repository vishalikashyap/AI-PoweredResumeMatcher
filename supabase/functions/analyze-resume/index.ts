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

  const skillKeywords = extractSkillsFromJobDescription(jobDescLower);
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  skillKeywords.forEach((skill) => {
    const skillLower = skill.toLowerCase().trim();
    if (resumeLower.includes(skillLower)) {
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

function extractSkillsFromJobDescription(jobDesc: string): string[] {
  const skills: string[] = [];

  const commonSkillPatterns = [
    'angular', 'react', 'vue', 'javascript', 'typescript', 'html', 'css',
    'node.js', 'nodejs', 'python', 'java', 'c++', 'c#', 'csharp', 'sql', 'mongodb', 'postgresql',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
    'rest api', 'graphql', 'redux', 'rxjs', 'webpack', 'ci/cd', 'cicd',
    'microservices', 'testing', 'junit', 'jest', 'cypress', 'selenium',
    'ux/ui', 'ui/ux', 'figma', 'responsive design', 'sass', 'tailwind',
    'machine learning', 'artificial intelligence', 'ai', 'data structures', 'algorithms',
    'leadership', 'communication', 'problem solving', 'teamwork', 'collaboration',
    'firebase', 'supabase', 'mysql', 'mysql', 'rest', 'api', 'web development',
    'mobile development', 'ios', 'android', 'react native', 'flutter',
    'oops', 'oop', 'design patterns', 'mvc', 'mvvm'
  ];

  for (const skill of commonSkillPatterns) {
    if (jobDesc.includes(skill)) {
      const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
      skills.push(capitalizedSkill);
    }
  }

  const lines = jobDesc.split(/[\n\r]+/);
  for (const line of lines) {
    const parts = line.split(/[:;,]/);
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      if (part.length > 2 && part.length < 50) {
        const keywords = part.split(/\s+/);
        const validKeyword = keywords
          .filter(kw => kw.length > 2 && kw.length < 30 && /^[a-zA-Z0-9.+#/\-()]+$/.test(kw))
          .join(' ');

        if (validKeyword && validKeyword.length > 2 && validKeyword.length < 40) {
          const capitalizedKeyword = validKeyword.charAt(0).toUpperCase() + validKeyword.slice(1);
          if (!skills.includes(capitalizedKeyword) && !commonSkillPatterns.includes(capitalizedKeyword.toLowerCase())) {
            skills.push(capitalizedKeyword);
          }
        }
      }
    }
  }

  const uniqueSkills = [...new Set(skills)];
  return uniqueSkills.slice(0, 25);
}

function identifyStrengths(resumeText: string, matchedSkills: string[]): string[] {
  const strengths: string[] = [];

  if (matchedSkills.length > 5) {
    strengths.push(`Strong match with ${matchedSkills.length} key requirements`);
  } else if (matchedSkills.length > 0) {
    strengths.push(`Demonstrates ${matchedSkills.length} required skills`);
  }

  if (resumeText.includes('lead') || resumeText.includes('senior') || resumeText.includes('manager')) {
    strengths.push('Demonstrates leadership and senior-level experience');
  }

  if (resumeText.includes('project') && resumeText.includes('team')) {
    strengths.push('Proven experience with team collaboration and project delivery');
  }

  if (resumeText.includes('bachelor') || resumeText.includes('master') || resumeText.includes('phd')) {
    strengths.push('Strong educational background');
  }

  if (resumeText.includes('years') || resumeText.includes('experience')) {
    strengths.push('Relevant professional experience');
  }

  return strengths.length > 0 ? strengths : ['Review resume for relevant qualifications'];
}

function generateRecommendations(missingSkills: string[], matchPercentage: number): string[] {
  const recommendations: string[] = [];

  if (matchPercentage >= 80) {
    recommendations.push('Excellent fit - highlight your matching expertise in your application');
  } else if (matchPercentage >= 60) {
    recommendations.push('Good match - consider emphasizing your strongest matching skills');
  } else if (matchPercentage < 50) {
    recommendations.push('Consider developing more of the required skills');
  }

  if (missingSkills.length > 0 && missingSkills.length <= 3) {
    const topMissing = missingSkills.slice(0, 3).join(', ');
    recommendations.push(`Focus on: ${topMissing}`);
  } else if (missingSkills.length > 3) {
    const topMissing = missingSkills.slice(0, 2).join(', ');
    recommendations.push(`Priority skills to develop: ${topMissing}`);
  }

  if (matchPercentage < 40) {
    recommendations.push('Consider additional training or courses to meet job requirements');
  }

  return recommendations.length > 0
    ? recommendations
    : ['Ensure resume includes all relevant experience and certifications'];
}

function generateSummary(matchPercentage: number, matched: number, missing: number): string {
  if (matchPercentage >= 80) {
    return `Excellent match! Your resume shows ${matched} key qualifications required for this role.`;
  } else if (matchPercentage >= 60) {
    return `Good match with ${matched} relevant qualifications. Develop ${missing} additional skills to strengthen your candidacy.`;
  } else if (matchPercentage >= 40) {
    return `Moderate match with ${matched} relevant qualifications. Focus on developing ${missing} key areas.`;
  } else if (matchPercentage >= 20) {
    return `Limited match - ${matched} qualifications match. Significant skill development needed in ${missing} areas.`;
  } else {
    return `Entry-level match. Your resume shows ${matched} matching skills. Consider gaining experience in ${missing} key requirements.`;
  }
}

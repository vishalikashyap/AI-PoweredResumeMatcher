import { Injectable } from '@angular/core';
import { supabase } from '../supabase';

export interface AnalysisResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeAnalyzerService {
  private supabaseUrl = 'https://yvfzvndcsokdppohbuey.supabase.co';
  private supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2Znp2bmRjc29rZHBwb2hidWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTMxNTgsImV4cCI6MjA3OTYyOTE1OH0.rCt3zIgD0-Xpefn_4HWCE4edHvnqBQuZVFT4lw8mhIA';

  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;

        if (typeof result === 'string') {
          const cleanedText = this.extractTextContent(result, file.type);
          resolve(cleanedText);
        } else if (result instanceof ArrayBuffer) {
          const text = this.arrayBufferToString(result);
          const cleanedText = this.extractTextContent(text, file.type);
          resolve(cleanedText);
        } else {
          reject(new Error('Unable to read file content'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (file.type === 'application/pdf' || file.type === 'application/octet-stream') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, 'UTF-8');
      }
    });
  }

  private arrayBufferToString(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let text = '';

    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if (byte >= 32 && byte <= 126) {
        text += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13) {
        text += ' ';
      } else if (byte === 9) {
        text += ' ';
      }
    }

    return text;
  }

  private extractTextContent(text: string, fileType: string): string {
    let cleaned = text;

    cleaned = cleaned.replace(/[^\x20-\x7E\n\r]/g, ' ');

    cleaned = cleaned.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    cleaned = cleaned.replace(/\\s+/g, ' ').trim();

    return cleaned;
  }

  async analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
    try {
      const apiUrl = `${this.supabaseUrl}/functions/v1/analyze-resume`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw error;
    }
  }

  async saveAnalysis(
    jobTitle: string,
    jobDescription: string,
    resumeText: string,
    analysisResult: AnalysisResult
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: jobDesc, error: jobError } = await supabase
        .from('job_descriptions')
        .insert({
          user_id: user.id,
          title: jobTitle,
          description: jobDescription
        })
        .select()
        .single();

      if (jobError) throw jobError;

      const { error: analysisError } = await supabase
        .from('resume_analyses')
        .insert({
          user_id: user.id,
          job_description_id: jobDesc.id,
          resume_text: resumeText,
          match_percentage: analysisResult.matchPercentage,
          analysis_details: analysisResult
        });

      if (analysisError) throw analysisError;
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }
}

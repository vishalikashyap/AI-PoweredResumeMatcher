import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload.component';
import { JobDescriptionFormComponent, JobDescription } from './components/job-description-form.component';
import { AnalysisResultsComponent, AnalysisResult } from './components/analysis-results.component';
import { ResumeAnalyzerService } from './services/resume-analyzer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadComponent,
    JobDescriptionFormComponent,
    AnalysisResultsComponent
  ],
  providers: [ResumeAnalyzerService],
  template: `
    <div class="app-container">
      <header class="header">
        <h1 class="app-title">AI Resume Analyzer</h1>
        <p class="app-subtitle">Upload your resume and job description to get instant match analysis</p>
      </header>

      @if (isLoading) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p>Analyzing resume...</p>
        </div>
      }

      @if (error) {
        <div class="error-message">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{{ error }}</p>
          <button (click)="error = null" class="dismiss-btn">Dismiss</button>
        </div>
      }

      @if (!analysisResult) {
        <div class="main-content">
          <div class="upload-section">
            <h2 class="section-title">Upload Resume</h2>
            <app-file-upload (fileSelected)="onFileSelected($event)"></app-file-upload>
          </div>

          <div class="form-section">
            <app-job-description-form (formSubmit)="onAnalyze($event)"></app-job-description-form>
          </div>
        </div>
      } @else {
        <div class="results-section">
          <button class="new-analysis-btn" (click)="resetAnalysis()">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Analysis
          </button>
          <app-analysis-results [result]="analysisResult"></app-analysis-results>
        </div>
      }

      <footer class="footer">
        <p>Powered by Angular & AI</p>
      </footer>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      padding: 24px;
    }

    .header {
      text-align: center;
      margin-bottom: 48px;
      padding: 32px 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .app-title {
      font-size: 42px;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 12px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .app-subtitle {
      font-size: 18px;
      color: #718096;
      margin: 0;
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    @media (max-width: 968px) {
      .main-content {
        grid-template-columns: 1fr;
      }
    }

    .upload-section,
    .form-section {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .section-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 24px 0;
    }

    .results-section {
      max-width: 1200px;
      margin: 0 auto;
    }

    .new-analysis-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 24px;
      transition: all 0.2s;
    }

    .new-analysis-btn:hover {
      background: #667eea;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-icon {
      width: 20px;
      height: 20px;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      color: white;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      max-width: 600px;
      margin: 0 auto 32px;
      background: #fff5f5;
      border: 1px solid #fc8181;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .error-icon {
      width: 24px;
      height: 24px;
      color: #e53e3e;
      flex-shrink: 0;
    }

    .error-message p {
      flex: 1;
      margin: 0;
      color: #742a2a;
    }

    .dismiss-btn {
      padding: 8px 16px;
      background: #fc8181;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .dismiss-btn:hover {
      background: #f56565;
    }

    .footer {
      text-align: center;
      margin-top: 48px;
      padding: 24px;
      color: #718096;
      font-size: 14px;
    }

    .footer p {
      margin: 0;
    }
  `]
})
export class App {
  selectedFile: File | null = null;
  analysisResult: AnalysisResult | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private analyzerService: ResumeAnalyzerService) {}

  onFileSelected(file: File) {
    this.selectedFile = file;
    this.error = null;
  }

  async onAnalyze(jobDescription: JobDescription) {
    if (!this.selectedFile) {
      this.error = 'Please upload a resume file first';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const resumeText = await this.analyzerService.extractTextFromFile(this.selectedFile);
      const result = await this.analyzerService.analyzeResume(resumeText, jobDescription.description);
      this.analysisResult = result;
    } catch (err) {
      this.error = 'Failed to analyze resume. Please try again.';
      console.error('Analysis error:', err);
    } finally {
      this.isLoading = false;
    }
  }

  resetAnalysis() {
    this.analysisResult = null;
    this.selectedFile = null;
    this.error = null;
  }
}

bootstrapApplication(App);

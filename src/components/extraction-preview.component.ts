import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ExtractionData {
  resumeText: string;
  resumeSkills: string[];
  jobDescriptionText: string;
  jobRequiredSkills: string[];
}

@Component({
  selector: 'app-extraction-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (data) {
      <div class="extraction-container">
        <div class="extraction-section">
          <div class="section-header">
            <h3 class="section-title">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Extracted Resume Text
            </h3>
            <span class="text-length">{{ data.resumeText.length }} characters</span>
          </div>
          <div class="text-preview">
            <p class="preview-text">{{ data.resumeText.substring(0, 500) }}{{ data.resumeText.length > 500 ? '...' : '' }}</p>
          </div>

          <div class="skills-section">
            <h4 class="skills-title">
              <svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Skills Extracted from Resume ({{ data.resumeSkills.length }})
            </h4>
            <div class="skills-list">
              @for (skill of data.resumeSkills; track skill) {
                <span class="skill-tag resume-skill">{{ skill }}</span>
              }
              @if (data.resumeSkills.length === 0) {
                <p class="empty-state">No skills extracted</p>
              }
            </div>
          </div>
        </div>

        <div class="extraction-section">
          <div class="section-header">
            <h3 class="section-title">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Job Description Text
            </h3>
            <span class="text-length">{{ data.jobDescriptionText.length }} characters</span>
          </div>
          <div class="text-preview">
            <p class="preview-text">{{ data.jobDescriptionText.substring(0, 500) }}{{ data.jobDescriptionText.length > 500 ? '...' : '' }}</p>
          </div>

          <div class="skills-section">
            <h4 class="skills-title">
              <svg class="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Required Skills from Job Description ({{ data.jobRequiredSkills.length }})
            </h4>
            <div class="skills-list">
              @for (skill of data.jobRequiredSkills; track skill) {
                <span class="skill-tag jd-skill">{{ skill }}</span>
              }
              @if (data.jobRequiredSkills.length === 0) {
                <p class="empty-state">No skills identified</p>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .extraction-container {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    @media (max-width: 1024px) {
      .extraction-container {
        grid-template-columns: 1fr;
      }
    }

    .extraction-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #edf2f7;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon {
      width: 24px;
      height: 24px;
      color: #667eea;
      flex-shrink: 0;
    }

    .text-length {
      font-size: 12px;
      background: #edf2f7;
      color: #4a5568;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 500;
    }

    .text-preview {
      background: #f7fafc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      border-left: 4px solid #667eea;
      max-height: 200px;
      overflow-y: auto;
    }

    .preview-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #4a5568;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .skills-section {
      background: #f0f4ff;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #667eea;
    }

    .skills-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .mini-icon {
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      display: inline-block;
      white-space: nowrap;
    }

    .skill-tag.resume-skill {
      background: #c6f6d5;
      color: #22543d;
      border: 1px solid #9ae6b4;
    }

    .skill-tag.jd-skill {
      background: #bee3f8;
      color: #2c5282;
      border: 1px solid #90cdf4;
    }

    .empty-state {
      color: #a0aec0;
      font-style: italic;
      margin: 0;
      font-size: 13px;
    }
  `]
})
export class ExtractionPreviewComponent {
  @Input() data: ExtractionData | null = null;
}

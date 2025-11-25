import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AnalysisResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

@Component({
  selector: 'app-analysis-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (result) {
      <div class="results-container">
        <div class="match-score-card">
          <div class="score-circle" [class.high]="result.matchPercentage >= 70"
                                     [class.medium]="result.matchPercentage >= 40 && result.matchPercentage < 70"
                                     [class.low]="result.matchPercentage < 40">
            <span class="score-value">{{ result.matchPercentage }}%</span>
          </div>
          <h2 class="score-title">Match Score</h2>
          <p class="score-description">{{ result.summary }}</p>
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <h3 class="card-title">
              <svg class="icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Matched Skills ({{ result.matchedSkills.length }})
            </h3>
            <div class="skills-list">
              @for (skill of result.matchedSkills; track skill) {
                <span class="skill-tag matched">{{ skill }}</span>
              }
              @if (result.matchedSkills.length === 0) {
                <p class="empty-state">No matching skills found</p>
              }
            </div>
          </div>

          <div class="detail-card">
            <h3 class="card-title">
              <svg class="icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Missing Skills ({{ result.missingSkills.length }})
            </h3>
            <div class="skills-list">
              @for (skill of result.missingSkills; track skill) {
                <span class="skill-tag missing">{{ skill }}</span>
              }
              @if (result.missingSkills.length === 0) {
                <p class="empty-state">All required skills are present!</p>
              }
            </div>
          </div>

          <div class="detail-card">
            <h3 class="card-title">
              <svg class="icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Strengths
            </h3>
            <ul class="list">
              @for (strength of result.strengths; track strength) {
                <li>{{ strength }}</li>
              }
            </ul>
          </div>

          <div class="detail-card">
            <h3 class="card-title">
              <svg class="icon recommendation" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommendations
            </h3>
            <ul class="list">
              @for (rec of result.recommendations; track rec) {
                <li>{{ rec }}</li>
              }
            </ul>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .results-container {
      width: 100%;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .match-score-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      color: white;
      margin-bottom: 32px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .score-circle {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      background: rgba(255, 255, 255, 0.2);
      border: 8px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
    }

    .score-circle.high {
      border-color: #48bb78;
      background: rgba(72, 187, 120, 0.2);
    }

    .score-circle.medium {
      border-color: #ed8936;
      background: rgba(237, 137, 54, 0.2);
    }

    .score-circle.low {
      border-color: #f56565;
      background: rgba(245, 101, 101, 0.2);
    }

    .score-value {
      font-size: 48px;
      font-weight: 700;
    }

    .score-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }

    .score-description {
      font-size: 16px;
      line-height: 1.6;
      opacity: 0.95;
      max-width: 600px;
      margin: 0 auto;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .detail-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
    }

    .detail-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .icon.success {
      color: #48bb78;
    }

    .icon.warning {
      color: #ed8936;
    }

    .icon.info {
      color: #4299e1;
    }

    .icon.recommendation {
      color: #9f7aea;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      display: inline-block;
    }

    .skill-tag.matched {
      background: #c6f6d5;
      color: #22543d;
    }

    .skill-tag.missing {
      background: #fed7d7;
      color: #742a2a;
    }

    .list {
      margin: 0;
      padding-left: 20px;
      color: #4a5568;
    }

    .list li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .empty-state {
      color: #a0aec0;
      font-style: italic;
      margin: 0;
    }
  `]
})
export class AnalysisResultsComponent {
  @Input() result: AnalysisResult | null = null;
}

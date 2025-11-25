import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface JobDescription {
  title: string;
  description: string;
}

@Component({
  selector: 'app-job-description-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container">
      <h2 class="form-title">Job Description</h2>

      <div class="form-group">
        <label for="title">Job Title</label>
        <input
          id="title"
          type="text"
          [(ngModel)]="jobDescription.title"
          placeholder="e.g., Senior Angular Developer"
          class="form-input">
      </div>

      <div class="form-group">
        <label for="description">Key Requirements & Skills</label>
        <textarea
          id="description"
          [(ngModel)]="jobDescription.description"
          placeholder="Enter the key requirements, skills, qualifications, and experience needed for this position..."
          rows="12"
          class="form-textarea"></textarea>
        <p class="hint">Include technical skills, years of experience, education requirements, and any other criteria you want to match against.</p>
      </div>

      <button
        class="submit-btn"
        [disabled]="!isValid()"
        (click)="onSubmit()">
        Analyze Resume
      </button>
    </div>
  `,
  styles: [`
    .form-container {
      width: 100%;
    }

    .form-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a202c;
      margin: 0 0 24px 0;
    }

    .form-group {
      margin-bottom: 24px;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #2d3748;
      margin-bottom: 8px;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #cbd5e0;
      border-radius: 8px;
      font-size: 15px;
      color: #2d3748;
      transition: all 0.2s;
      font-family: inherit;
      box-sizing: border-box;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 200px;
    }

    .hint {
      font-size: 13px;
      color: #718096;
      margin: 8px 0 0 0;
    }

    .submit-btn {
      width: 100%;
      padding: 14px 24px;
      background: #4299e1;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      background: #3182ce;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
    }

    .submit-btn:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class JobDescriptionFormComponent {
  @Output() formSubmit = new EventEmitter<JobDescription>();

  jobDescription: JobDescription = {
    title: '',
    description: ''
  };

  isValid(): boolean {
    return this.jobDescription.title.trim().length > 0 &&
           this.jobDescription.description.trim().length > 0;
  }

  onSubmit() {
    if (this.isValid()) {
      this.formSubmit.emit({ ...this.jobDescription });
    }
  }
}

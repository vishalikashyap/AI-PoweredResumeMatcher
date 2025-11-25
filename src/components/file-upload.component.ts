import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div
        class="dropzone"
        [class.dragover]="isDragging"
        (drop)="onDrop($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (click)="fileInput.click()">
        <input
          #fileInput
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          (change)="onFileSelected($event)"
          style="display: none">

        <div class="upload-content">
          <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>

          @if (selectedFile) {
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          } @else {
            <p class="upload-text">Drop your resume here or click to browse</p>
            <p class="upload-hint">Supports PDF, DOC, DOCX, TXT</p>
          }
        </div>
      </div>

      @if (selectedFile) {
        <button class="clear-btn" (click)="clearFile($event)">
          Clear File
        </button>
      }
    </div>
  `,
  styles: [`
    .upload-container {
      width: 100%;
    }

    .dropzone {
      border: 2px dashed #cbd5e0;
      border-radius: 12px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f7fafc;
    }

    .dropzone:hover {
      border-color: #4299e1;
      background: #edf2f7;
    }

    .dropzone.dragover {
      border-color: #4299e1;
      background: #e6f2ff;
      transform: scale(1.02);
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .upload-icon {
      width: 48px;
      height: 48px;
      color: #4299e1;
    }

    .upload-text {
      font-size: 16px;
      font-weight: 500;
      color: #2d3748;
      margin: 0;
    }

    .upload-hint {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }

    .file-name {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .file-size {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }

    .clear-btn {
      margin-top: 16px;
      padding: 10px 24px;
      background: #fc8181;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .clear-btn:hover {
      background: #f56565;
    }
  `]
})
export class FileUploadComponent {
  @Output() fileSelected = new EventEmitter<File>();

  selectedFile: File | null = null;
  isDragging = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    const allowedTypes = ['application/pdf', 'application/msword',
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'text/plain'];

    if (allowedTypes.includes(file.type)) {
      this.selectedFile = file;
      this.fileSelected.emit(file);
    } else {
      alert('Please upload a valid resume file (PDF, DOC, DOCX, or TXT)');
    }
  }

  clearFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.fileSelected.emit(undefined as any);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

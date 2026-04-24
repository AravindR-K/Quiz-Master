import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-hr-create-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-quiz.html',
  styleUrl: './create-quiz.css'
})
export class HRCreateQuizComponent {
  title = '';
  timer = 30;
  category = '';
  difficulty = 'medium';
  selectedFile: File | null = null;
  fileName = signal('');

  loading = signal(false);
  success = signal('');
  error = signal('');

  constructor(private quizService: QuizService, private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName.set(this.selectedFile.name);
    }
  }

  onSubmit(): void {
    if (!this.title.trim()) { this.error.set('Please enter a quiz title'); return; }
    if (!this.timer || this.timer < 1) { this.error.set('Timer must be at least 1 minute'); return; }
    if (!this.selectedFile) { this.error.set('Please upload an Excel file'); return; }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('timer', this.timer.toString());
    formData.append('questionsFile', this.selectedFile);
    if (this.category) formData.append('category', this.category);
    if (this.difficulty) formData.append('difficulty', this.difficulty);

    this.quizService.createHRQuiz(formData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(`Quiz "${res.quiz.title}" created with ${res.quiz.totalQuestions} questions!`);
        setTimeout(() => this.router.navigate(['/hr/quizzes']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to create quiz');
      }
    });
  }
}

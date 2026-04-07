import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-generate-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './generate-quiz.html',
  styleUrl: './generate-quiz.css'
})
export class GenerateQuizComponent implements OnInit {
  title = '';
  timer = 30;
  selectedFile: File | null = null;
  fileName = signal<string>('');
  
  loading = signal<boolean>(false);
  success = signal<string>('');
  error = signal<string>('');

  quizzes = signal<any[]>([]);
  loadingQuizzes = signal<boolean>(true);

  constructor(public authService: AuthService, private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getAdminQuizzes().subscribe({
      next: (res) => {
        this.quizzes.set(res.quizzes);
        this.loadingQuizzes.set(false);
      },
      error: () => this.loadingQuizzes.set(false)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName.set(this.selectedFile.name);
    }
  }

  onSubmit(): void {
    if (!this.title.trim()) {
      this.error.set('Please enter a quiz title');
      return;
    }
    if (!this.timer || this.timer < 1) {
      this.error.set('Timer must be at least 1 minute');
      return;
    }
    if (!this.selectedFile) {
      this.error.set('Please upload an Excel file');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('timer', this.timer.toString());
    formData.append('questionsFile', this.selectedFile);

    this.quizService.createQuiz(formData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(`Quiz "${res.quiz.title}" created with ${res.quiz.totalQuestions} questions!`);
        this.title = '';
        this.timer = 30;
        this.selectedFile = null;
        this.fileName.set('');
        this.loadQuizzes();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to create quiz');
      }
    });
  }

  deleteQuiz(quizId: string): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(quizId).subscribe({
        next: () => this.loadQuizzes(),
        error: (err) => this.error.set(err.error?.message || 'Failed to delete quiz')
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

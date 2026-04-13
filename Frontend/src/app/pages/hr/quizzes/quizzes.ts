import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-hr-quizzes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quizzes.html',
  styleUrl: './quizzes.css'
})
export class HRQuizzesComponent implements OnInit {
  quizzes = signal<any[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getHRQuizzes().subscribe({
      next: (res) => { this.quizzes.set(res.quizzes); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  deleteQuiz(quizId: string): void {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    this.quizService.deleteHRQuiz(quizId).subscribe({
      next: () => this.loadQuizzes(),
      error: (err) => this.error.set(err.error?.message || 'Cannot delete quiz')
    });
  }
}

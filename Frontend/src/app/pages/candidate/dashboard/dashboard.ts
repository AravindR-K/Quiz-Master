import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class CandidateDashboardComponent implements OnInit {
  quizzes = signal<any[]>([]);
  loading = signal(true);

  constructor(public authService: AuthService, private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getAvailableQuizzes().subscribe({
      next: (res) => {
        this.quizzes.set(res.quizzes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './results.html',
  styleUrl: './results.css'
})
export class StudentResultsComponent implements OnInit {
  quizInfo = signal<any>(null);
  score = signal<number>(0);
  totalMarks = signal<number>(0);
  percentage = signal<number>(0);
  timeTaken = signal<number>(0);
  submittedAt = signal<string>('');
  detailedResults = signal<any[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const submissionId = this.route.snapshot.params['submissionId'];
    this.loadResults(submissionId);
  }

  loadResults(id: string): void {
    this.quizService.getResultDetails(id).subscribe({
      next: (res) => {
        this.quizInfo.set(res.quiz);
        this.score.set(res.score);
        this.totalMarks.set(res.totalMarks);
        this.percentage.set(res.percentage);
        this.timeTaken.set(res.timeTaken);
        this.submittedAt.set(res.submittedAt);
        this.detailedResults.set(res.detailedResults);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  logout(): void {
    this.authService.logout();
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-history.html',
  styleUrl: './user-history.css'
})
export class UserHistoryComponent implements OnInit {
  userId = '';
  user = signal<any>(null);
  submissions = signal<any[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['userId'];
    this.loadHistory();
  }

  loadHistory(): void {
    this.quizService.getUserHistory(this.userId).subscribe({
      next: (res) => {
        this.user.set(res.user);
        this.submissions.set(res.submissions);
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

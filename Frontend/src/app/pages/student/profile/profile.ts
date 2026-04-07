import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class StudentProfileComponent implements OnInit {
  user = signal<any>(null);
  submissions = signal<any[]>([]);
  loading = signal<boolean>(true);

  constructor(public authService: AuthService, private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.quizService.getStudentProfile().subscribe({
      next: (res) => {
        this.user.set(res.user);
        this.submissions.set(res.submissions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get avgScore(): number {
    const subs = this.submissions();
    if (subs.length === 0) return 0;
    const total = subs.reduce((sum: number, s: any) => sum + s.percentage, 0);
    return Math.round(total / subs.length);
  }

  get bestScore(): number {
    const subs = this.submissions();
    if (subs.length === 0) return 0;
    return Math.max(...subs.map((s: any) => s.percentage));
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

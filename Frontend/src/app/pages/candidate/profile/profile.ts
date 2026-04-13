import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class CandidateProfileComponent implements OnInit {
  user = signal<any>(null);
  submissions = signal<any[]>([]);
  loading = signal(true);

  constructor(public authService: AuthService, private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getCandidateProfile().subscribe({
      next: (res) => {
        this.user.set(res.user);
        this.submissions.set(res.submissions || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get testsTaken(): number { return this.submissions().length; }
  get avgScore(): number {
    const subs = this.submissions();
    if (subs.length === 0) return 0;
    return Math.round(subs.reduce((a, s) => a + s.percentage, 0) / subs.length);
  }
  get bestScore(): number {
    const subs = this.submissions();
    if (subs.length === 0) return 0;
    return Math.max(...subs.map(s => s.percentage));
  }
}

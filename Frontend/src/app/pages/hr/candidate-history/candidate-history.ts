import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-hr-candidate-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './candidate-history.html',
  styleUrl: './candidate-history.css'
})
export class HRCandidateHistoryComponent implements OnInit {
  userId = '';
  user = signal<any>(null);
  submissions = signal<any[]>([]);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['userId'];
    this.quizService.getHRCandidateHistory(this.userId).subscribe({
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
}

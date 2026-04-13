import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-hr-submission-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './submission-detail.html',
  styleUrl: './submission-detail.css'
})
export class HRSubmissionDetailComponent implements OnInit {
  submission = signal<any>(null);
  detailedAnswers = signal<any[]>([]);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['submissionId'];
    this.quizService.getHRSubmissionDetails(id).subscribe({
      next: (res) => {
        this.submission.set(res.submission);
        this.detailedAnswers.set(res.detailedAnswers);
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

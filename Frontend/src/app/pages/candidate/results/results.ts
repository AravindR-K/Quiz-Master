import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-candidate-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './results.html',
  styleUrl: './results.css'
})
export class CandidateResultsComponent implements OnInit {
  quizInfo = signal<any>(null);
  score = signal(0);
  totalMarks = signal(0);
  percentage = signal(0);
  timeTaken = signal(0);
  submittedAt = signal('');
  detailedResults = signal<any[]>([]);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    const submissionId = this.route.snapshot.params['submissionId'];
    this.quizService.getResultDetails(submissionId).subscribe({
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
}

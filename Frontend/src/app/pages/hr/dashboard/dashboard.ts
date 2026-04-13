import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class HRDashboardComponent implements OnInit {
  stats = signal<any>(null);
  loading = signal(true);

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getHRStats().subscribe({
      next: (res) => { this.stats.set(res.stats); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}

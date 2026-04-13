import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<any>(null);
  recentSubmissions = signal<any[]>([]);
  loading = signal(true);

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getAdminStats().subscribe({
      next: (res) => {
        this.stats.set(res.stats);
        this.recentSubmissions.set(res.recentSubmissions || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

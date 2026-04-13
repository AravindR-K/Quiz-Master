import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-hr-candidates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './candidates.html',
  styleUrl: './candidates.css'
})
export class HRCandidatesComponent implements OnInit {
  candidates = signal<any[]>([]);
  loading = signal(true);

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getHRCandidates().subscribe({
      next: (res) => { this.candidates.set(res.candidates || res.users || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}

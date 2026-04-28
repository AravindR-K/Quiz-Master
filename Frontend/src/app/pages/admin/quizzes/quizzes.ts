import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-admin-quizzes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './quizzes.html',
  styleUrl: './quizzes.css'
})
export class AdminQuizzesComponent implements OnInit {
  quizzes = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  
  showEditPopup = signal(false);
  editQuizForm = {
    _id: '',
    title: '',
    timer: 10,
    difficulty: 'medium',
    category: ''
  };
  savingPopup = signal(false);

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading.set(true);
    this.quizService.getAdminQuizzes().subscribe({
      next: (res) => { this.quizzes.set(res.quizzes); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  deleteQuiz(quizId: string): void {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    this.quizService.deleteQuiz(quizId).subscribe({
      next: () => this.loadQuizzes(),
      error: (err) => this.error.set(err.error?.message || 'Cannot delete quiz')
    });
  }

  getDifficultyClass(d: string): string {
    switch (d?.toLowerCase()) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-danger';
      default: return 'badge-primary';
    }
  }

  openEditPopup(quiz: any): void {
    this.editQuizForm = {
      _id: quiz._id,
      title: quiz.title,
      timer: quiz.timer,
      difficulty: quiz.difficulty,
      category: quiz.category
    };
    this.showEditPopup.set(true);
  }

  closeEditPopup(): void {
    this.showEditPopup.set(false);
  }

  saveBasicChanges(): void {
    this.savingPopup.set(true);
    // Don't send questions, only update basic details
    this.quizService.updateQuiz(this.editQuizForm._id, this.editQuizForm).subscribe({
      next: () => {
        this.savingPopup.set(false);
        this.closeEditPopup();
        this.loadQuizzes();
      },
      error: (err) => {
        this.savingPopup.set(false);
        this.error.set(err.error?.message || 'Failed to save changes');
        setTimeout(() => this.error.set(''), 3000);
      }
    });
  }

  editQuestions(): void {
    // Navigate to edit-quiz page with the pending changes in history.state
    this.router.navigate(['/admin/quiz', this.editQuizForm._id, 'edit'], {
      state: {
        quizOverrides: { ...this.editQuizForm }
      }
    });
    this.closeEditPopup();
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);
  loading = signal<boolean>(true);
  showAll = signal<boolean>(true);

  constructor(public authService: AuthService, private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const request = this.showAll() ? this.quizService.getUsers() : this.quizService.getLoggedInUsers();
    request.subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleFilter(showAll: boolean): void {
    this.showAll.set(showAll);
    this.loadUsers();
  }

  logout(): void {
    this.authService.logout();
  }
}

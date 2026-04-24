import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-generate-quiz',
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule],
  templateUrl: './generate-quiz.html',
  styleUrl: './generate-quiz.css',
})

export class GenerateQuiz {
   title = '';
  timer = 30;
  selectedFile: File | null = null;
  fileName = signal<string>('');
  groups = signal<any[]>([]); // Actually used for groups now, let's keep it as string[] if the backend returns strings
  availableUsers: any[] = [];
  filteredUsers: any[] = [];
  assignmentType = signal<string>('all'); // 'all', 'users', 'groups'
  selectedUsers = signal<string[]>([]);
  selectedGroups = signal<string[]>([]);
  userSearchQuery = signal<string>('');
  
  loading = signal<boolean>(false);
  success = signal<string>('');
  error = signal<string>('');

  quizzes = signal<any[]>([]);
  loadingQuizzes = signal<boolean>(true);

  constructor(public authService: AuthService, private quizService: QuizService) { }

  ngOnInit(): void {
    this.loadQuizzes();
    this.fetchUsersAndGroups();
  }

  fetchUsersAndGroups(): void {
    this.quizService.getHRGroups().subscribe({
      next: (res) => {
        this.groups.set(res.groups || []);
      },
      error: () => console.log("Failed to load groups")
    });

    this.quizService.getHRCandidates().subscribe({
      next: (res) => {
        this.availableUsers = res.users || [];
        this.filteredUsers = [...this.availableUsers];
      },
      error: () => console.log("Failed to load users")
    });
  }

  onUserSearch(): void {
    const q = this.userSearchQuery().toLowerCase().trim();
    if (!q) {
      this.filteredUsers = [...this.availableUsers];
    } else {
      this.filteredUsers = this.availableUsers.filter(u => 
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
  }

  toggleUserSelection(userId: string): void {
    const selected = this.selectedUsers();
    if (selected.includes(userId)) {
      this.selectedUsers.set(selected.filter(id => id !== userId));
    } else {
      this.selectedUsers.set([...selected, userId]);
    }
  }

  loadQuizzes(): void {
    this.quizService.getHRQuizzes().subscribe({
      next: (res) => {
        this.quizzes.set(res.quizzes);
        this.loadingQuizzes.set(false);
      },
      error: () => this.loadingQuizzes.set(false)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName.set(this.selectedFile.name);
    }
  }

  onSubmit(): void {
    if (!this.title.trim()) {
      this.error.set('Please enter a quiz title');
      return;
    }
    if (!this.timer || this.timer < 1) {
      this.error.set('Timer must be at least 1 minute');
      return;
    }
    if (!this.selectedFile) {
      this.error.set('Please upload an Excel file');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('timer', this.timer.toString());
    formData.append('questionsFile', this.selectedFile);
    const aType = this.assignmentType();
    if (aType === 'all') {
      formData.append('assignToAll', 'true');
    } else if (aType === 'users') {
      formData.append('assignToAll', 'false');
      formData.append('assignees', JSON.stringify(this.selectedUsers()));
    } else if (aType === 'groups') {
      formData.append('assignToAll', 'false');
      formData.append('assignedGroups', JSON.stringify(this.selectedGroups()));
    }

    this.quizService.createHRQuiz(formData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(`Quiz "${res.quiz.title}" created with ${res.quiz.totalQuestions} questions!`);
        this.title = '';
        this.timer = 30;
        this.selectedFile = null;
        this.fileName.set('');
        this.loadQuizzes();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to create quiz');
      }
    });
  }

  deleteQuiz(quizId: string): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteHRQuiz(quizId).subscribe({
        next: () => this.loadQuizzes(),
        error: (err) => this.error.set(err.error?.message || 'Failed to delete quiz')
      });
    }
  }
  onGroupToggle(groupName: string, event: any): void {
    const selected = this.selectedGroups();

    if (event.target.checked) {
      this.selectedGroups.set([...selected, groupName]);
    } else {
      this.selectedGroups.set(selected.filter(g => g !== groupName));
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

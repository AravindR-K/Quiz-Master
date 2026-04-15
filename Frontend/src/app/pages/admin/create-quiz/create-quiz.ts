import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-create-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-quiz.html',
  styleUrl: './create-quiz.css'
})
export class CreateQuizComponent implements OnInit {
  title = '';
  timer = 30;
  category = '';
  difficulty = 'medium';
  topic = '';
  selectedFile: File | null = null;
  fileName = signal('');

  loading = signal(false);
  success = signal('');
  error = signal('');

  assignmentType = 'all'; // 'all', 'users', 'groups'
  availableUsers: any[] = [];
  filteredUsers: any[] = [];
  availableGroups: string[] = [];
  
  selectedUsers: string[] = [];
  selectedGroups: string[] = [];
  userSearchQuery = '';

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUsersAndGroups();
  }

  fetchUsersAndGroups(): void {
    // Fetch users (candidates)
    this.quizService.getUsers('candidate').subscribe({
      next: (res) => {
        this.availableUsers = res.users || [];
        this.filteredUsers = [...this.availableUsers];
      },
      error: (err) => console.error('Failed to fetch users', err)
    });

    // Fetch groups
    this.quizService.getAdminGroups().subscribe({
      next: (res) => {
        this.availableGroups = res.groups || [];
      },
      error: (err) => console.error('Failed to fetch groups', err)
    });
  }

  onUserSearch(): void {
    if (!this.userSearchQuery.trim()) {
      this.filteredUsers = [...this.availableUsers];
    } else {
      const q = this.userSearchQuery.toLowerCase();
      this.filteredUsers = this.availableUsers.filter(u => 
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
  }

  toggleUserSelection(userId: string): void {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  toggleGroupSelection(group: string): void {
    const index = this.selectedGroups.indexOf(group);
    if (index > -1) {
      this.selectedGroups.splice(index, 1);
    } else {
      this.selectedGroups.push(group);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName.set(this.selectedFile.name);
    }
  }

  onSubmit(): void {
    if (!this.title.trim()) { this.error.set('Please enter a quiz title'); return; }
    if (!this.timer || this.timer < 1) { this.error.set('Timer must be at least 1 minute'); return; }
    if (!this.selectedFile) { this.error.set('Please upload an Excel file'); return; }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('timer', this.timer.toString());
    formData.append('questionsFile', this.selectedFile);
    if (this.category) formData.append('category', this.category);
    if (this.difficulty) formData.append('difficulty', this.difficulty);
    if (this.topic) formData.append('topic', this.topic);

    // Assignment handling
    if (this.assignmentType === 'all') {
      formData.append('assignToAll', 'true');
    } else if (this.assignmentType === 'users') {
      formData.append('assignToAll', 'false');
      formData.append('assignees', JSON.stringify(this.selectedUsers));
    } else if (this.assignmentType === 'groups') {
      formData.append('assignToAll', 'false');
      formData.append('assignedGroups', JSON.stringify(this.selectedGroups));
    }

    this.quizService.createQuiz(formData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(`Quiz "${res.quiz.title}" created with ${res.quiz.totalQuestions} questions!`);
        setTimeout(() => this.router.navigate(['/admin/quizzes']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to create quiz');
      }
    });
  }
}

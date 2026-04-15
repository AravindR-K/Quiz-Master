import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-manage-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-groups.html',
  styleUrl: './manage-groups.css'
})
export class ManageGroupsComponent implements OnInit {
  groups = signal<string[]>([]);
  newGroupName = signal<string>('');
  loading = signal<boolean>(false);
  error = signal<string>('');
  success = signal<string>('');
  loadingGroups = signal<boolean>(true);

  editingGroup = signal<string | null>(null);
  editName = signal<string>('');

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loadingGroups.set(true);
    this.quizService.getGroups().subscribe({
      next: (res) => {
        this.groups.set(res.groups || []);
        this.loadingGroups.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load groups');
        this.loadingGroups.set(false);
      }
    });
  }

  createGroup(): void {
    if (!this.newGroupName().trim()) {
      this.error.set('Group name cannot be blank');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.quizService.createGroup(this.newGroupName()).subscribe({
      next: () => {
        this.success.set('Group created successfully!');
        this.loading.set(false);
        this.newGroupName.set('');
        this.loadGroups();
      },
      error: (err: any) => {
        this.error.set(err.error?.message || 'Failed to create group');
        this.loading.set(false);
      }
    });
  }

  startEdit(name: string): void {
    this.editingGroup.set(name);
    this.editName.set(name);
  }

  cancelEdit(): void {
    this.editingGroup.set(null);
  }

  saveEdit(oldName: string): void {
    const trimmed = this.editName().trim();
    if (!trimmed || trimmed === oldName) {
      this.cancelEdit();
      return;
    }

    this.error.set('');
    this.success.set('');
    this.quizService.updateGroup(oldName, trimmed).subscribe({
      next: () => {
        this.success.set('Group updated successfully!');
        this.cancelEdit();
        this.loadGroups();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update group');
      }
    });
  }

  deleteGroup(name: string): void {
    if (confirm(`Are you sure you want to delete the group "${name}"?\nUsers dynamically mapped to this group will lose group context.`)) {
      this.error.set('');
      this.success.set('');
      this.quizService.deleteGroup(name).subscribe({
        next: () => {
          this.success.set('Group deleted successfully!');
          this.loadGroups();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to delete group');
        }
      });
    }
  }
}

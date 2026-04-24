import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { QuizService } from '../../../services/quiz.service';


@Component({
  selector: 'app-assign-quiz',
  imports: [CommonModule, RouterLink, FormsModule, DragDropModule],
  templateUrl: './assign-quiz.html',
  styleUrl: './assign-quiz.css',
})
export class HRAssignQuizComponent {
  quizId = '';
  quizTitle = signal('');
  quizDifficulty = signal('');
  quizCategory = signal('');

  // Use plain arrays for CDK drag-drop (signals break mutation)
  availableCandidates: any[] = [];
  assignedCandidates: any[] = [];

  loading = signal(true);
  isSaving = signal(false);
  successMessage = signal('');

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('quizId') || '';
    if (this.quizId) {
      this.loadCandidates();
    }
  }

  loadCandidates() {
    this.loading.set(true);
    this.quizService.getHRAssignCandidates(this.quizId).subscribe({
      next: (res) => {
        this.quizTitle.set(res.quizTitle);
        this.quizDifficulty.set(res.quizDifficulty || 'General');
        this.quizCategory.set(res.quizCategory || '');

        // Only show filtered (recommended) candidates
        const filtered = res.filteredCandidates || [];

        const assigned: any[] = [];
        const available: any[] = [];

        filtered.forEach((c: any) => {
          if (res.assignedIds.includes(c._id)) {
            assigned.push(c);
          } else {
            available.push(c);
          }
        });

        this.assignedCandidates = assigned;
        this.availableCandidates = available;
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  saveAssignments() {
    this.isSaving.set(true);
    const assignedIds = this.assignedCandidates.map(c => c._id);
    console.log('assignedCandidates:', this.assignedCandidates);
    console.log('assignedIds:', assignedIds);
    this.quizService.assignHRQuiz(this.quizId, { assignees: assignedIds }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Assignments saved successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.isSaving.set(false);
        alert('Failed to update assignments');
      }
    });
  }

  getFilterDescription(): string {
    const d = this.quizDifficulty().toLowerCase();
    const cat = this.quizCategory() || 'Any';
    let levelDesc = 'All levels';
    if (d === 'easy') levelDesc = 'Beginner (0-25% comfort)';
    if (d === 'medium') levelDesc = 'Intermediate & Advanced (26-75%)';
    if (d === 'hard') levelDesc = 'Expert (76-100% comfort)';
    return `${levelDesc} in "${cat}"`;
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { QuizService } from '../../../services/quiz.service';

interface TopicOfInterest {
  topic: string;
  comfortLevel: number;
}

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class CandidateProfileComponent implements OnInit {
  user = signal<any>(null);
  submissions = signal<any[]>([]);
  loading = signal(true);
  
  topics = signal<TopicOfInterest[]>([]);
  
  // State for new topic form
  newTopicName = signal('');
  newTopicComfort = signal(50);
  
  isSavingTopics = signal(false);

  constructor(public authService: AuthService, private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getCandidateProfile().subscribe({
      next: (res) => {
        this.user.set(res.user);
        this.topics.set(res.user.topicsOfInterest || []);
        this.submissions.set(res.submissions || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get testsTaken(): number { return this.submissions().length; }
  get avgScore(): number {
    const subs = this.submissions();
    if (subs.length === 0) return 0;
    return Math.round(subs.reduce((a, s) => a + s.percentage, 0) / subs.length);
  }
  get bestScore(): number {
    const subs = this.submissions();
    if (subs.length === 0) return 0;
    return Math.max(...subs.map(s => s.percentage));
  }

  addTopic() {
    const topic = this.newTopicName().trim();
    if (!topic) return;

    const newTopicList = [...this.topics(), { topic, comfortLevel: this.newTopicComfort() }];
    this.topics.set(newTopicList);
    
    // Clear form
    this.newTopicName.set('');
    this.newTopicComfort.set(50);
    
    this.saveTopics(newTopicList);
  }

  removeTopic(index: number) {
    const newTopicList = this.topics().filter((_, i) => i !== index);
    this.topics.set(newTopicList);
    this.saveTopics(newTopicList);
  }

  private saveTopics(updatedTopics: TopicOfInterest[]) {
    this.isSavingTopics.set(true);
    this.quizService.updateCandidateProfile({ topicsOfInterest: updatedTopics }).subscribe({
      next: () => {
        this.isSavingTopics.set(false);
      },
      error: () => {
        this.isSavingTopics.set(false);
        alert('Failed to update topics.');
      }
    });
  }
}


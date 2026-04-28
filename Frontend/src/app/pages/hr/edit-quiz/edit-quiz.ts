import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-edit-quiz',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-quiz.html',
  styleUrl: './edit-quiz.css',
})
export class HREditQuizComponent implements OnInit {
  quizId = '';
  title = '';
  timer = 30;
  category = '';
  difficulty = 'medium';
  questions = signal<any[]>([]);

  loading = signal(true);
  saving = signal(false);
  success = signal('');
  error = signal('');
  locked = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.quizId = this.route.snapshot.params['quizId'];
    this.loadQuiz();
  }

  loadQuiz(): void {
    const overrides = history.state?.quizOverrides;

    this.quizService.getHRQuiz(this.quizId).subscribe({
      next: (res) => {
        const q = res.quiz;
        this.title = overrides ? overrides.title : q.title;
        this.timer = overrides ? overrides.timer : q.timer;
        this.category = overrides ? overrides.category : (q.category || '');
        this.difficulty = overrides ? overrides.difficulty : (q.difficulty || 'medium');

        // Questions come from res.questions (separate from quiz object)
        const rawQuestions = res.questions || [];
        const mapped = rawQuestions.map((rq: any) => {
          const correctIndex = rq.correctAnswers?.[0] ? parseInt(rq.correctAnswers[0]) : -1;
          const correctAnswer = (correctIndex >= 0 && rq.options[correctIndex]) ? rq.options[correctIndex] : '';

          return {
            _id: rq._id,
            question: rq.question,
            options: [...rq.options],
            correctAnswer: correctAnswer,
            type: rq.type || 'single'
          };
        });

        this.questions.set(mapped);
        this.locked.set((res.attemptCount || 0) > 0);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load quiz');
        this.loading.set(false);
      }
    });
  }

  onSave(): void {
    if (!this.title.trim()) {
      this.error.set('Title is required');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const formattedQuestions = this.questions().map(q => {
      const correctIndex = q.options.findIndex(
        (opt: string) => opt === q.correctAnswer
      );

      return {
        question: q.question,
        options: q.options,
        correctAnswers: [correctIndex.toString()],
        type: 'single'
      };
    });

    const data = {
      title: this.title,
      timer: this.timer,
      category: this.category,
      difficulty: this.difficulty,
      questions: formattedQuestions
    };

    this.quizService.updateHRQuiz(this.quizId, data).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Quiz updated successfully!');
        setTimeout(() => this.router.navigate(['/hr/quizzes']), 1200);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Failed to update quiz');
      }
    });
  }

  updateQuestion(index: number, field: string, value: any): void {
    const q = [...this.questions()];
    q[index] = { ...q[index], [field]: value };
    this.questions.set(q);
  }

  updateOption(qIndex: number, optIndex: number, value: string): void {
    const q = [...this.questions()];
    const oldOption = q[qIndex].options[optIndex];
    const opts = [...(q[qIndex].options || [])];
    opts[optIndex] = value;

    const updated = { ...q[qIndex], options: opts };
    if (q[qIndex].correctAnswer === oldOption) {
      updated.correctAnswer = value;
    }
    q[qIndex] = updated;
    this.questions.set(q);
  }

  setCorrectAnswer(qIndex: number, optionText: string): void {
    const q = [...this.questions()];
    q[qIndex] = { ...q[qIndex], correctAnswer: optionText };
    this.questions.set(q);
  }

  removeQuestion(index: number): void {
    const q = this.questions().filter((_, i) => i !== index);
    this.questions.set(q);
  }

  addQuestion(): void {
    this.questions.set([...this.questions(), {
      question: '', options: ['', '', '', ''], correctAnswer: '', type: 'single'
    }]);
    setTimeout(() => {
      const cards = document.querySelectorAll('.question-card');
      cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }
}

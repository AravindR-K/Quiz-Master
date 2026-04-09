import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private adminUrl = 'http://localhost:5000/api/admin';
  private studentUrl = 'http://localhost:5000/api/student';

  constructor(private http: HttpClient) {}

  // ========== ADMIN ENDPOINTS ==========

  getUsers(): Observable<any> {
    return this.http.get(`${this.adminUrl}/users`);
  }

  getLoggedInUsers(): Observable<any> {
    return this.http.get(`${this.adminUrl}/users/logged-in`);
  }

  getUserHistory(userId: string): Observable<any> {
    return this.http.get(`${this.adminUrl}/users/${userId}/history`);
  }

  getSubmissionDetails(submissionId: string): Observable<any> {
    return this.http.get(`${this.adminUrl}/submissions/${submissionId}`);
  }

  createQuiz(formData: FormData): Observable<any> {
    return this.http.post(`${this.adminUrl}/quiz/create`, formData);
  }

  getAdminQuizzes(): Observable<any> {
    return this.http.get(`${this.adminUrl}/quizzes`);
  }

  deleteQuiz(quizId: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/quiz/${quizId}`);
  }

  // ========== STUDENT ENDPOINTS ==========

  getAvailableQuizzes(): Observable<any> {
    return this.http.get(`${this.studentUrl}/quizzes`);
  }

  getQuizForTaking(quizId: string): Observable<any> {
    return this.http.get(`${this.studentUrl}/quiz/${quizId}`);
  }

  submitQuiz(quizId: string, answers: any[], timeTaken: number): Observable<any> {
    return this.http.post(`${this.studentUrl}/quiz/${quizId}/submit`, { answers, timeTaken });
  }

  getStudentProfile(): Observable<any> {
    return this.http.get(`${this.studentUrl}/profile`);
  }

  getResultDetails(submissionId: string): Observable<any> {
    return this.http.get(`${this.studentUrl}/results/${submissionId}`);
  }
}

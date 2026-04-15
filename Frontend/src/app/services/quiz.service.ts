  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class QuizService {
    private adminUrl = 'http://localhost:5000/api/admin';
    private hrUrl = 'http://localhost:5000/api/hr';
    private candidateUrl = 'http://localhost:5000/api/candidate';

    constructor(private http: HttpClient) {}

    // ========== ADMIN ENDPOINTS ==========

    getAdminStats(): Observable<any> {
      return this.http.get(`${this.adminUrl}/stats`);
    }

    getUsers(role?: string): Observable<any> {
      const url = role ? `${this.adminUrl}/users?role=${role}` : `${this.adminUrl}/users`;
      return this.http.get(url);
    }

    getLoggedInUsers(): Observable<any> {
      return this.http.get(`${this.adminUrl}/users/logged-in`);
    }

    createHRUser(data: { name: string; email: string; password: string }): Observable<any> {
      return this.http.post(`${this.adminUrl}/users/create-hr`, data);
    }

    deleteUser(userId: string): Observable<any> {
      return this.http.delete(`${this.adminUrl}/users/${userId}`);
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

    createQuizManual(data: any): Observable<any> {
      return this.http.post(`${this.adminUrl}/quiz/create-manual`, data);
    }

    getAdminQuizzes(): Observable<any> {
      return this.http.get(`${this.adminUrl}/quizzes`);
    }

    getAdminQuiz(quizId: string): Observable<any> {
      return this.http.get(`${this.adminUrl}/quiz/${quizId}`);
    }

    updateQuiz(quizId: string, data: any): Observable<any> {
      return this.http.put(`${this.adminUrl}/quiz/${quizId}`, data);
    }

    assignQuiz(quizId: string, data: any): Observable<any> {
      return this.http.put(`${this.adminUrl}/quiz/${quizId}/assign`, data);
    }

    deleteQuiz(quizId: string): Observable<any> {
      return this.http.delete(`${this.adminUrl}/quiz/${quizId}`);
    }

    getAdminCategories(): Observable<any> {
      return this.http.get(`${this.adminUrl}/categories`);
    }

    getAdminGroups(): Observable<any> {
      return this.http.get(`${this.adminUrl}/groups`);
    }

    // ========== HR ENDPOINTS ==========

    getHRStats(): Observable<any> {
      return this.http.get(`${this.hrUrl}/stats`);
    }

    getHRQuizzes(): Observable<any> {
      return this.http.get(`${this.hrUrl}/quizzes`);
    }

    getHRQuiz(quizId: string): Observable<any> {
      return this.http.get(`${this.hrUrl}/quiz/${quizId}`);
    }

    createHRQuiz(formData: FormData): Observable<any> {
      return this.http.post(`${this.hrUrl}/quiz/create`, formData);
    }

    createHRQuizManual(data: any): Observable<any> {
      return this.http.post(`${this.hrUrl}/quiz/create-manual`, data);
    }

    updateHRQuiz(quizId: string, data: any): Observable<any> {
      return this.http.put(`${this.hrUrl}/quiz/${quizId}`, data);
    }

    deleteHRQuiz(quizId: string): Observable<any> {
      return this.http.delete(`${this.hrUrl}/quiz/${quizId}`);
    }

    getHRCandidates(): Observable<any> {
      return this.http.get(`${this.hrUrl}/candidates`);
    }

    getHRCandidateHistory(userId: string): Observable<any> {
      return this.http.get(`${this.hrUrl}/candidates/${userId}/history`);
    }

    getHRSubmissionDetails(submissionId: string): Observable<any> {
      return this.http.get(`${this.hrUrl}/submissions/${submissionId}`);
    }

    getHRCategories(): Observable<any> {
      return this.http.get(`${this.hrUrl}/categories`);
    }

    getHRGroups(): Observable<any> {
      return this.http.get(`${this.hrUrl}/groups`);
    }

    // ========== CANDIDATE ENDPOINTS ==========

    getAvailableQuizzes(): Observable<any> {
      return this.http.get(`${this.candidateUrl}/quizzes`);
    }

    getQuizForTaking(quizId: string): Observable<any> {
      return this.http.get(`${this.candidateUrl}/quiz/${quizId}`);
    }

    submitQuiz(quizId: string, answers: any[], timeTaken: number): Observable<any> {
      return this.http.post(`${this.candidateUrl}/quiz/${quizId}/submit`, { answers, timeTaken });
    }

    getCandidateProfile(): Observable<any> {
      return this.http.get(`${this.candidateUrl}/profile`);
    }

    getResultDetails(submissionId: string): Observable<any> {
      return this.http.get(`${this.candidateUrl}/results/${submissionId}`);
    }
  }

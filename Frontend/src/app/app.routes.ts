import { Routes } from '@angular/router';
import { adminGuard, studentGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth routes (guest only)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },

  // Admin routes
  {
    path: 'admin/dashboard',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/users',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/users/users').then(m => m.AdminUsersComponent)
  },
  {
    path: 'admin/users/:userId/history',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/user-history/user-history').then(m => m.UserHistoryComponent)
  },
  {
    path: 'admin/submissions/:submissionId',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/submission-detail/submission-detail').then(m => m.SubmissionDetailComponent)
  },
  {
    path: 'admin/generate-quiz',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/generate-quiz/generate-quiz').then(m => m.GenerateQuizComponent)
  },

  // Student routes
  {
    path: 'student/dashboard',
    canActivate: [studentGuard],
    loadComponent: () => import('./pages/student/dashboard/dashboard').then(m => m.StudentDashboardComponent)
  },
  {
    path: 'student/quiz/:quizId',
    canActivate: [studentGuard],
    loadComponent: () => import('./pages/student/take-quiz/take-quiz').then(m => m.TakeQuizComponent)
  },
  {
    path: 'student/profile',
    canActivate: [studentGuard],
    loadComponent: () => import('./pages/student/profile/profile').then(m => m.StudentProfileComponent)
  },
  {
    path: 'student/results/:submissionId',
    canActivate: [studentGuard],
    loadComponent: () => import('./pages/student/results/results').then(m => m.StudentResultsComponent)
  },

  // Catch-all
  { path: '**', redirectTo: '/login' }
];

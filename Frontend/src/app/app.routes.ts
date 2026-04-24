import { Routes } from '@angular/router';
import { adminGuard, hrGuard, candidateGuard, guestGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth routes (guest only — no sidebar)
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

  // ========== ADMIN ROUTES (with shared layout) ==========
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/users').then(m => m.AdminUsersComponent)
      },
      {
        path: 'users/:userId/history',
        loadComponent: () => import('./pages/admin/user-history/user-history').then(m => m.UserHistoryComponent)
      },
      {
        path: 'manage-groups',
        loadComponent: () => import('./pages/admin/manage-groups/manage-groups').then(m => m.ManageGroupsComponent)
      },
      {
        path: 'hr-users',
        loadComponent: () => import('./pages/admin/hr-users/hr-users').then(m => m.AdminHrUsersComponent)
      },
      {
        path: 'submissions/:submissionId',
        loadComponent: () => import('./pages/admin/submission-detail/submission-detail').then(m => m.SubmissionDetailComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () => import('./pages/admin/quizzes/quizzes').then(m => m.AdminQuizzesComponent)
      },
      {
        path: 'create-quiz',
        loadComponent: () => import('./pages/admin/create-quiz/create-quiz').then(m => m.CreateQuizComponent)
      },
      {
        path: 'quiz/:quizId/assign',
        loadComponent: () => import('./pages/admin/assign-quiz/assign-quiz').then(m => m.AssignQuizComponent)
      },
      {
        path: 'quiz/:quizId/edit',
        loadComponent: () => import('./pages/admin/edit-quiz/edit-quiz').then(m => m.EditQuizComponent)
      },
    ]
  },

  // ========== HR ROUTES (with shared layout) ==========
  {
    path: 'hr',
    component: LayoutComponent,
    canActivate: [hrGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/hr/dashboard/dashboard').then(m => m.HRDashboardComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () => import('./pages/hr/quizzes/quizzes').then(m => m.HRQuizzesComponent)
      },
        {
        path: 'users/:userId/history',
        loadComponent: () => import('./pages/hr/user-history/user-history').then(m => m.HRUserHistoryComponent)
      },
      {
        path: 'create-quiz',
        loadComponent: () => import('./pages/hr/create-quiz/create-quiz').then(m => m.HRCreateQuizComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/hr/users/users').then(m => m.Users)
      },
      {
        path: 'manage-groups',
        loadComponent: () => import('./pages/hr/manage-groups/manage-groups').then(m => m.HRManageGroupsComponent)
      },
      {
        path: 'submissions/:submissionId',
        loadComponent: () => import('./pages/hr/submission-detail/submission-detail').then(m => m.HRSubmissionDetailComponent)
      },
      {
        path: 'quiz/:quizId/assign',
        loadComponent: () => import('./pages/hr/assign-quiz/assign-quiz').then(m => m.HRAssignQuizComponent)
      },
      {
        path: 'quiz/:quizId/edit',
        loadComponent: () => import('./pages/hr/edit-quiz/edit-quiz').then(m => m.HREditQuizComponent)
      },
    ]
  },

  // ========== CANDIDATE ROUTES (with shared layout) ==========
  {
    path: 'candidate',
    component: LayoutComponent,
    canActivate: [candidateGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/candidate/dashboard/dashboard').then(m => m.CandidateDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/candidate/profile/profile').then(m => m.CandidateProfileComponent)
      },
      {
        path: 'results/:submissionId',
        loadComponent: () => import('./pages/candidate/results/results').then(m => m.CandidateResultsComponent)
      },
    ]
  },

  // Standalone Candidate Routes (Maximized, no sidebar)
  {
    path: 'candidate/quiz/:quizId',
    canActivate: [candidateGuard],
    loadComponent: () => import('./pages/candidate/take-quiz/take-quiz').then(m => m.TakeQuizComponent)
  },

  // Backward compat: old student routes redirect to candidate
  { path: 'student', redirectTo: '/candidate', pathMatch: 'prefix' },
  { path: 'student/dashboard', redirectTo: '/candidate/dashboard' },
  { path: 'student/profile', redirectTo: '/candidate/profile' },

  // Catch-all
  { path: '**', redirectTo: '/login' }
];

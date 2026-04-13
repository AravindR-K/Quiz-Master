# QuizMaster Pro - Implementation Plan

## Current State Analysis
- **Backend**: Express + MongoDB (Mongoose) with JWT auth, 2 roles (admin/student), Excel-based quiz creation
- **Frontend**: Angular 21 standalone components, dark theme, emoji icons, sidebar navigation
- **Issues**: Guards mostly commented out, dark-only theme, no quiz editing, no assignment system, no AI generation, no HR role

## Changes Required

### Phase 1: Backend - Models & Roles
1. **User Model** - Add `hr` role to enum: `['admin', 'hr', 'candidate']` (rename student → candidate)
2. **Quiz Model** - Add `assignToAll: false` default, ensure `category`, `assignees`, `difficulty`, `topic` fields
3. **Submission Model** - No changes needed (already tracks studentId/quizId)
4. **Middleware** - Update `authorize()` to support new roles

### Phase 2: Backend - Routes
1. **Auth routes** - Register creates 'candidate' by default, admin can create HR users
2. **Admin routes** - Full CRUD for quizzes, users, assignments; create HR users
3. **New HR routes** - Quiz CRUD, assign quizzes, view candidate results
4. **Quiz edit/delete guards** - Check `Submission.countDocuments({ quizId })` before allowing edit/delete
5. **Quiz assignment** - Assign to specific users; filter student quiz list by assignment
6. **AI quiz generation** - New endpoint using Google Gemini API

### Phase 3: Frontend - Theme System
1. **Professional white/light theme** as default (like LeetCode/Codeforces)
2. **CSS custom properties** for theming with dark mode toggle
3. **Material-inspired design** with clean typography, subtle shadows, accent colors
4. **Angular Material** integration for polished UI components

### Phase 4: Frontend - Components
1. **Quiz edit modal/page** - Edit title, timer, questions for unattempted quizzes
2. **Quiz assignment UI** - Multi-select users/groups for assignment
3. **AI generation form** - Topic, difficulty, count inputs
4. **Category/group management** - Quiz categorization
5. **Role-based navigation** - Different sidebars for Admin/HR/Candidate
6. **Guard updates** - Enable all guards with HR role support

### Phase 5: Polish
1. Professional LeetCode-like UI with clean white theme
2. Smooth transitions and micro-animations
3. Responsive design
4. Google Material icons instead of emojis

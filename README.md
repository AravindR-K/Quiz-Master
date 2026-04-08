# 📝 QuizMaster

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white) 
![Nodejs](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) 
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) 
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

QuizMaster is a full-stack MEAN (MongoDB, Express, Angular, Node.js) application designed to facilitate seamless online quiz generation and assessment. It provides distinct interfaces for administrators to manage quizzes and monitor users, and for students to track their progress, take timed quizzes, and view immediate results.

---

## 🚀 Live Demo

- **Frontend (Vercel):** [https://quiz-master-mybn-l70xxi01x-aravind05rk-2282s-projects.vercel.app](https://quiz-master-mybn-l70xxi01x-aravind05rk-2282s-projects.vercel.app)
- **Backend API (Render):** [https://quiz-master-b3zl.onrender.com](https://quiz-master-b3zl.onrender.com)

---

## ✨ Key Features

### 👨‍🏫 Admin Dashboard
*   **Secure Admin Access:** Pre-configured admin accounts can log in to access the management portal.
*   **Quiz Generation:** Easily create new quizzes by uploading question banks (supports multi-select questions and manual entry overrides).
*   **User Management:** View all registered students, monitor active/online status, and track their test history and scores.
*   **Submissions Overview:** Drill down into specific quiz submissions to analyze class performance.

### 🎓 Student Dashboard
*   **Registration & Authentication:** Secure student sign-up and JWT-based login mechanism.
*   **Available Quizzes:** Browse newly assigned active quizzes in an intuitive grid view.
*   **Interactive Test taking Engine:** Take dynamically loaded, timed quizzes with progress tracking and persistent layout.
*   **Result Tracking:** Instant evaluation upon test submission with visual indicators of performance (`Good`, `Average`, `Poor`).
*   **Profile Analytics:** Review entire quiz history and statistical average tracking from your profile dashboard.

---

## 💻 Tech Stack

*   **Frontend:** Angular 17/18, TypeScript, RxJS, Vanilla CSS (Custom dark theme with CSS custom properties)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (Mongoose ODM)
*   **Authentication:** JSON Web Tokens (JWT), Bcrypt for password hashing
*   **Deployment:** Vercel (Front), Render (Back), MongoDB Atlas (Database)

---

## 🛠️ Local Setup & Installation

To run this application locally, you need Node.js and MongoDB installed on your system.

### 1. Clone the repository
```bash
git clone https://github.com/AravindR-K/Quiz-Master.git
cd Quiz-Master
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory and add your environment variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
npm start
# or use nodemon for development:
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd ../Frontend
npm install
```

Start the Angular development server:
```bash
ng serve
```

*The application will now be running on `http://localhost:4200/`*

---

## 🔑 Default Credentials

If MongoDB successfully seeds, you can log in as an admin via:

- **Email:** `admin@quizapp.com`
- **Password:** `admin123`

---

## 🎨 Theme & Assets
The UI utilizes a highly customized and responsive **dark mode** design (`#0f1117`) focusing on readability, glassmorphism interactions, and clean spacing for the ultimate test-taking experience without distractions.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/AravindR-K/Quiz-Master/issues) if you want to contribute.

## 📝 License
This project is open-source and available under the [GNU GPLv3](LICENSE).

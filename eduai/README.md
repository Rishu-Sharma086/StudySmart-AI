# EduAI 🎓

An AI-powered learning platform built with React + Vite. Upload PDFs and images, ask questions, and generate quizzes — all powered by Claude AI.

---

## ✨ Features

- 🔐 **OTP Auth** — Sign up / Sign in with 6-digit OTP verification
- 📁 **File Upload** — Real drag-and-drop for PDFs and images (up to 50 MB)
- 💬 **AI Q&A** — Ask questions about your uploaded documents (powered by Claude)
- 🧠 **Quiz Generation** — AI creates MCQ quizzes from your materials
- 📊 **Dashboard** — Track your performance, strong/weak topics, activity
- 👤 **Profile** — Edit personal info and change password

---

## 📁 Project Structure

```
eduai/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx              ← React entry point
    ├── App.jsx               ← Root component
    ├── context/
    │   └── AppContext.jsx    ← Global state (auth, page, toast)
    ├── lib/
    │   ├── db.js             ← In-memory database
    │   ├── otp.js            ← OTP generation & verification
    │   └── claude.js         ← Anthropic API helper
    ├── pages/
    │   ├── AuthPage.jsx      ← Login / Signup form
    │   ├── DashboardPage.jsx ← Stats, topics, activity
    │   ├── UploadPage.jsx    ← File upload with preview
    │   ├── QAPage.jsx        ← AI chat Q&A
    │   ├── QuizPage.jsx      ← AI quiz generator
    │   └── ProfilePage.jsx   ← User profile & settings
    ├── components/
    │   ├── auth/
    │   │   ├── OTPInput.jsx  ← 6-box OTP entry UI
    │   │   └── OTPScreen.jsx ← OTP verification screen
    │   ├── layout/
    │   │   ├── AppShell.jsx  ← Sidebar + page router
    │   │   └── Sidebar.jsx   ← Navigation sidebar
    │   └── ui/
    │       ├── ScoreRing.jsx ← SVG score ring
    │       └── Toast.jsx     ← Toast notification
    └── styles/
        ├── global.css        ← Base styles, variables, shared classes
        ├── sidebar.css       ← Sidebar styles
        ├── auth.css          ← Auth page styles
        ├── upload.css        ← Upload page styles
        ├── qa.css            ← Chat/Q&A styles
        ├── quiz.css          ← Quiz page styles
        └── profile.css       ← Profile page styles
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

### 3. Build for production

```bash
npm run build
```

---

## 🔧 Configuration

### Claude API
The app calls the Anthropic API directly from the browser (works in this demo setup).  
For production, move API calls to a **backend server** to keep your API key secret.

Edit `src/lib/claude.js` to change the model or parameters.

### Real Email OTP
Currently OTPs are shown on screen (demo mode).  
To send real emails, integrate a service like **Resend**, **SendGrid**, or **Nodemailer** in a backend and call it from `src/lib/otp.js`.

### Real Database
The current `src/lib/db.js` is in-memory only (resets on refresh).  
Replace with **Firebase**, **Supabase**, or any REST API for persistence.

---

## 🛠 Tech Stack

| Layer      | Tech                        |
|------------|-----------------------------|
| Frontend   | React 18 + Vite             |
| Styling    | Pure CSS with CSS Variables |
| AI         | Anthropic Claude API        |
| Auth       | OTP (in-memory, demo mode)  |
| Storage    | In-memory DB (demo mode)    |
| Fonts      | Playfair Display + DM Sans  |

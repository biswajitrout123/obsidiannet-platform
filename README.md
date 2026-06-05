# 🌌 ObsidianNet

ObsidianNet is a modern, high-performance professional networking platform and job portal designed for developers, tech innovators, and structural engineers. It features a responsive, sleek dark-themed ecosystem where users can share insights, expand their networks via secure connections, and discover global career opportunities.

---

## 🛠️ Tech Stack & Infrastructure

### Frontend Architecture
* **Framework:** React.js (via Vite)
* **Routing:** React Router DOM
* **State Management:** Zustand (Global Auth & UI Store)
* **Styling Framework:** Tailwind CSS (Custom Dark Palette Configuration)

### Backend Architecture
* **Runtime Environment:** Node.js
* **Server Framework:** Express.js
* **Database Management:** MongoDB (via Mongoose ODM)
* **Authentication:** JSON Web Tokens (JWT) & HTTP-Only Cookies

---

## 📂 Project Directory Structure

This repository is structured as a monorepo containing both the decoupled frontend and backend services:

```text
OBSIDIANNET/
├── Backend/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── job.routes.js
│   │   ├── post.route.js
│   │   └── user.routes.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── FeedPage.jsx
    │   │   ├── JobsPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── NetworkPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── SignupPage.jsx
    │   ├── store/
    │   │   └── useAuthStore.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── vercel.json
    └── package.json
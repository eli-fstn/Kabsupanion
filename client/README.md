# Kabsupanion Front-end

**Kabsupanion Front-end** is the client application for **Kabsupanion**, a section-centric academic web portal developed to support the academic needs of students through a centralized and accessible platform. It provides an intuitive user interface for students and administrators to manage academic tasks, schedules, subjects, resources, and section information through a responsive and user-friendly experience.

> **Note:** This repository contains only the frontend application. It communicates with a separate backend API.

---

## Features

### Student

| Feature | Status | Description |
|---------|:------:|-------------|
| Student Dashboard (`/dashboard`) | ✅ IMPLEMENTED | Central hub that provides access to all student features. |
| Task List Section | ✅ IMPLEMENTED | View, organize, and complete academic tasks. |
| Class Schedule Section | ✅ IMPLEMENTED | Displays the student's weekly class schedule. |
| Class Resources Section | ✅ IMPLEMENTED | Browse and upload shared learning materials. |

---

### Administrator

| Feature | Status | Description |
|---------|:------:|-------------|
| Admin Dashboard (`/admin`) | ✅ IMPLEMENTED | Centralized control panel for managing the system. |
| Task Management (`/admin/tasks`) | ✅ IMPLEMENTED | Create, update, and manage academic tasks and deadlines. |
| Schedule Management (`/admin/schedule`) | ✅ IMPLEMENTED | Maintain and organize class schedules. |
| Subject Management (`/admin/subjects`) | ✅ IMPLEMENTED | Create, update, and organize subjects. |
| Resource Management (`/admin/resources`) | ✅ IMPLEMENTED | Manage shared notes and learning materials. |
| Student Management (`/admin/masterlist`) | ✅ IMPLEMENTED | Manage student records, registration status, and section assignments. |

---

## Tech Stack

| Category                        | Technology        |
| :------------------------------ | :---------------- |
| **Framework**                   | React 19          |
| **Language**                    | JavaScript (JSX)  |
| **Build Tool**                  | Vite              |
| **Styling**                     | Tailwind CSS      |
| **Routing**                     | React Router DOM  |
| **State Management**            | React Context API |
| **HTTP Client**                 | Axios             |
| **Charts & Data Visualization** | Recharts          |
| **Animations**                  | React CountUp     |
| **PDF Rendering**               | React PDF         |
| **Icons**                       | Iconify           |
| **Progressive Web App**         | Vite Plugin PWA   |
| **Linting**                     | ESLint            |
| **Deployment**                  | Vercel            |
| **Backend Communication**       | REST API          |

---

## Project Structure

```text
client/
├── public/
│   ├── icon/                    # PWA and application icons
│   └── site.webmanifest        # Web app manifest
│
├── src/
│   ├── assets/
│   │   ├── illustrations/       # SVGs and illustration assets
│   │   └── images/              # Images and other media assets
│   │
│   ├── components/
│   │   ├── common/              # Shared reusable components
│   │   ├── layout/              # Layout components like sidebar and footer
│   │   └── ui/                  # Reusable UI primitives
│   │
│   ├── context/                 # React context providers and hooks
│   ├── hooks/                   # Custom React hooks
│   ├── pages/
│   │   ├── admin/               # Admin pages
│   │   ├── auth/                # Authentication screens
│   │   ├── errors/              # Error pages
│   │   ├── sections/            # Shared section-related pages
│   │   └── student/             # Student-facing pages
│   │
│   ├── routes/                  # Route configuration and guards
│   ├── services/                # API and service layer modules
│   ├── styles/                  # Global styles and theme helpers
│   ├── utils/                   # Utility helpers and formatters
│   │
│   ├── App.jsx                  # Root application component
│   ├── main.jsx                 # Entry point
│   └── vite-env.d.ts            # Vite TypeScript declarations
│
├── CHANGELOG.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

---

## Changelog

Project updates and release history can be found in [CHANGELOG.md](CHANGELOG.md).

---

## License

This project is intended for academic and personal use only. All rights reserved.
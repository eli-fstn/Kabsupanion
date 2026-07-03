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

| Category | Technologies |
|----------|--------------|
| Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Icons | Iconify |
| Notifications | React Hot Toast |
| Language | JavaScript (JSX) |
| API Communication | REST API |

---

## Project Structure

```text
client/
├── assets/              # Static assets (icons, images, illustrations)
├── src/
│   ├── components/
│   │   ├── common/      # Shared reusable components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Reusable UI components
│   │
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── sections/
│   │   └── student/
│   │
│   ├── routes/          # Route definitions
│   ├── services/        # API services
│   ├── styles/          # Global styles
│   ├── App.jsx
│   └── main.jsx
│
├── utils/               # Utility functions
├── .env
├── CHANGELOG.md
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Changelog

Project updates and release history can be found in [CHANGELOG.md](CHANGELOG.md).

---

## License

This project was developed for educational purposes as part of an academic software development project.

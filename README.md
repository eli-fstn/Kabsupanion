# Kabsupanion

**Kabsupanion** is a section-centric academic web portal developed to support the academic needs of students through a centralized and accessible platform. It streamlines academic organization by providing tools for task management, scheduling, activity tracking, and collaborative resource sharing within a section-based environment.

![Status](https://img.shields.io/badge/Status-Deployed-00C853)
![Audience](https://img.shields.io/badge/Audience-Section--Based-purple)
![Platform](https://img.shields.io/badge/Type-Web%20Application-blue)

---

## Overview

Kabsupanion was developed to address the need for a unified academic management tool within a section-based setup.

The platform consolidates essential academic resources into a single interface, reducing fragmented communication and improving organization, collaboration, and productivity among students.

---

## Features

| Feature                                              | Status      | Description                                                         |
| ---------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| Task List (`/dashboard`)                             | ✅ IMPLEMENTED | Manage and track academic tasks and deadlines efficiently.          |
| Class Schedule (`/dashboard`)                        | ✅ IMPLEMENTED | View weekly class schedules in an organized format.                 |
| Class Resources(`/dashboard`)                        | ✅ IMPLEMENTED | Upload, access, and share study notes and reviewers.                |
| Admin Dashboard Panel (`/admin/dashboard`)           | ✅ IMPLEMENTED | Centralized control panel for managing system overview and data.    |
| Admin Task List Panel (`/admin/tasks`)               | ✅ IMPLEMENTED | Create, update, and manage academic tasks and deadlines.            |
| Admin Class Schedule Panel (`/admin/schedule`)       | ✅ IMPLEMENTED | Maintain and organize class schedules for the section.              |
| Admin Class Resources Panel (`/admin/resources`)     | ✅ IMPLEMENTED | Manage and organize shared notes and study materials.               |
| Admin Class Subjects Panel (`/admin/subjects`)       | ✅ IMPLEMENTED | Create, update, and organize subjects for the assigned class.       |
| Admin Class List Panel (`/admin/masterlist`)         | ✅ IMPLEMENTED | Manage student records, status, and section membership information. |

---

## Tech Stack

| Layer              | Technology                    | Version |
| ------------------ | ----------------------------- | ------- |
| Frontend Language  | JavaScript (JSX)              | ES2024  |
| Frontend Framework | React                         | 19.2.6  |
| Build Tool         | Vite                          | 8.0.12  |
| Routing            | React Router DOM              | 7.17.0  |
| Styling            | Tailwind CSS                  | 4.3.0   |
| HTTP Client        | Axios                         | 1.17.0  |
| Charts & Graphs    | Recharts                      | 3.8.1   |
| PDF Rendering      | react-pdf                     | 10.4.1  |
| Icons              | Iconify                       | 6.0.2   |
| PWA Support        | vite-plugin-pwa               | 1.3.0   |
| API                | REST API                      | —       |
| Backend Language   | TypeScript                    | 5.7.3   |
| Backend Framework  | Hono                          | 4.7.2   |
| Runtime            | Cloudflare Workers (Wrangler) | 4.100.0 |
| Database           | Neon Postgres                 | 0.10.4  |
| ORM                | Drizzle ORM                   | 0.38.4  |
| Authentication     | JWT (HS256)                   | —       |

---

## Project Team

| Name          | Role                                  |
| ------------- | ------------------------------------- |
| Elijah Festin | Front-End Developer, UI/UX Designer   |
| Lorenz Tuboro | Back-End Developer, Lead Deveveloper  |

---

## Disclaimer

Kabsupanion is a personal initiative project and is not an official system of Cavite State University. It was created to explore solutions for common organizational and communication challenges observed in section-based academic environments.

---

## License

This project is intended for academic and personal use only.
All rights reserved.

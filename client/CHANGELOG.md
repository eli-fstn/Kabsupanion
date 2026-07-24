# Changelog

All notable changes to the Kabsupanion **Frontend** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and follows Semantic Versioning.

---

## [Unreleased]

### Frontend Enhancements

Ongoing improvements to the frontend experience, focusing on usability, responsiveness, and maintainability.

### Added

* Responsive layout across all student pages for various screen sizes.
* Schedule creation interface for administrators.

### Changed

* Continuous frontend refinements and codebase improvements.

---

## [0.1.0] - 2026-07-24

### Performance, User Experience, and Frontend Architecture

This release focuses on improving application performance, user experience, Progressive Web App support, frontend architecture, and development workflow.

### Added

* Progressive Web App (PWA) support with install prompt.
* Dark mode support.
* PDF download support for schedules and uploaded resources.
* Skeleton loading components for administrator pages.
* Pagination for the Student Masterlist.
* Notes approval workflow for administrators.
* Automatic task cleanup after expired deadlines.
* Terms and Conditions agreement during registration.
* Administrator view toggle for the student interface.
* Lazy loading for pages and images.
* Vercel Analytics integration.
* Vercel Speed Insights integration.
* Scroll reveal animations using the Intersection Observer API.
* Updated Kabsupanion branding and application logo.
* GitHub Actions workflow for continuous integration.

### Changed

* Reorganized the frontend file structure into a more modular and maintainable architecture.
* Redesigned the application footer.
* Improved the administrator dashboard interface.
* Updated dashboard greetings to display the user's username.
* Refined filter button styling and overall interface consistency.
* Added blur effects during page scrolling.
* Optimized asset imports for improved maintainability.
* Sorted administrator tasks based on the nearest deadline.
* Removed CvSU-specific background artwork to establish a more neutral application identity.
* Improved project documentation and frontend configuration.

### Fixed

* Fixed document preview support for uploaded resources.
* Fixed modal layout issues within the Resources module.
* Fixed issues affecting registration and report submission forms.
* Improved authentication session expiration handling with automatic user notifications.
* Resolved several frontend crashes and stability issues.

---

## [0.0.7] - 2026-06-25

### Student Features and Administrative Tools

Introduced new student-facing functionality while expanding administrative capabilities and improving overall usability.

### Added

* Class schedule management (CRUD) for administrators.
* Student class schedule page.
* Task completion using checkboxes.
* Due date color indicators based on remaining days.
* Loading indicators across administrator forms.
* Count-up animations for dashboard statistics.
* Full image preview within the Resources module.
* Automatic greeting based on the current time.
* Persistent login using stored authentication tokens.
* Loading states across administrator and student dashboards.
* Student resource upload functionality.
* Active sidebar navigation indicator.
* Date formatting utility.
* Student registration status management.
* User account status management.
* Report submission form.
* Error 403 page for unauthorized access.

### Changed

* Refactored API service modules for improved maintainability.
* Improved frontend project organization.
* Updated the dashboard footer.
* Refined the user interface of the Masterlist, Subject List, and Task List.
* Added frontend support for cascade deletion of user records.

### Fixed

* Fixed schedule validation issues.
* Improved loading behavior throughout the application.

---

## [0.0.6] - 2026-06-24

### Resource Management and Authentication Improvements

Expanded administrator resource management features while improving authentication and application loading states.

### Added

* Resources management page for administrators.
* Loading screens for administrator pages.
* Loading screens for student pages.

### Changed

* Improved authentication flow by automatically redirecting authenticated users after login.
* Standardized loading states to provide a more consistent user experience while data is being fetched.

---

## [0.0.5] - 2026-06-22

### Administrator Dashboard Foundation

Introduced the first version of the administrator dashboard together with management features for academic resources.

### Added

* Dashboard statistics cards.
* CRUD operations for Subjects.
* CRUD operations for Tasks.
* CRUD operations for the Student Masterlist.
* User Context for authenticated pages.

### Changed

* Redesigned the resource upload modal interface.
* Reorganized API service modules to improve maintainability.

### Fixed

* Fixed pie chart rendering within the administrator dashboard.

---

## [0.0.4] - 2026-06-20

### Navigation and Authentication Enhancements

Improved application navigation while introducing reusable interface components and route protection.

### Added

* Administrator sidebar navigation.
* Dashboard footer.
* Protected routes.
* Reusable Button component.

### Changed

* Simplified the Button component API by adopting the `children` pattern.
* Reorganized the frontend project structure to improve maintainability.

---

## [0.0.3] - 2026-06-18

### Student Modules and API Integration

Expanded the student experience through additional academic modules and frontend API integration.

### Added

* Resource upload interface.
* Login and registration loading screens.
* Frontend API service layer.
* Activity Tracker.
* Class List module.
* Class Resources module.
* Task management interface with CRUD operations.

### Changed

* Refined the login and registration workflows.
* Refactored Task List API integration.
* Improved the Class Resources module structure.

### Fixed

* Fixed API route integration issues.
* Improved frontend API error handling.
* Fixed authenticated task operations.

---

## [0.0.2] - 2026-06-15

### Authentication and Core Student Experience

Established the application's authentication system and core student-facing modules.

### Added

* Registration page.
* Improved login page.
* Dashboard integration.
* Section management pages.
* Class Schedule module.
* Task List with filtering.
* Authentication loading modal.

### Changed

* Refined the authentication workflow for login and registration.
* Refactored modal components for improved reusability.

### Fixed

* Fixed login API integration.
* Improved login error handling.
* Fixed dashboard authentication flow.
* Fixed error page routing.

---

## [0.0.1] - 2026-06-12

### Initial Frontend Foundation

Established the initial frontend architecture and core application pages required for development.

### Added

* Initial React and Vite project setup.
* Tailwind CSS integration.
* Frontend project structure.
* Login page.
* Dashboard layout.
* Administrator pages.
* Error pages.
* CvSU branding assets.
* Initial project documentation.

### Changed

* Refined the initial project architecture by organizing the frontend into a more maintainable and scalable structure.

### Fixed

* Fixed initial project configuration and server integration issues.

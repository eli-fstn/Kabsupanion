# Changelog

All notable changes to Kabsupanion **frontend** of this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and follows Semantic Versioning.

---

## [Unreleased]

### Added

* Responsive layout across all student pages for various screen sizes.
* Schedule creation interface for administrators.

---

## [0.0.7] - 2026-06-25

### Added

* Class schedule management (CRUD) for administrators.
* Student class schedule page.
* Task completion with checkbox support.
* Due date color indicators based on remaining days.
* Loading indicators across admin forms.
* Count-up animation for dashboard statistics.
* Full image preview in the Resources module.
* Automatic greeting based on the current time.
* Persistent login using stored authentication token.
* Loading states throughout the admin and student dashboards.
* Student resource upload feature.
* Active sidebar navigation indicator.
* Date formatting utility.
* Student registration status in the masterlist.
* User account status management.
* Report submission form for system issues.
* Error 403 page for unauthorized access.

### Changed

* Refactored API services into separate TypeScript modules.
* Improved code organization and project structure.
* Updated footer UI.
* Minor UI improvements for:

  * Masterlist
  * Subject List
  * Task List
* Added cascade delete support for user management.

### Fixed

* Fixed schedule-related validation issues.
* Improved loading behavior throughout the application.

---

## [0.0.6] - 2026-06-24

### Added

* Resources management page for administrators.
* Dashboard loading indicators.
* Student-side loading screens.

### Changed

* Improved authentication flow by automatically redirecting authenticated users to the dashboard.

---

## [0.0.5] - 2026-06-22

### Added

* Admin dashboard statistics cards.
* CRUD operations for:

  * Subjects
  * Tasks
  * Student Masterlist
* User Context for authenticated pages.

### Changed

* Improved upload resource modal UI.
* Converted API service files to TypeScript.

### Fixed

* Fixed pie chart rendering on the admin dashboard.

---

## [0.0.4] - 2026-06-20

### Added

* Admin sidebar navigation.
* Dashboard footer.
* Protected routes for authenticated users.
* Configurable Button component using reusable props.

### Changed

* Simplified Button component API using `children`.
* Reorganized frontend file structure.

---

## [0.0.3] - 2026-06-18

### Added

* Resource upload interface.
* Loading screens for login and registration.
* API integration for frontend services.
* Activity tracker.
* Class List page.
* Class Resources page.
* Task management interface with CRUD functionality.

### Changed

* Refactored:

  * Login and registration flow.
  * Task List API handling.
  * Class Resources module.

### Fixed

* Fixed API route integration.
* Improved API error handling.
* Fixed authentication-protected task operations.

---

## [0.0.2] - 2026-06-15

### Added

* User registration interface.
* Login page improvements.
* Dashboard integration.
* Section management pages.
* Class schedule interface.
* Task List page with filtering.
* Loading modal during authentication.

### Changed

* Improved login workflow.
* Improved registration workflow.
* Refactored modal components.

### Fixed

* Login API issues.
* Login error handling.
* Dashboard authentication flow.
* Error page routing.

---

## [0.0.1] - 2026-06-12

### Added

* Initial Vite + React project setup.
* Tailwind CSS integration.
* Client and server project structure.
* Login page.
* Dashboard layout.
* Admin pages.
* Error pages.
* CVSU assets.
* Initial documentation and project structure.

### Changed

* Multiple project structure improvements during initial development.

### Fixed

* Server folder configuration.
* General project initialization issues.

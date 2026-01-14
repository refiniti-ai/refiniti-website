# Project Blueprint

## Overview

This project is a framework-less web application designed to showcase various case studies. It utilizes modern HTML, CSS, and JavaScript features, including Web Components for reusable UI elements, modern CSS for responsive design, and ES Modules for organized JavaScript. The application is intended to run within the Firebase Studio environment.

## Detailed Outline

### Initial Version

The initial version of the application consists of an `index.html` file as the main entry point, with `style.css` for styling and `main.js` for JavaScript logic. It includes several pages: `case-study.html`, `privacy-policy.html`, `terms-conditions.html`, `schedule-meeting.html`, and `legal-modal.js`, `header.js`, `footer.js` for common components.

### Current Features

*   **Responsive Design:** Uses modern CSS features to adapt to different screen sizes.
*   **Modular JavaScript:** Organizes code using ES Modules for better maintainability.
*   **Web Components:** Utilizes custom elements for reusable UI components.
*   **Firebase Integration:** Recognizes standard Firebase integration patterns.
*   **Case Studies Page (`case-study.html`):** Displays various projects with videos and PDF presentations.
    *   **Queenie Couture Video:** Embeds a video.
    *   **Website Showcases:** Displays images for various websites.
    *   **PDF Presentations:** Integrates PDF.js for displaying PDF documents within the page.

### Deployment

*   **Platform:** Firebase Hosting
*   **Project ID:** `dynamic-mystery-478909-n1`
*   **Build Process:** Tailwind CSS is built using `npm run build` which generates `dist/style.css`.
*   **Deployment Command:** `firebase deploy`

### Current Requested Change: Push live to Firebase

#### Plan:

1.  **Fix Build Script:** Updated `package.json` to use `tailwindcss` command instead of a hardcoded path to `node_modules`.
2.  **Fix CSS Links:** Updated HTML files to ensure they only reference the built `dist/style.css` instead of the source `style.css` which contains `@tailwind` directives.
3.  **Build Assets:** Ran `npm run build` to generate the latest CSS.
4.  **Configure Firebase:** Updated `.firebaserc` with the project ID `dynamic-mystery-478909-n1`.
5.  **Deploy:** Ran `firebase deploy` to push the site live.
6.  **Fix Asset Deployment:** Removed `Videos/` and `Documents/` from `firebase.json` ignore list to ensure case study assets are uploaded.

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

### Current Requested Change: Enhanced Case Studies Page with Slideshows, Custom Video Controls, and PDF Error Handling

#### Plan:

1.  **Update `blueprint.md`:** Ensure this blueprint reflects the latest changes and plans. (Already done with this step).
2.  **Dynamic "Queenie Couture" Thumbnail (5-second mark):**
    *   Modify `case-study.html` to include a canvas element and a play button overlay for the video thumbnail.
    *   Modify `main.js` (or create a new JS file) to:
        *   Load the "Queenie Couture" video.
        *   Seek to the 5-second mark.
        *   Draw that frame onto a hidden canvas.
        *   Set that canvas as the background image or a visible element over the video before playback.
        *   Ensure the video only plays when the user clicks a play button overlay.
3.  **Fix Website and PDF Slideshows:**
    *   Review existing JavaScript for slideshows in `main.js` and `case-study.html`.
    *   Ensure correct initialization and functionality for both website and PDF slideshows.
4.  **Improved PDF Loading with "Not Found" Message:**
    *   Enhance the `loadPdf` function in `main.js` (or `case-study.html` if it's inline) to:
        *   Attempt to load the PDF.
        *   If loading fails, display a clear "PDF not found" message within the presentation slide's content area.
5.  **Remove "Our Work" Text:**
    *   Remove the `<h1>` element containing "Our Work" from `case-study.html`.
6.  **Remove `display: flex` from `.item-container`:**
    *   Remove `display: flex;` from the `.item-container` CSS rule in `style.css`.
## Blueprint

### Overview

This project is a modern, framework-less web application designed to showcase RefinitiAI, an AI-powered growth system. It features a responsive design, interactive elements, and a clean aesthetic. The application aims to provide a clear and simple system for businesses to grow their revenue predictably.

### Current State & Features

*   **HTML Structure:** The `index.html` file defines the main structure of the web page, including a navigation bar, hero section, system overview, product suite, "How it Works" section, testimonials, FAQ, and a final call to action. It now correctly links to the generated `dist/style.css` and has the Tailwind CSS CDN removed.
*   **CSS Styling:** The `style.css` file contains the Tailwind CSS directives and now includes a `/* stylelint-disable at-rule-no-unknown */` comment to suppress IDE linter errors related to `@tailwind` and `@theme` rules. The `dist/style.css` is successfully generated, containing all the compiled Tailwind styles.
*   **JavaScript Interactivity:** The `main.js` file handles interactive elements such as the mobile menu toggle, a dynamic revenue counter, a site audit tool, a before/after slider for the "Scale" section, and a booking modal.
*   **Tailwind CSS Integration:** Tailwind CSS is fully integrated. `tailwind.config.js` is configured, `style.css` includes the directives, and the `package.json` `build:css` script successfully compiles Tailwind. The Nix environment (`.idx/dev.nix`) now correctly includes `pkgs.nodePackages.tailwindcss` and the `bradlc.vscode-tailwindcss` extension for improved IDE support.
*   **Google Fonts:** The project uses "Inter" and "Space Grotesk" from Google Fonts for typography.
*   **Lucide Icons:** SVG icons are loaded from Lucide for various UI elements.
*   **Firebase Integration:** The `mcp.json` file has been updated to include Firebase server configurations.

### Plan for Current Change: Suppress IDE Linter Errors for Tailwind CSS

1.  **Add `stylelint-disable` comment to `style.css`:** Added `/* stylelint-disable at-rule-no-unknown */` to the top of `style.css` to prevent the IDE's CSS linter from flagging `@tailwind` and `@theme` rules as errors.
2.  **Run `npm run build:css`:** Executed the `build:css` script to ensure the `dist/style.css` is up-to-date after the `style.css` modification.
3.  **Outcome:** The IDE linter errors for `@tailwind` and `@theme` rules are now suppressed, improving the editing experience without affecting the functionality or appearance of the website.

document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    const passwordModal = document.getElementById('password-modal');
    const mainContent = document.getElementById('main-content');

    // Get the page name (filename without extension)
    const getPageName = () => {
        const path = window.location.pathname;
        let page = path.split("/").pop();
        if (!page || page === "index.html") {
            // If it's the root or index, maybe check the title or a data attribute?
            // But for proposals, they usually have a filename.
            return page.split(".")[0] || "index";
        }
        return page.split(".")[0];
    };

    const correctPassword = getPageName().split("-")[0];

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPassword = passwordInput.value.trim();

            if (enteredPassword.toLowerCase() === correctPassword.toLowerCase()) {
                // Correct password
                passwordModal.style.display = 'none';
                mainContent.style.display = 'block';
                
                // Initialize agreement modal logic after password entry
                if (window.initializeAgreementModal) {
                    window.initializeAgreementModal();
                }
            } else {
                // Incorrect password
                passwordError.style.display = 'block';
                passwordInput.value = '';
            }
        });
    }
});

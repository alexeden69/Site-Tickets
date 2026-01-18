// Dark Mode System
let darkMode = localStorage.getItem('darkMode') || 'light';

function toggleDarkMode() {
    darkMode = darkMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('darkMode', darkMode);
    applyDarkMode();
}

function applyDarkMode() {
    if (darkMode === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('dark-mode-icon');
        if (icon) icon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        const icon = document.getElementById('dark-mode-icon');
        if (icon) icon.textContent = '🌙';
    }
}

// Apply dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
    applyDarkMode();
});

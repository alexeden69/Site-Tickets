// Theme system — dark navy is default, 'light' class switches to white mode
// Using key 'themeV2' to avoid conflicts with old localStorage values
let currentTheme = localStorage.getItem('themeV2') || 'dark';

function toggleDarkMode() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('themeV2', currentTheme);
    applyDarkMode();
}

function applyDarkMode() {
    if (currentTheme === 'light') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('dark-mode-icon');
        if (icon) icon.textContent = '🌙';
    } else {
        document.body.classList.remove('dark-mode');
        const icon = document.getElementById('dark-mode-icon');
        if (icon) icon.textContent = '☀️';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyDarkMode();
});

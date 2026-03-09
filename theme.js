// Theme toggle - Light/Dark mode
const THEME_KEY = 'github-issues-theme';

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function toggleTheme() {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  updateThemeIcon();
  window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  return next;
}

function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  const btn = document.getElementById('themeToggle');
  if (icon && btn) {
    const isDark = getTheme() === 'dark';
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }
}

// Apply theme on load (before DOM ready)
setTheme(getTheme());

// Update icon and add click handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateThemeIcon();
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => toggleTheme());
  }
});

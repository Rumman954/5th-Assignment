// Demo credentials for frontend validation only (no backend)
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin123';

document.addEventListener('DOMContentLoaded', () => {
  const signInBtn = document.getElementById('signInBtn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  signInBtn.addEventListener('click', handleSignIn);

  // Allow Enter key to submit
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSignIn();
  });
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSignIn();
  });
});

function handleSignIn() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    sessionStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'home.html';
  } else {
    alert('Invalid credentials. Please use Username: admin, Password: admin123');
  }
}

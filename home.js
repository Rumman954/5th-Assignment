const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';
const ALL_ISSUES_URL = `${API_BASE}/issues`;
const SEARCH_ISSUES_URL = `${API_BASE}/issues/search`;

const tabButtons = document.querySelectorAll('.tab-btn');
const issuesGrid = document.getElementById('issuesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');
const issueCount = document.getElementById('issueCount');
const searchInput = document.getElementById('searchInput');

let allIssues = [];
let currentTab = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
    return;
  }
  loadIssues();
  setupEventListeners();
});

function setupEventListeners() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
  });
}

async function loadIssues() {
  showLoading();
  hideNoResults();
  issuesGrid.classList.add('hidden');

  try {
    const url = searchQuery
      ? `${SEARCH_ISSUES_URL}?q=${encodeURIComponent(searchQuery)}`
      : ALL_ISSUES_URL;

    const response = await fetch(url);
    const result = await response.json();

    if (result.status === 'success') {
      allIssues = result.data || [];
      renderIssues();
    } else {
      allIssues = [];
      renderIssues();
    }
  } catch (error) {
    console.error('Error loading issues:', error);
    allIssues = [];
    renderIssues();
  } finally {
    hideLoading();
  }
}

function handleSearch() {
  searchQuery = searchInput.value.trim();
  loadIssues();
}

function switchTab(tab) {
  currentTab = tab;
  updateTabStyles();
  renderIssues();
}

function updateTabStyles() {
  tabButtons.forEach(btn => {
    if (btn.dataset.tab === currentTab) {
      btn.classList.remove('bg-gray-200', 'text-gray-700');
      btn.classList.add('bg-purple-600', 'text-white');
    } else {
      btn.classList.remove('bg-purple-600', 'text-white');
      btn.classList.add('bg-gray-200', 'text-gray-700');
    }
  });
}

function getFilteredIssues() {
  if (currentTab === 'all') return allIssues;
  if (currentTab === 'open') return allIssues.filter(issue => issue.status === 'open');
  if (currentTab === 'closed') return allIssues.filter(issue => issue.status === 'closed');
  return allIssues;
}

function renderIssues() {
  const issues = getFilteredIssues();

  issueCount.textContent = issues.length;
  issuesGrid.innerHTML = '';

  if (issues.length === 0) {
    showNoResults();
    return;
  }

  issuesGrid.classList.remove('hidden');
  issues.forEach(issue => {
    const card = createIssueCard(issue);
    issuesGrid.appendChild(card);
  });
}

function getPriorityClass(priority) {
  const p = (priority || '').toLowerCase();
  if (p === 'high') return 'bg-green-100 text-green-800';
  if (p === 'medium') return 'bg-orange-100 text-orange-800';
  if (p === 'low') return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-800';
}

function getLabelClass(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('bug')) return 'bg-red-100 text-red-800';
  if (l.includes('help wanted')) return 'bg-orange-100 text-orange-800';
  if (l.includes('enhancement')) return 'bg-green-100 text-green-800';
  if (l.includes('documentation')) return 'bg-blue-100 text-blue-800';
  if (l.includes('good first issue')) return 'bg-teal-100 text-teal-800';
  return 'bg-gray-100 text-gray-800';
}

function createIssueCard(issue) {
  const isOpen = issue.status === 'open';
  const borderClass = isOpen ? 'border-t-green-500' : 'border-t-purple-500';
  const statusColor = isOpen ? 'bg-green-500' : 'bg-purple-500';
  const formattedDate = formatDate(issue.createdAt);
  const labels = Array.isArray(issue.labels) ? issue.labels : [];
  const priorityClass = getPriorityClass(issue.priority);

  const card = document.createElement('div');
  card.className = `issue-card bg-white rounded-lg border border-gray-200 border-t-4 ${borderClass} p-4 shadow-sm hover:shadow-md transition-shadow`;
  card.innerHTML = `
    <div class="flex justify-between items-start mb-3">
      <span class="w-2.5 h-2.5 rounded-full ${statusColor} mt-1.5 flex-shrink-0"></span>
      <span class="px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${priorityClass}">${escapeHtml(issue.priority || 'N/A')}</span>
    </div>
    <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">${escapeHtml(issue.title)}</h3>
    <p class="text-sm text-gray-600 mb-3 line-clamp-2">${escapeHtml(issue.description || '')}</p>
    <div class="flex flex-wrap gap-1 mb-3">
      ${labels.map(l => `<span class="px-2 py-0.5 rounded text-xs font-medium ${getLabelClass(l)}"># ${escapeHtml(l)}</span>`).join('')}
    </div>
    <div class="text-xs text-gray-500 pt-2 border-t border-gray-100">
      <span>By ${escapeHtml(issue.author || '-')}</span>
      <span class="mx-1">•</span>
      <span>${formattedDate}</span>
    </div>
  `;

  return card;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showLoading() {
  loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
}

function showNoResults() {
  noResults.classList.remove('hidden');
  issuesGrid.classList.add('hidden');
}

function hideNoResults() {
  noResults.classList.add('hidden');
}

const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';
const ALL_ISSUES_URL = `${API_BASE}/issues`;
const SEARCH_ISSUES_URL = `${API_BASE}/issues/search`;

const tabButtons = document.querySelectorAll('.tab-btn');
const issuesGrid = document.getElementById('issuesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');
const issueCount = document.getElementById('issueCount');
const searchInput = document.getElementById('searchInput');
const issueModal = document.getElementById('issueModal');
const closeModal = document.getElementById('closeModal');

let allIssues = [];
let currentTab = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  if (!sessionStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
    return;
  }
  updateTabStyles();
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

  closeModal.addEventListener('click', hideIssueModal);
  issueModal.addEventListener('click', (e) => {
    if (e.target === issueModal) hideIssueModal();
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
      btn.style.backgroundColor = '#633EFF';
      btn.style.color = 'white';
      btn.style.border = '1px solid #633EFF';
      btn.style.borderBottom = '2px solid white';
      btn.style.marginBottom = '-2px';
    } else {
      btn.style.backgroundColor = '#ffffff';
      btn.style.color = '#374151';
      btn.style.border = '1px solid #d1d5db';
      btn.style.borderBottom = 'none';
      btn.style.marginBottom = '0';
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

function getPriorityBorderColor(priority) {
  const p = (priority || '').toLowerCase();
  if (p === 'high') return '#FEE7E8';
  if (p === 'medium') return '#FFF2CC';
  if (p === 'low') return '#F0F0FA';
  if (p === 'enhancement') return '#D4EDDA';
  return '#F0F0FA';
}

function getPriorityTagClass(priority) {
  const p = (priority || '').toLowerCase();
  if (p === 'high') return 'bg-[#FEE7E8] text-[#C53030]';
  if (p === 'medium') return 'bg-[#FFF2CC] text-[#B45309]';
  if (p === 'low') return 'bg-[#F0F0FA] text-[#553C9A]';
  if (p === 'enhancement') return 'bg-[#D4EDDA] text-[#276749]';
  return 'bg-gray-100 text-gray-800';
}

function getLabelClass(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('bug')) return 'text-white';
  if (l.includes('help wanted')) return 'text-white';
  if (l.includes('enhancement')) return 'text-[#276749]';
  return 'text-gray-800';
}

function getLabelBgStyle(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('bug')) return '#F56565';
  if (l.includes('help wanted')) return '#E6A800';
  if (l.includes('enhancement')) return '#D4EDDA';
  if (l.includes('documentation')) return '#BEE3F8';
  return '#E5E7EB';
}

function createIssueCard(issue) {
  const isOpen = issue.status === 'open';
  const borderColor = getPriorityBorderColor(issue.priority);
  const priorityTagClass = getPriorityTagClass(issue.priority);
  const formattedDate = formatDate(issue.createdAt);
  const labels = Array.isArray(issue.labels) ? issue.labels : [];

  const card = document.createElement('div');
  card.className = 'issue-card bg-white rounded-lg border border-gray-200 border-t-4 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer';
  card.style.borderTopColor = borderColor;
  card.addEventListener('click', () => showIssueModal(issue.id));
  const statusIconHtml = isOpen
    ? '<img src="assets/open-icon.png" alt="Open" class="w-8 h-8 flex-shrink-0 object-contain">'
    : '<img src="assets/closed-icon.png" alt="Closed" class="w-8 h-8 flex-shrink-0 object-contain">';
  card.innerHTML = `
    <div class="flex justify-between items-start mb-3">
      ${statusIconHtml}
      <span class="px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${priorityTagClass}">${escapeHtml(issue.priority || 'N/A')}</span>
    </div>
    <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">${escapeHtml(issue.title)}</h3>
    <p class="text-sm text-gray-600 mb-3 line-clamp-2">${escapeHtml(issue.description || '')}</p>
    <div class="flex flex-wrap gap-1 mb-3">
      ${labels.map(l => `<span class="px-2 py-0.5 rounded text-xs font-medium ${getLabelClass(l)}" style="background-color: ${getLabelBgStyle(l)}"># ${escapeHtml(l)}</span>`).join('')}
    </div>
    <div class="text-xs text-gray-500 pt-2 border-t border-gray-100">
      <span>#${issue.id} by ${escapeHtml(issue.author || '-')}</span>
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

async function showIssueModal(issueId) {
  try {
    const response = await fetch(`${API_BASE}/issue/${issueId}`);
    const result = await response.json();

    if (result.status === 'success' && result.data) {
      const issue = result.data;
      const statusText = issue.status === 'open' ? 'Opened' : 'Closed';
      const metaDate = formatDateModal(issue.createdAt);

      document.getElementById('modalTitle').textContent = issue.title;
      document.getElementById('modalMeta').textContent = `${statusText} • Opened by ${issue.author || '-'} • ${metaDate}`;
      document.getElementById('modalDescription').textContent = issue.description || 'No description';
      document.getElementById('modalAssignee').textContent = issue.assignee || '-';

      const priorityEl = document.getElementById('modalPriority');
      const priorityClass = getModalPriorityClass(issue.priority);
      priorityEl.innerHTML = `<span class="px-2 py-0.5 rounded text-xs font-semibold uppercase ${priorityClass}">${escapeHtml(issue.priority || '-')}</span>`;

      const labelsEl = document.getElementById('modalLabels');
      const labels = Array.isArray(issue.labels) ? issue.labels : [];
      labelsEl.innerHTML = labels.map(l => {
        const cls = getModalLabelClass(l);
        return `<span class="px-2 py-1 rounded text-xs font-medium text-white ${cls}">${escapeHtml(l).toUpperCase()}</span>`;
      }).join('');

      issueModal.classList.remove('hidden');
      issueModal.classList.add('flex');
    }
  } catch (error) {
    console.error('Error loading issue:', error);
  }
}

function hideIssueModal() {
  issueModal.classList.add('hidden');
  issueModal.classList.remove('flex');
}

function formatDateModal(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getModalPriorityClass(priority) {
  const p = (priority || '').toLowerCase();
  if (p === 'high') return 'bg-red-500';
  if (p === 'medium') return 'bg-orange-500';
  if (p === 'low') return 'bg-purple-500';
  return 'bg-gray-500';
}

function getModalLabelClass(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('bug')) return 'bg-green-600';
  if (l.includes('help wanted')) return 'bg-amber-500';
  if (l.includes('enhancement')) return 'bg-blue-500';
  if (l.includes('documentation')) return 'bg-blue-400';
  return 'bg-gray-500';
}

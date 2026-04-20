const STORAGE_KEYS = {
  users: 'dxir_users',
  submissions: 'dxir_submissions',
  session: 'dxir_session',
};

const ADMIN = {
  username: 'dxiradmin',
  password: 'Jqi200502!',
};

const PLANS = [
  { ram: '1GB', price: 59, players: '2–4 players', bestFor: 'Small private worlds, testing, and lightweight gameplay.' },
  { ram: '2GB', price: 89, players: '5–8 players', bestFor: 'Friends-only servers with a stable Vanilla or Paper setup.' },
  { ram: '3GB', price: 119, players: '8–12 players', bestFor: 'Balanced performance for active small communities.' },
  { ram: '4GB', price: 149, players: '12–18 players', bestFor: 'Smooth performance for plugins, moderate farms, and events.' },
  { ram: '5GB', price: 179, players: '18–28 players', bestFor: 'Bigger worlds with more players and stronger plugin packs.' },
  { ram: '6GB', price: 209, players: '28–40 players', bestFor: 'The best value for busy SMPs, minigames, and mod-lite setups.' },
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readJSON(STORAGE_KEYS.users, []);
}

function setUsers(users) {
  writeJSON(STORAGE_KEYS.users, users);
}

function getSubmissions() {
  return readJSON(STORAGE_KEYS.submissions, []);
}

function setSubmissions(submissions) {
  writeJSON(STORAGE_KEYS.submissions, submissions);
}

function getSession() {
  return readJSON(STORAGE_KEYS.session, null);
}

function setSession(session) {
  writeJSON(STORAGE_KEYS.session, session);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function formatPrice(value) {
  return `₱${value}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function statusBadge(status) {
  const normalized = String(status || 'Pending').toLowerCase();
  return `<span class="badge ${normalized}">${normalized.charAt(0).toUpperCase() + normalized.slice(1)}</span>`;
}

function renderLogo(targets = '.js-logo') {
  const nodes = typeof targets === 'string' ? $$(targets) : targets;
  nodes.forEach((node) => {
    const label = node.dataset.label || 'DXIR Hosting';
    node.innerHTML = `
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" role="img" aria-label="DXIR Hosting logo">
          <path d="M6 9.25L12 5l6 4.25v7.5L12 21l-6-4.25v-7.5Z" stroke="white" stroke-width="1.6"/>
          <path d="M8.2 9.4 12 12l3.8-2.6" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 12v4.6" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M12 8.6h.01" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </span>
      <span>
        DXIR Hosting
        <small>${label !== 'DXIR Hosting' ? escapeHTML(label) : 'Reliable Minecraft Hosting Made Simple'}</small>
      </span>
    `;
  });
}

function renderPricingCards(target) {
  if (!target) return;
  target.innerHTML = PLANS.map((plan) => `
    <article class="pricing-card">
      <div class="plan-pill">Minecraft Hosting • ${escapeHTML(plan.ram)}</div>
      <h3>${escapeHTML(plan.ram)} Plan</h3>
      <div class="price">${formatPrice(plan.price)} <small>/ month</small></div>
      <div class="help" style="margin-bottom:10px;">Recommended for about <strong style="color:var(--text);">${escapeHTML(plan.players)}</strong>.</div>
      <p>${escapeHTML(plan.bestFor)}</p>
      <div style="margin-top:18px;">
        <a class="btn btn-primary" href="register.html">Choose Plan</a>
      </div>
    </article>
  `).join('');
}

function getPlanOptions(selectedValue = '') {
  return ['Select a plan', ...PLANS.map((plan) => plan.ram)].map((plan) => {
    const value = plan === 'Select a plan' ? '' : plan;
    const selected = value === selectedValue ? 'selected' : '';
    return `<option value="${escapeHTML(value)}" ${selected}>${escapeHTML(plan)}</option>`;
  }).join('');
}

function seedWithDemoState() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) setUsers([]);
  if (!localStorage.getItem(STORAGE_KEYS.submissions)) setSubmissions([]);
}

function setMessage(el, type, text) {
  if (!el) return;
  el.className = type === 'error' ? 'error' : 'success';
  el.textContent = text;
  el.hidden = false;
}

function hideMessage(el) {
  if (!el) return;
  el.hidden = true;
  el.textContent = '';
}

function loginUser(session) {
  setSession(session);
  window.location.href = session.role === 'admin' ? 'admin.html' : 'dashboard.html';
}

function requireSession(expectedRole) {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  if (expectedRole && session.role !== expectedRole) {
    window.location.href = session.role === 'admin' ? 'admin.html' : 'dashboard.html';
    return null;
  }
  return session;
}

function wireAuthControls() {
  const logoutButtons = $$('.js-logout');
  logoutButtons.forEach((button) => {
    button.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  });

  const navState = $$('.js-session-state');
  const session = getSession();
  navState.forEach((node) => {
    if (!session) {
      node.innerHTML = '<a href="login.html">Login</a><a href="register.html" class="btn btn-primary" style="padding:10px 16px;">Register</a>';
      return;
    }

    const dashboardHref = session.role === 'admin' ? 'admin.html' : 'dashboard.html';
    node.innerHTML = `
      <a href="${dashboardHref}">${session.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}</a>
      <button class="js-logout" type="button">Logout</button>
    `;
  });

  $$('.js-session-state .js-logout').forEach((button) => {
    button.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  });
}

function setupIndexPage() {
  renderLogo();
  renderPricingCards($('#pricing-grid'));
}

function setupRegisterPage() {
  renderLogo();
  const form = $('#register-form');
  if (!form) return;
  const message = $('#register-message');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hideMessage(message);

    const formData = new FormData(form);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '');
    const confirm = String(formData.get('confirm') || '');

    if (username.length < 3) return setMessage(message, 'error', 'Username must be at least 3 characters.');
    if (password.length < 6) return setMessage(message, 'error', 'Password must be at least 6 characters.');
    if (password !== confirm) return setMessage(message, 'error', 'Passwords do not match.');

    const users = getUsers();
    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase()) || username.toLowerCase() === ADMIN.username.toLowerCase()) {
      return setMessage(message, 'error', 'That username is already taken.');
    }

    users.push({
      username,
      password,
      createdAt: new Date().toISOString(),
    });

    setUsers(users);
    setMessage(message, 'success', 'Account created successfully. You can now log in.');
    form.reset();
    setTimeout(() => {
      window.location.href = `login.html?username=${encodeURIComponent(username)}`;
    }, 700);
  });
}

function setupLoginPage() {
  renderLogo();
  const form = $('#login-form');
  if (!form) return;
  const message = $('#login-message');

  const params = new URLSearchParams(window.location.search);
  const suggestedUsername = params.get('username');
  if (suggestedUsername && form.username) form.username.value = suggestedUsername;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hideMessage(message);

    const formData = new FormData(form);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '');

    if (!username || !password) return setMessage(message, 'error', 'Please enter your username and password.');

    if (username === ADMIN.username && password === ADMIN.password) {
      loginUser({ role: 'admin', username });
      return;
    }

    const user = getUsers().find((entry) => entry.username.toLowerCase() === username.toLowerCase() && entry.password === password);
    if (!user) {
      return setMessage(message, 'error', 'Invalid username or password.');
    }

    loginUser({ role: 'user', username: user.username });
  });
}

function setupDashboardPage() {
  renderLogo();
  const session = requireSession('user');
  if (!session) return;
  $('#welcome-name').textContent = session.username;

  const planSelect = $('#plan-select');
  const emailInput = $('#proof-email');
  if (planSelect) {
    planSelect.innerHTML = getPlanOptions();
    const stored = sessionStorage.getItem('dxir_selected_plan');
    if (stored) planSelect.value = stored;
    planSelect.addEventListener('change', () => {
      sessionStorage.setItem('dxir_selected_plan', planSelect.value);
      const proofUsername = $('#proof-username');
      if (proofUsername && !proofUsername.value) proofUsername.value = session.username;
    });
  }

  const fullName = $('#full-name');
  const proofUsername = $('#proof-username');
  if (proofUsername && !proofUsername.value) proofUsername.value = session.username;
  if (fullName && !fullName.value) fullName.value = session.username;
  const storedEmail = sessionStorage.getItem('dxir_contact_email');
  if (emailInput && storedEmail && !emailInput.value) emailInput.value = storedEmail;
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      sessionStorage.setItem('dxir_contact_email', emailInput.value.trim());
    });
  }

  const form = $('#proof-form');
  const message = $('#proof-message');
  const preview = $('#proof-preview');
  const fileInput = $('#proof-file');

  const updatePreview = (file) => {
    if (!preview) return;
    if (!file) {
      preview.innerHTML = '<div class="help">Upload an image or document proof to see a preview here.</div>';
      return;
    }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        preview.innerHTML = `<img src="${reader.result}" alt="Proof preview">`;
      };
      reader.readAsDataURL(file);
    } else {
      preview.innerHTML = `<div class="help">Selected file: <strong>${escapeHTML(file.name)}</strong></div>`;
    }
  };

  if (fileInput) {
    fileInput.addEventListener('change', () => updatePreview(fileInput.files?.[0]));
  }

  const renderUserSubmissions = () => {
    const list = $('#user-submissions');
    if (!list) return;
    const submissions = getSubmissions().filter((entry) => entry.username === session.username).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!submissions.length) {
      list.innerHTML = '<div class="empty-state">No proof-of-payment submissions yet. Choose a plan and upload your receipt after sending your GCash payment.</div>';
      return;
    }

    list.innerHTML = submissions.map((entry) => `
      <div class="submission-card">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <strong style="font-size:1.05rem; color: var(--text);">${escapeHTML(entry.plan)} Plan</strong>
            <div class="muted" style="margin-top:4px;">Reference: ${escapeHTML(entry.reference || '—')}</div>
            <div class="help" style="margin-top:6px;">E-mail: ${escapeHTML(entry.email || '—')}</div>
          </div>
          ${statusBadge(entry.status)}
        </div>
        <p style="margin:12px 0 0;">${escapeHTML(entry.fullName || session.username)} • ${escapeHTML(entry.proofName || 'Uploaded file')}</p>
        <div class="help">Submitted at ${new Date(entry.createdAt).toLocaleString()}</div>
      </div>
    `).join('');
  };

  renderUserSubmissions();

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideMessage(message);

      const formData = new FormData(form);
      const fullNameValue = String(formData.get('fullName') || '').trim();
      const usernameValue = String(formData.get('username') || '').trim();
      const emailValue = String(formData.get('email') || '').trim();
      const plan = String(formData.get('plan') || '').trim();
      const reference = String(formData.get('reference') || '').trim();
      const file = fileInput?.files?.[0];

      if (!fullNameValue) return setMessage(message, 'error', 'Please enter your name.');
      if (!usernameValue) return setMessage(message, 'error', 'Please enter your username.');
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return setMessage(message, 'error', 'Please enter a valid e-mail address.');
      if (!plan) return setMessage(message, 'error', 'Please select a hosting plan.');
      if (!reference) return setMessage(message, 'error', 'Please enter your GCash reference number.');
      if (!file) return setMessage(message, 'error', 'Please upload your proof of payment.');
      if (file.size > 2.5 * 1024 * 1024) return setMessage(message, 'error', 'Please upload a file smaller than 2.5MB for this demo site.');

      const reader = new FileReader();
      reader.onload = () => {
        const submissions = getSubmissions();
        submissions.unshift({
          id: crypto.randomUUID(),
          fullName: fullNameValue,
          username: usernameValue,
          email: emailValue,
          plan,
          reference,
          proofName: file.name,
          proofType: file.type || 'application/octet-stream',
          proofData: reader.result,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        });
        setSubmissions(submissions);
        setMessage(message, 'success', 'Proof submitted successfully. Waiting for admin review.');
        form.reset();
        if (fullName) fullName.value = session.username;
        if (proofUsername) proofUsername.value = session.username;
        if (emailInput) emailInput.value = emailValue;
        if (planSelect) planSelect.value = plan;
        updatePreview(null);
        renderUserSubmissions();
        sessionStorage.setItem('dxir_selected_plan', plan);
        sessionStorage.setItem('dxir_contact_email', emailValue);
      };
      reader.readAsDataURL(file);
    });
  }

  $('#gcash-number').textContent = '09455897276';
  $('#gcash-name').textContent = 'J***s I.';
  $('#selected-plan-note').textContent = 'Choose a plan first, then pay via GCash and upload proof below.';
}

function setupAdminPage() {
  renderLogo();
  const session = requireSession('admin');
  if (!session) return;
  $('#admin-name').textContent = session.username;

  const renderUsersTable = () => {
    const users = getUsers().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const tbody = $('#users-tbody');
    if (!tbody) return;
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="3">No registered users yet.</td></tr>';
      return;
    }
    tbody.innerHTML = users.map((user) => `
      <tr>
        <td>${escapeHTML(user.username)}</td>
        <td>Registered user</td>
        <td>${new Date(user.createdAt).toLocaleString()}</td>
      </tr>
    `).join('');
  };

  const renderSubmissions = () => {
    const submissions = getSubmissions().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const wrap = $('#admin-submissions');
    if (!wrap) return;

    if (!submissions.length) {
      wrap.innerHTML = '<div class="empty-state">No proof submissions yet.</div>';
      return;
    }

    wrap.innerHTML = submissions.map((entry) => {
      const preview = entry.proofType && entry.proofType.startsWith('image/')
        ? `<img src="${entry.proofData}" alt="${escapeHTML(entry.proofName)}" style="border-radius:12px;max-height:180px;object-fit:contain;">`
        : `<div class="help">File: <strong>${escapeHTML(entry.proofName)}</strong></div>`;

      return `
        <article class="submission-card">
          <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <div>
              <strong style="font-size:1.03rem; color: var(--text);">${escapeHTML(entry.fullName)}</strong>
              <div class="help">@${escapeHTML(entry.username)} • Email: ${escapeHTML(entry.email || '—')} • Plan: ${escapeHTML(entry.plan)} • Ref: ${escapeHTML(entry.reference)}</div>
            </div>
            ${statusBadge(entry.status)}
          </div>
          <div class="preview" style="margin-top:14px;">${preview}</div>
          <div class="help" style="margin-top:12px;">Submitted at ${new Date(entry.createdAt).toLocaleString()}</div>
          <div class="admin-action-bar">
            <button class="btn btn-success js-update-status" data-id="${escapeHTML(entry.id)}" data-status="Approved" type="button">Approve</button>
            <button class="btn btn-secondary js-update-status" data-id="${escapeHTML(entry.id)}" data-status="Pending" type="button">Set Pending</button>
            <button class="btn btn-danger js-update-status" data-id="${escapeHTML(entry.id)}" data-status="Rejected" type="button">Reject</button>
          </div>
        </article>
      `;
    }).join('');

    $$('.js-update-status').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        const status = button.dataset.status;
        const submissions = getSubmissions();
        const target = submissions.find((item) => item.id === id);
        if (!target) return;
        target.status = status;
        setSubmissions(submissions);
        renderSubmissions();
      });
    });
  };

  renderUsersTable();
  renderSubmissions();

  const stats = {
    users: getUsers().length,
    submissions: getSubmissions().length,
    approved: getSubmissions().filter((item) => item.status === 'Approved').length,
  };

  $('#admin-stats').innerHTML = `
    <div class="admin-mini-stat"><strong>${stats.users}</strong><span>Registered accounts</span></div>
    <div class="admin-mini-stat"><strong>${stats.submissions}</strong><span>Proof submissions</span></div>
    <div class="admin-mini-stat"><strong>${stats.approved}</strong><span>Approved orders</span></div>
  `;
}

function bootstrap() {
  seedWithDemoState();
  wireAuthControls();
  const page = document.body.dataset.page;
  if (page === 'home') setupIndexPage();
  if (page === 'register') setupRegisterPage();
  if (page === 'login') setupLoginPage();
  if (page === 'dashboard') setupDashboardPage();
  if (page === 'admin') setupAdminPage();
}

window.addEventListener('DOMContentLoaded', bootstrap);



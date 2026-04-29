// ============================================================
// admin.js — Admin dashboard, assign tasks, manage users, settings
// ============================================================

function adminNav(view, el) {
  setActiveNav('s-admin', el);
  const content = document.getElementById('admin-content');
  if (view === 'dashboard') content.innerHTML = renderAdminDashboard();
  if (view === 'assign')    content.innerHTML = renderAssignTask();
  if (view === 'users')     content.innerHTML = renderManageUsers();
  if (view === 'settings')  content.innerHTML = renderAdminSettings();
}

// ── Dashboard ───────────────────────────────────────────────

function renderAdminDashboard() {
  const total   = DB.tasks.length;
  const done    = DB.tasks.filter(t => t.status === 'done').length;
  const taskers = getTaskers().length;

  const rows = DB.tasks.length
    ? DB.tasks.map(t => `
      <div class="task-row">
        <div class="task-info">
          <div class="task-title">${t.title}</div>
          <div class="task-meta">
            Billable: ${fmtMinutes(t.billable)} &nbsp;|&nbsp;
            Assigned to: ${t.assignedUsers.join(', ')}
            ${t.uploaded ? `&nbsp;|&nbsp; File: ${t.uploaded}` : ''}
          </div>
        </div>
        <span class="badge ${t.status}">${t.status}</span>
      </div>`).join('')
    : '<p class="empty-state">No tasks created yet.</p>';

  return `
    <h2 class="section-title">Overview</h2>
    <div class="grid-3 mb-lg">
      ${metricCard('Total tasks', total)}
      ${metricCard('Completed', done)}
      ${metricCard('Taskers', taskers)}
    </div>
    <h2 class="section-title">All tasks</h2>
    <div class="card">${rows}</div>`;
}

// ── Assign task ─────────────────────────────────────────────

function renderAssignTask() {
  const taskerOpts = getTaskers()
    .filter(([, v]) => !v.disabled)
    .map(([k, v]) => `<option value="${k}">${v.display} (${k})</option>`)
    .join('');

  return `
    <h2 class="section-title">Assign new task</h2>
    <div class="card form-card">
      <div class="field">
        <label for="at-title">Task title</label>
        <input type="text" id="at-title" placeholder="e.g. Drone footage batch B">
      </div>
      <div class="field">
        <label for="at-billable">Billable minutes</label>
        <input type="text" id="at-billable" placeholder="e.g. 90">
      </div>
      <div class="field">
        <label>Assign to</label>
        <div class="radio-group">
          <label class="radio-opt">
            <input type="radio" name="assign-mode" value="everyone" checked onchange="toggleAssignFields()">
            Everyone (all active taskers)
          </label>
          <label class="radio-opt">
            <input type="radio" name="assign-mode" value="section" onchange="toggleAssignFields()">
            Multiple sections
          </label>
          <label class="radio-opt">
            <input type="radio" name="assign-mode" value="specific" onchange="toggleAssignFields()">
            Specific user
          </label>
        </div>
      </div>
      <div id="assign-section-field" class="field" style="display:none">
        <label for="at-sections">Section IDs (comma separated)</label>
        <input type="text" id="at-sections" placeholder="e.g. section_1, section_2">
      </div>
      <div id="assign-specific-field" class="field" style="display:none">
        <label for="at-specific">Select tasker</label>
        <select id="at-specific">
          <option value="">-- choose --</option>
          ${taskerOpts}
        </select>
      </div>
      <div id="assign-msg" style="display:none"></div>
      <div class="form-actions">
        <button class="btn primary" onclick="doAssignTask()">Assign task</button>
        <button class="btn" onclick="adminNav('dashboard', document.querySelector('#s-admin .nav-item'))">Cancel</button>
      </div>
    </div>`;
}

function toggleAssignFields() {
  const mode = document.querySelector('input[name="assign-mode"]:checked').value;
  document.getElementById('assign-section-field').style.display = mode === 'section'  ? 'block' : 'none';
  document.getElementById('assign-specific-field').style.display = mode === 'specific' ? 'block' : 'none';
}

function doAssignTask() {
  const title    = document.getElementById('at-title').value.trim();
  const billable = document.getElementById('at-billable').value;
  const mode     = document.querySelector('input[name="assign-mode"]:checked').value;

  clearMsg('assign-msg');
  if (!title) { showMsg('assign-msg', 'Please enter a task title.'); return; }

  const sections   = mode === 'section'  ? document.getElementById('at-sections').value  : '';
  const specificUid = mode === 'specific' ? document.getElementById('at-specific').value  : '';

  if (mode === 'specific' && !specificUid) { showMsg('assign-msg', 'Please select a user.'); return; }

  const assignedUsers = resolveAssignedUsers(mode, sections, specificUid);
  if (!assignedUsers.length) { showMsg('assign-msg', 'No active taskers match the selection.'); return; }

  taskCreate({ title, billable, assignTo: mode, assignedUsers });
  showMsg('assign-msg', `Task assigned to: ${assignedUsers.join(', ')}`, 'success');
  setTimeout(() => adminNav('dashboard', document.querySelector('#s-admin .nav-item')), 1200);
}

// ── Manage users ────────────────────────────────────────────

function renderManageUsers() {
  const taskers = getTaskers();

  const rows = taskers.map(([uid, acc]) => `
    <div class="task-row">
      <div class="task-info">
        <div class="task-title">${acc.display} <span class="uid-label">(${uid})</span></div>
        <div class="task-meta">Section: ${acc.section || '—'}</div>
      </div>
      <div class="task-actions">
        <span class="badge ${acc.disabled ? 'disabled' : 'active'}">${acc.disabled ? 'disabled' : 'active'}</span>
        <button class="btn sm ${acc.disabled ? '' : 'danger'}" onclick="promptToggleDisable('${uid}')">
          ${acc.disabled ? 'Enable' : 'Disable'}
        </button>
      </div>
    </div>`).join('');

  return `
    <div class="section-header">
      <h2 class="section-title">User management</h2>
      <button class="btn sm primary" onclick="showCreateUserModal()">+ Create user</button>
    </div>
    <div class="card mb-lg">${rows || '<p class="empty-state">No taskers found.</p>'}</div>`;
}

function promptToggleDisable(uid) {
  const acc = DB.accounts[uid];
  showModal(`
    <div class="modal-title">${acc.disabled ? 'Enable' : 'Disable'} account</div>
    <p class="modal-body">
      ${acc.disabled ? 'Re-enable' : 'Disable'} account for <strong>${acc.display}</strong>?
    </p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="confirmToggleDisable('${uid}')">Confirm</button>
    </div>`);
}

function confirmToggleDisable(uid) {
  userToggleDisable(uid);
  closeModal();
  adminNav('users', document.querySelectorAll('#s-admin .nav-item')[2]);
}

function showCreateUserModal() {
  showModal(`
    <div class="modal-title">Create new user</div>
    <div class="field">
      <label for="nu-user">Username</label>
      <input type="text" id="nu-user" placeholder="e.g. tasker3">
    </div>
    <div class="field">
      <label for="nu-display">Display name</label>
      <input type="text" id="nu-display" placeholder="e.g. Tasker Three">
    </div>
    <div class="field">
      <label for="nu-role">Role</label>
      <select id="nu-role">
        <option value="tasker">Tasker</option>
        <option value="admin">Admin</option>
      </select>
    </div>
    <div class="field">
      <label for="nu-pass">Password</label>
      <input type="password" id="nu-pass" placeholder="Set initial password">
    </div>
    <div id="cu-msg" style="display:none"></div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="doCreateUser()">Create user</button>
    </div>`);
}

function doCreateUser() {
  const username = document.getElementById('nu-user').value.trim();
  const display  = document.getElementById('nu-display').value.trim();
  const role     = document.getElementById('nu-role').value;
  const password = document.getElementById('nu-pass').value;

  clearMsg('cu-msg');
  if (!username || !display || !password) { showMsg('cu-msg', 'All fields are required.'); return; }

  const result = userCreate({ username, display, role, password });
  if (!result.ok) { showMsg('cu-msg', result.error); return; }

  closeModal();
  adminNav('users', document.querySelectorAll('#s-admin .nav-item')[2]);
}

// ── Settings ────────────────────────────────────────────────

function renderAdminSettings() {
  return renderChangePasswordForm('admin');
}

function submitAdminPasswordChange() {
  const result = authChangePassword(
    DB.session.currentUid,
    document.getElementById('pw-old').value,
    document.getElementById('pw-new').value,
    document.getElementById('pw-confirm').value
  );
  if (!result.ok) { showMsg('pw-msg', result.error); return; }
  showMsg('pw-msg', 'Password updated successfully!', 'success');
  document.getElementById('pw-old').value = '';
  document.getElementById('pw-new').value = '';
  document.getElementById('pw-confirm').value = '';
}

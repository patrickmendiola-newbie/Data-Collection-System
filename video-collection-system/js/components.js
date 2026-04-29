// ============================================================
// components.js — Shared reusable HTML component renderers
// ============================================================

// ── Metric card ─────────────────────────────────────────────
function metricCard(label, value) {
  return `
    <div class="metric">
      <div class="metric-lbl">${label}</div>
      <div class="metric-val">${value}</div>
    </div>`;
}

// ── Change password form (used by both tasker & admin) ───────
function renderChangePasswordForm(role) {
  const cancelFn = role === 'admin'
    ? `adminNav('dashboard', document.querySelector('#s-admin .nav-item'))`
    : `taskerNav('dashboard', document.querySelector('#s-tasker .nav-item'))`;

  const submitFn = role === 'admin'
    ? 'submitAdminPasswordChange()'
    : 'submitTaskerPasswordChange()';

  return `
    <h2 class="section-title">Settings</h2>
    <div class="card form-card">
      <div class="form-group-title">Change password</div>
      <div class="field">
        <label for="pw-old">Old password</label>
        <input type="password" id="pw-old" placeholder="Current password">
      </div>
      <div class="field">
        <label for="pw-new">New password</label>
        <input type="password" id="pw-new" placeholder="New password">
      </div>
      <div class="field">
        <label for="pw-confirm">Confirm new password</label>
        <input type="password" id="pw-confirm" placeholder="Confirm new password">
      </div>
      <div id="pw-msg" style="display:none"></div>
      <div class="form-actions">
        <button class="btn primary" onclick="${submitFn}">Update password</button>
        <button class="btn" onclick="${cancelFn}">Cancel</button>
      </div>
    </div>`;
}

// ── Avatar circle ────────────────────────────────────────────
function avatarHTML(name, role) {
  const cls = role === 'admin' ? 'av-admin' : 'av-tasker';
  return `<div class="avatar ${cls}">${initials(name)}</div>`;
}

// ── Status badge ─────────────────────────────────────────────
function badgeHTML(label, cls) {
  return `<span class="badge ${cls}">${label}</span>`;
}

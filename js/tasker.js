// ============================================================
// tasker.js — Tasker dashboard, upload, settings
// ============================================================

function taskerNav(view, el) {
  setActiveNav('s-tasker', el);
  const content = document.getElementById('tasker-content');
  if (view === 'dashboard') content.innerHTML = renderTaskerDashboard();
  if (view === 'settings')  content.innerHTML = renderTaskerSettings();
}

// ── Dashboard ───────────────────────────────────────────────

function renderTaskerDashboard() {
  const tasks = tasksForUser(DB.session.currentUid);
  const done  = tasks.filter(t => t.status === 'done').length;

  const rows = tasks.length
    ? tasks.map(renderTaskRow).join('')
    : '<p class="empty-state">No tasks assigned yet. Check back later.</p>';

  return `
    <h2 class="section-title">My tasks</h2>
    <div class="grid-3 mb-lg">
      ${metricCard('Assigned', tasks.length)}
      ${metricCard('Completed', done)}
      ${metricCard('Pending', tasks.length - done)}
    </div>
    <div class="card">${rows}</div>`;
}

function renderTaskRow(t) {
  const progress = fmtProgress(t);
  const uploadBtn = t.status !== 'done'
    ? `<button class="btn sm" onclick="openUploadModal(${t.id})">Upload</button>`
    : `<span class="filename">${t.uploaded}</span>`;

  return `
    <div class="task-row">
      <div class="task-info">
        <div class="task-title">${t.title}</div>
        <div class="task-meta">Billable: ${fmtMinutes(t.billable)}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
      </div>
      <div class="task-actions">
        <span class="badge ${t.status}">${t.status}</span>
        ${uploadBtn}
      </div>
    </div>`;
}

// ── Upload modal ────────────────────────────────────────────

function openUploadModal(taskId) {
  const t = DB.tasks.find(x => x.id === taskId);
  clearPickedFile();

  showModal(`
    <div class="modal-title">Upload video</div>
    <p class="modal-body"><strong>${t.title}</strong><br>Billable time: ${fmtMinutes(t.billable)}</p>
    <div class="file-drop" onclick="simulateFilePick(${taskId})">
      <div class="file-drop-icon">+</div>
      <div>Click to select video file</div>
      <div class="file-drop-hint">MP4, MOV, AVI supported</div>
    </div>
    <div id="file-chosen-${taskId}" class="file-chosen"></div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" id="confirm-upload-btn-${taskId}"
        onclick="confirmUpload(${taskId})" disabled>Confirm upload</button>
    </div>`);
}

function confirmUpload(taskId) {
  const filename = getPickedFile() || 'video.mp4';
  taskUpload(taskId, filename);
  closeModal();
  taskerNav('dashboard', document.querySelector('#s-tasker .nav-item'));
}

// ── Settings ────────────────────────────────────────────────

function renderTaskerSettings() {
  return renderChangePasswordForm('tasker');
}

function submitTaskerPasswordChange() {
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

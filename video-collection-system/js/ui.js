// ============================================================
// ui.js — Shared UI utilities for Video Collection System
// ============================================================

// ── Screen routing ──────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ── Modal system ────────────────────────────────────────────

function showModal(html) {
  let layer = document.getElementById('modal-layer');
  if (!layer) { layer = document.createElement('div'); layer.id = 'modal-layer'; document.body.appendChild(layer); }
  layer.innerHTML = `
    <div class="modal-bg" onclick="handleModalBg(event)">
      <div class="modal" role="dialog" aria-modal="true">${html}</div>
    </div>`;
}

function closeModal() {
  const layer = document.getElementById('modal-layer');
  if (layer) layer.innerHTML = '';
}

function handleModalBg(e) {
  if (e.target.classList.contains('modal-bg')) closeModal();
}

// ── Inline messages ─────────────────────────────────────────

function showMsg(elementId, text, type = 'error') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.display = 'block';
  el.className = type === 'success' ? 'msg-success' : 'msg-error';
  el.textContent = text;
}

function clearMsg(elementId) {
  const el = document.getElementById(elementId);
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

// ── Navigation highlight ────────────────────────────────────

function setActiveNav(scope, el) {
  document.querySelectorAll(`#${scope} .nav-item`).forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
}

// ── Format helpers ──────────────────────────────────────────

function fmtMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtProgress(task) {
  return task.status === 'done' ? 100 : 0;
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── File simulation ─────────────────────────────────────────

const FAKE_FILES = ['video_clip.mp4', 'footage_raw.mov', 'recording.avi', 'capture_hd.mp4', 'session_output.mov'];
let _pickedFile = null;

function simulateFilePick(taskId) {
  _pickedFile = FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)];
  const el = document.getElementById('file-chosen-' + taskId);
  if (el) el.textContent = 'Selected: ' + _pickedFile;
  const btn = document.getElementById('confirm-upload-btn-' + taskId);
  if (btn) btn.removeAttribute('disabled');
}

function getPickedFile() { return _pickedFile; }
function clearPickedFile() { _pickedFile = null; }

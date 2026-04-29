// ============================================================
// auth.js — Login / logout logic
// ============================================================

function doLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;

  clearMsg('login-err');
  const result = authLogin(username, password);

  if (!result.ok) {
    showMsg('login-err', result.error);
    return;
  }

  if (result.role === 'admin') {
    document.getElementById('admin-name-badge').textContent = DB.session.currentUser;
    showScreen('s-admin');
    adminNav('dashboard', document.querySelector('#s-admin .nav-item'));
  } else {
    document.getElementById('tasker-name-badge').textContent = DB.session.currentUser;
    showScreen('s-tasker');
    taskerNav('dashboard', document.querySelector('#s-tasker .nav-item'));
  }
}

function showSignoutModal() {
  showModal(`
    <div class="modal-title">Sign out?</div>
    <p class="modal-body">You will be returned to the login screen.</p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="doSignout()">Sign out</button>
    </div>`);
}

function doSignout() {
  authLogout();
  closeModal();
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  clearMsg('login-err');
  showScreen('s-login');
}

// Allow Enter key to submit login
document.addEventListener('DOMContentLoaded', () => {
  const passInput = document.getElementById('login-pass');
  if (passInput) passInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  const userInput = document.getElementById('login-user');
  if (userInput) userInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});

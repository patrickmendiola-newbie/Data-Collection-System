// ============================================================
// data.js — Central state store for Video Collection System
// ============================================================

const DB = {
  accounts: {
    admin: { role: 'admin', display: 'Admin User', section: null, disabled: false },
    tasker1: { role: 'tasker', display: 'Tasker One', section: 'section_1', disabled: false },
    tasker2: { role: 'tasker', display: 'Tasker Two', section: 'section_2', disabled: false }
  },

  passwords: {
    admin: 'admin123',
    tasker1: 'pass123',
    tasker2: 'pass123'
  },

  tasks: [
    {
      id: 1,
      title: 'Drone footage batch A',
      billable: 120,
      assignTo: 'everyone',
      assignedUsers: ['tasker1', 'tasker2'],
      uploaded: null,
      status: 'pending'
    },
    {
      id: 2,
      title: 'Street interview series',
      billable: 90,
      assignTo: 'specific',
      assignedUsers: ['tasker1'],
      uploaded: null,
      status: 'pending'
    },
    {
      id: 3,
      title: 'Product showcase clips',
      billable: 60,
      assignTo: 'section',
      assignedUsers: ['tasker2'],
      uploaded: 'showcase_final.mp4',
      status: 'done'
    }
  ],

  taskIdCounter: 4,

  // Session state
  session: {
    currentUid: null,
    currentUser: null,
    currentRole: null
  }
};

// ── Auth helpers ────────────────────────────────────────────

function authLogin(username, password) {
  const acc = DB.accounts[username];
  if (!acc) return { ok: false, error: 'Unknown username.' };
  if (DB.passwords[username] !== password) return { ok: false, error: 'Incorrect password.' };
  if (acc.disabled) return { ok: false, error: 'Account is disabled. Contact admin.' };

  DB.session.currentUid = username;
  DB.session.currentUser = acc.display;
  DB.session.currentRole = acc.role;
  return { ok: true, role: acc.role };
}

function authLogout() {
  DB.session.currentUid = null;
  DB.session.currentUser = null;
  DB.session.currentRole = null;
}

function authChangePassword(uid, oldPw, newPw, confirmPw) {
  if (DB.passwords[uid] !== oldPw) return { ok: false, error: 'Old password is incorrect.' };
  if (!newPw) return { ok: false, error: 'New password cannot be empty.' };
  if (newPw !== confirmPw) return { ok: false, error: 'Passwords do not match.' };
  DB.passwords[uid] = newPw;
  return { ok: true };
}

// ── Task helpers ────────────────────────────────────────────

function tasksForUser(uid) {
  return DB.tasks.filter(t => t.assignedUsers.includes(uid));
}

function taskCreate({ title, billable, assignTo, assignedUsers }) {
  const task = {
    id: DB.taskIdCounter++,
    title,
    billable: parseInt(billable) || 60,
    assignTo,
    assignedUsers,
    uploaded: null,
    status: 'pending'
  };
  DB.tasks.push(task);
  return task;
}

function taskUpload(taskId, filename) {
  const t = DB.tasks.find(x => x.id === taskId);
  if (!t) return false;
  t.uploaded = filename;
  t.status = 'done';
  return true;
}

function resolveAssignedUsers(mode, sectionsInput, specificUid) {
  const active = Object.entries(DB.accounts)
    .filter(([, v]) => v.role === 'tasker' && !v.disabled);

  if (mode === 'everyone') return active.map(([k]) => k);

  if (mode === 'section') {
    const secs = sectionsInput.split(',').map(s => s.trim()).filter(Boolean);
    return active.filter(([, v]) => secs.includes(v.section)).map(([k]) => k);
  }

  if (mode === 'specific') return specificUid ? [specificUid] : [];
  return [];
}

// ── User helpers ────────────────────────────────────────────

function userCreate({ username, display, role, password }) {
  if (DB.accounts[username]) return { ok: false, error: 'Username already exists.' };
  DB.accounts[username] = {
    role,
    display,
    section: role === 'tasker' ? 'section_new' : null,
    disabled: false
  };
  DB.passwords[username] = password;
  return { ok: true };
}

function userToggleDisable(uid) {
  if (!DB.accounts[uid]) return false;
  DB.accounts[uid].disabled = !DB.accounts[uid].disabled;
  return true;
}

function getTaskers() {
  return Object.entries(DB.accounts).filter(([, v]) => v.role === 'tasker');
}

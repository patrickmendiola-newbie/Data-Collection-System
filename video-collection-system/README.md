# Video Collection System

A role-based web application for managing video upload tasks, built with vanilla HTML, CSS, and JavaScript — no framework or build step required.

---

## Project Structure

```
video-collection-system/
├── index.html          ← Entry point (open this in a browser)
├── css/
│   └── styles.css      ← All styles
└── js/
    ├── data.js         ← Central state store & data helpers
    ├── ui.js           ← Shared UI utilities (modal, screen routing, etc.)
    ├── components.js   ← Reusable HTML component renderers
    ├── auth.js         ← Login / logout logic
    ├── tasker.js       ← Tasker dashboard, upload modal, settings
    └── admin.js        ← Admin dashboard, assign tasks, manage users, settings
```

---

## How to Run

Just open `index.html` in any modern browser. No server needed.

```bash
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it with a simple local server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## Demo Credentials

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | Admin |
| tasker1  | pass123  | Tasker|
| tasker2  | pass123  | Tasker|

---

## Features by Role

### Tasker
- View tasks assigned by admin, with billable time and progress
- Upload video files per task (simulated file picker)
- Change account password

### Admin
- Dashboard overview (total tasks, completed count, tasker count)
- Assign tasks to everyone, a specific section, or a specific user
- Create new Admin or Tasker accounts
- Enable / disable existing tasker accounts
- Change account password

---

## File Descriptions

| File | Purpose |
|------|---------|
| `data.js` | Single source of truth: accounts, passwords, tasks, session. All CRUD helpers live here. |
| `ui.js` | Screen switching, modal open/close, inline message display, file simulation helpers. |
| `components.js` | Shared HTML renderers: metric cards, password form, avatar, badge. |
| `auth.js` | `doLogin()`, `doSignout()`, `showSignoutModal()`, password change dispatcher. |
| `tasker.js` | Tasker nav routing, dashboard render, upload modal, settings. |
| `admin.js` | Admin nav routing, dashboard, assign-task form, user management, settings. |
| `styles.css` | Complete stylesheet — variables, layout, components, responsive breakpoints. |

---

## Extending the System

- **Add real backend**: Replace the functions in `data.js` with `fetch()` calls to your API. The rest of the code stays the same.
- **Add file storage**: In `confirmUpload()` inside `tasker.js`, replace the simulated filename with a real `FormData` / `fetch` upload.
- **Add more roles**: Add a new role value in `data.js`, create a new screen in `index.html`, and add a matching nav/render module.
- **Persist state**: Wrap the `DB` object in `localStorage` reads/writes at the top of `data.js`.

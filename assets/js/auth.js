//  LOGIN
// ══════════════════════════════════════════════════════════════

// Default admin + any registered users stored here
const DEFAULT_USERS = { 'admin': 'andina2024' };
let REGISTERED_USERS = JSON.parse(localStorage.getItem('andina_users') || '[]');
// REGISTERED_USERS: [{ nombre, user, email, pass, role }]
// role: 'editor' | 'viewer'  (default 'editor' if not set)

// Session state
let SESSION = { user: '', nombre: '', role: 'editor', isAdmin: false };
const SESSION_STORAGE_KEY = 'andina_session';

// Admin password can be changed and is stored
let ADMIN_PASS = localStorage.getItem('andina_admin_pass') || 'andina2024';

function saveSession(){
  if(SESSION.user){
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      user: SESSION.user,
      nombre: SESSION.nombre,
      role: SESSION.role,
      isAdmin: SESSION.isAdmin
    }));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  updateLogoutVisibility();
}

function updateLogoutVisibility(){
  const on = !!SESSION.user;
  document.querySelectorAll('[data-logout-btn]').forEach(el => { el.hidden = !on; });
}

function hideLoginScreenImmediate(){
  const screen = document.getElementById('login-screen');
  if(!screen) return;
  screen.style.display = 'none';
  screen.style.opacity = '1';
  screen.style.transform = 'none';
}

function showLoginScreen(){
  const screen = document.getElementById('login-screen');
  if(!screen) return;
  screen.style.display = '';
  screen.style.opacity = '1';
  screen.style.transform = 'none';
}

function restoreSession(){
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if(!raw) return false;
    const data = JSON.parse(raw);
    if(!data || !data.user) return false;

    const all = getAllUsers();
    if(!all[data.user]){
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return false;
    }

    if(data.user === 'admin'){
      SESSION = { user: 'admin', nombre: 'Admin', role: 'editor', isAdmin: true };
    } else {
      const reg = REGISTERED_USERS.find(u => u.user.toLowerCase() === data.user);
      if(!reg){
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return false;
      }
      SESSION = {
        user: data.user,
        nombre: reg.nombre,
        role: reg.role || 'editor',
        isAdmin: false
      };
    }

    hideLoginScreenImmediate();
    applyRoleRestrictions();
    updateSidebarUser();
    updateLogoutVisibility();
    return true;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return false;
  }
}

function getAllUsers(){
  const map = { 'admin': ADMIN_PASS };
  REGISTERED_USERS.forEach(u => { map[u.user.toLowerCase()] = u.pass; });
  return map;
}

function saveRegistered(){
  localStorage.setItem('andina_users', JSON.stringify(REGISTERED_USERS));
}

function doLogin(){
  const user = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;
  const err  = document.getElementById('login-error');
  const all  = getAllUsers();

  if(all[user] && all[user] === pass){
    err.style.display = 'none';

    // Set session
    if(user === 'admin'){
      SESSION = { user: 'admin', nombre: 'Admin', role: 'editor', isAdmin: true };
    } else {
      const reg = REGISTERED_USERS.find(u => u.user.toLowerCase() === user);
      SESSION = {
        user,
        nombre: reg ? reg.nombre : user,
        role: reg ? (reg.role || 'editor') : 'editor',
        isAdmin: false
      };
    }

    applyRoleRestrictions();
    updateSidebarUser();
    saveSession();

    const screen = document.getElementById('login-screen');
    screen.style.transition = 'opacity .5s, transform .5s';
    screen.style.opacity = '0';
    screen.style.transform = 'scale(1.04)';
    setTimeout(()=>{ screen.style.display='none'; }, 500);
    showToast('👋 Bienvenido, ' + SESSION.nombre + '!', 'success');
  } else {
    err.style.display = 'block';
    err.style.animation = 'none';
    requestAnimationFrame(()=>{ err.style.animation = 'shake .3s ease'; });
  }
}

function applyRoleRestrictions(){
  const isViewer = SESSION.role === 'viewer';
  const isAdmin  = SESSION.isAdmin;

  // ── Disable all inputs and action buttons for viewers ──────
  const allInputs = document.querySelectorAll(
    '#page-datos input, #page-datos button.btn-primary, #page-datos button.btn-secondary'
  );
  allInputs.forEach(el => {
    el.disabled = isViewer;
    if(isViewer) el.style.opacity = '.5';
    else el.style.opacity = '';
  });

  // Overlay banner for viewer on datos page
  let viewerBanner = document.getElementById('viewer-banner');
  if(!viewerBanner){
    viewerBanner = document.createElement('div');
    viewerBanner.id = 'viewer-banner';
    viewerBanner.className = 'alert warn';
    viewerBanner.innerHTML = '👁 <div><strong>Modo Solo Lectura</strong> — Puedes ver todos los informes e imprimir, pero no puedes modificar los datos. Contacta al administrador si necesitas acceso de edición.</div>';
    viewerBanner.style.marginBottom = '16px';
    const datosPage = document.getElementById('page-datos');
    datosPage.insertBefore(viewerBanner, datosPage.firstChild);
  }
  viewerBanner.style.display = isViewer ? 'flex' : 'none';

  // Hide Ajustes nav for non-admins (only admin manages accounts)
  const navAjustes = document.getElementById('nav-ajustes');
  if(navAjustes) navAjustes.style.display = isAdmin ? '' : 'none';
}

function updateSidebarUser(){
  const label = document.getElementById('sidebar-user-label');
  const role  = document.getElementById('sidebar-role-label');
  if(label) label.textContent = SESSION.nombre || '—';
  if(role){
    if(!SESSION.user){
      role.textContent = '';
      return;
    }
    role.textContent = SESSION.role === 'editor' ? '✏️ Editor' : '👁 Solo Lectura';
    role.style.color = SESSION.role === 'editor' ? '#34D399' : '#FBBF24';
  }
}

function doLogout(){
  SESSION = { user: '', nombre: '', role: 'editor', isAdmin: false };
  saveSession();
  showLoginScreen();

  const userInp = document.getElementById('login-user');
  const passInp = document.getElementById('login-pass');
  if(userInp) userInp.value = '';
  if(passInp){
    passInp.value = '';
    passInp.type = 'password';
  }
  const err = document.getElementById('login-error');
  if(err) err.style.display = 'none';
  const showBtn = document.getElementById('show-btn');
  if(showBtn) showBtn.textContent = '👁';

  const navAjustes = document.getElementById('nav-ajustes');
  if(navAjustes) navAjustes.style.display = '';

  updateSidebarUser();
  if(typeof showPage === 'function') showPage('datos');

  showToast('👋 Sesión cerrada correctamente', 'info');
}

function togglePass(){
  const inp = document.getElementById('login-pass');
  const btn = document.getElementById('show-btn');
  if(inp.type === 'password'){ inp.type='text'; btn.textContent='🙈'; }
  else { inp.type='password'; btn.textContent='👁'; }
}

// ── FORGOT ────────────────────────────────────────────────────
function openForgot(){
  document.getElementById('modal-forgot').classList.add('open');
  document.getElementById('forgot-email').value = '';
  setTimeout(()=>document.getElementById('forgot-email').focus(), 100);
}
function closeForgot(){
  document.getElementById('modal-forgot').classList.remove('open');
}
function sendForgot(){
  const email = document.getElementById('forgot-email').value.trim();
  if(!email){ document.getElementById('forgot-email').focus(); return; }
  // Accept any valid email format
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(!emailOk){
    showToast('⚠️ Ingresa un correo electrónico válido', 'warning');
    return;
  }
  closeForgot();
  showToast('📨 Instrucciones de recuperación enviadas a ' + email, 'info');
}
document.getElementById('modal-forgot').addEventListener('click', function(e){
  if(e.target === this) closeForgot();
});

// ── REGISTER ──────────────────────────────────────────────────
const MAX_USERS = 5;

function openRegister(){
  document.getElementById('modal-register').classList.add('open');
  document.getElementById('reg-nombre').value = '';
  document.getElementById('reg-user').value   = '';
  document.getElementById('reg-email').value  = '';
  document.getElementById('reg-pass').value   = '';
  document.getElementById('reg-error').style.display = 'none';
  renderRegList();
  setTimeout(()=>document.getElementById('reg-nombre').focus(), 100);
}
function closeRegister(){
  document.getElementById('modal-register').classList.remove('open');
}
document.getElementById('modal-register').addEventListener('click', function(e){
  if(e.target === this) closeRegister();
});

function toggleRegPass(){
  const inp = document.getElementById('reg-pass');
  const btn = document.getElementById('reg-show-btn');
  if(inp.type==='password'){ inp.type='text'; btn.textContent='🙈'; }
  else { inp.type='password'; btn.textContent='👁'; }
}

function renderRegList(){
  const counter = document.getElementById('reg-counter');
  const wrap    = document.getElementById('reg-list-wrap');
  const list    = document.getElementById('reg-list');
  const btnReg  = document.getElementById('btn-do-register');
  const count   = REGISTERED_USERS.length;

  counter.textContent = count + ' / ' + MAX_USERS + ' usuarios';
  counter.style.background = count >= MAX_USERS ? '#FEE2E2' : '#F1F5F9';
  counter.style.color      = count >= MAX_USERS ? '#991B1B' : '#64748B';
  counter.style.borderColor= count >= MAX_USERS ? '#FECACA' : '#E2E8F0';

  btnReg.disabled = count >= MAX_USERS;
  btnReg.style.opacity = count >= MAX_USERS ? '.5' : '1';
  btnReg.style.cursor  = count >= MAX_USERS ? 'not-allowed' : 'pointer';

  if(count > 0){
    wrap.style.display = 'block';
    list.innerHTML = REGISTERED_USERS.map((u, i) => `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 12px">
        <div>
          <div style="font-size:.82rem;font-weight:600;color:#1E293B">👤 ${u.nombre}</div>
          <div style="font-size:.72rem;color:#94A3B8;margin-top:1px">@${u.user} · ${u.email}</div>
        </div>
        <button onclick="deleteUser(${i})"
          style="background:#FEF2F2;border:1px solid #FECACA;color:#EF4444;border-radius:6px;
                 padding:4px 10px;font-size:.75rem;font-weight:700;cursor:pointer">
          🗑 Eliminar
        </button>
      </div>`).join('');
  } else {
    wrap.style.display = 'none';
  }
}

function deleteUser(index){
  const u = REGISTERED_USERS[index];
  REGISTERED_USERS.splice(index, 1);
  saveRegistered();
  renderRegList();
  showToast('🗑 Usuario "' + u.user + '" eliminado', 'warning');
}

function showRegError(msg){
  const el = document.getElementById('reg-error');
  el.textContent = '❌ ' + msg;
  el.style.display = 'block';
}

function doRegister(){
  if(REGISTERED_USERS.length >= MAX_USERS){
    showRegError('Límite de 5 usuarios alcanzado. Elimina uno para continuar.');
    return;
  }
  const nombre = document.getElementById('reg-nombre').value.trim();
  const user   = document.getElementById('reg-user').value.trim().toLowerCase();
  const email  = document.getElementById('reg-email').value.trim();
  const pass   = document.getElementById('reg-pass').value;
  const errEl  = document.getElementById('reg-error');
  errEl.style.display = 'none';

  // Validations
  if(!nombre)                  { showRegError('El nombre completo es obligatorio.'); return; }
  if(!user || user.length < 3) { showRegError('El usuario debe tener al menos 3 caracteres.'); return; }
  if(!/^[a-z0-9_\.]+$/.test(user)) { showRegError('El usuario solo puede tener letras, números, _ y .'); return; }
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showRegError('Ingresa un correo electrónico válido.'); return; }
  if(!pass || pass.length < 6) { showRegError('La contraseña debe tener al menos 6 caracteres.'); return; }

  // Duplicate check
  const all = getAllUsers();
  if(all[user]){ showRegError('El usuario "' + user + '" ya existe.'); return; }
  const emailDup = REGISTERED_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
  if(emailDup){ showRegError('El correo electrónico ya está registrado.'); return; }

  // Save
  REGISTERED_USERS.push({ nombre, user, email, pass });
  saveRegistered();

  // Clear fields
  document.getElementById('reg-nombre').value = '';
  document.getElementById('reg-user').value   = '';
  document.getElementById('reg-email').value  = '';
  document.getElementById('reg-pass').value   = '';

  renderRegList();
  showToast('✅ Usuario "' + user + '" registrado correctamente', 'success');
}

// ══════════════════════════════════════════════════════════════
//  AJUSTES — GESTIÓN DE CUENTAS
// ══════════════════════════════════════════════════════════════
let managingUserIndex = null; // index in REGISTERED_USERS currently being managed

function renderAjustes(){
  const panel   = document.getElementById('ajustes-panel');
  const blocked = document.getElementById('ajustes-blocked');

  // Only admin can access settings
  if(!SESSION.isAdmin){
    panel.style.display   = 'none';
    blocked.style.display = 'block';
    return;
  }
  panel.style.display   = 'block';
  blocked.style.display = 'none';

  const count   = REGISTERED_USERS.length;
  const counter = document.getElementById('ajustes-counter');
  if(counter) counter.textContent = count + ' / 5';

  const emptyEl = document.getElementById('ajustes-empty');
  const listEl  = document.getElementById('ajustes-list');
  if(!listEl) return;

  if(count === 0){
    emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = REGISTERED_USERS.map((u, i) => {
    const role     = u.role || 'editor';
    const roleBg   = role === 'editor' ? '#DCFCE7' : '#FEF3C7';
    const roleClr  = role === 'editor' ? '#166534' : '#92400E';
    const roleIcon = role === 'editor' ? '✏️ Editor' : '👁 Solo Lectura';
    return `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
                border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;background:#FAFBFC;
                transition:box-shadow .2s" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'"
                onmouseout="this.style.boxShadow='none'">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0EA5C9,#8B5CF6);
                    display:grid;place-items:center;font-size:1.2rem;flex-shrink:0">👤</div>
        <div>
          <div style="font-weight:700;color:#0B1F3A;font-size:.88rem">${u.nombre}</div>
          <div style="font-size:.72rem;color:#94A3B8;margin-top:2px">
            @${u.user} · ${u.email}
          </div>
          <div style="margin-top:4px">
            <span style="background:${roleBg};color:${roleClr};padding:2px 9px;
                         border-radius:20px;font-size:.65rem;font-weight:700">${roleIcon}</span>
          </div>
        </div>
      </div>
      <button onclick="openManageUser(${i})"
        style="background:var(--navy);color:#fff;border:none;padding:8px 16px;border-radius:8px;
               font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;
               display:flex;align-items:center;gap:6px;transition:opacity .2s"
        onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
        ⚙️ Gestionar
      </button>
    </div>`;
  }).join('');
}

// ── Admin password change ──────────────────────────────────────
function openAdminPassModal(){
  document.getElementById('adm-pass-old').value     = '';
  document.getElementById('adm-pass-new').value     = '';
  document.getElementById('adm-pass-confirm').value = '';
  document.getElementById('adm-pass-error').style.display = 'none';
  document.getElementById('modal-admin-pass').classList.add('open');
  setTimeout(()=>document.getElementById('adm-pass-old').focus(), 100);
}
function closeAdminPassModal(){
  document.getElementById('modal-admin-pass').classList.remove('open');
}
document.getElementById('modal-admin-pass').addEventListener('click', function(e){
  if(e.target === this) closeAdminPassModal();
});
function saveAdminPass(){
  const old     = document.getElementById('adm-pass-old').value;
  const neu     = document.getElementById('adm-pass-new').value;
  const confirm = document.getElementById('adm-pass-confirm').value;
  const errEl   = document.getElementById('adm-pass-error');
  errEl.style.display = 'none';

  if(old !== ADMIN_PASS){ errEl.textContent='❌ La contraseña actual es incorrecta.'; errEl.style.display='block'; return; }
  if(neu.length < 6)    { errEl.textContent='❌ La nueva contraseña debe tener al menos 6 caracteres.'; errEl.style.display='block'; return; }
  if(neu !== confirm)   { errEl.textContent='❌ Las contraseñas no coinciden.'; errEl.style.display='block'; return; }

  ADMIN_PASS = neu;
  localStorage.setItem('andina_admin_pass', ADMIN_PASS);
  closeAdminPassModal();
  showToast('✅ Contraseña de Admin actualizada correctamente', 'success');
}

// ── Manage registered user ────────────────────────────────────
function openManageUser(index){
  managingUserIndex = index;
  const u = REGISTERED_USERS[index];
  document.getElementById('mu-nombre').textContent = u.nombre;
  document.getElementById('mu-meta').textContent   = '@' + u.user + '  ·  ' + u.email;
  document.getElementById('mu-pass-new').value     = '';
  document.getElementById('mu-pass-confirm').value = '';
  document.getElementById('mu-error').style.display = 'none';
  updateRoleBtns(u.role || 'editor');
  document.getElementById('modal-manage-user').classList.add('open');
}
function closeManageUser(){
  document.getElementById('modal-manage-user').classList.remove('open');
  managingUserIndex = null;
}
document.getElementById('modal-manage-user').addEventListener('click', function(e){
  if(e.target === this) closeManageUser();
});

function updateRoleBtns(role){
  const btnEd = document.getElementById('role-btn-editor');
  const btnVw = document.getElementById('role-btn-viewer');
  if(!btnEd || !btnVw) return;
  if(role === 'editor'){
    btnEd.style.background = '#0EA5C9'; btnEd.style.color = '#fff'; btnEd.style.borderColor = '#0EA5C9';
    btnVw.style.background = '#fff';    btnVw.style.color = '#64748B'; btnVw.style.borderColor = '#E2E8F0';
  } else {
    btnVw.style.background = '#F59E0B'; btnVw.style.color = '#fff'; btnVw.style.borderColor = '#F59E0B';
    btnEd.style.background = '#fff';    btnEd.style.color = '#64748B'; btnEd.style.borderColor = '#E2E8F0';
  }
}

function setUserRole(role){
  if(managingUserIndex === null) return;
  REGISTERED_USERS[managingUserIndex].role = role;
  saveRegistered();
  updateRoleBtns(role);
  const label = role === 'editor' ? 'Editor' : 'Solo Lectura';
  const name  = REGISTERED_USERS[managingUserIndex].nombre;
  showToast('🎭 Rol de "' + name + '" actualizado a ' + label, 'info');
  renderAjustes();
}

function saveUserPass(){
  if(managingUserIndex === null) return;
  const neu     = document.getElementById('mu-pass-new').value;
  const confirm = document.getElementById('mu-pass-confirm').value;
  const errEl   = document.getElementById('mu-error');
  errEl.style.display = 'none';

  if(neu.length < 6)  { errEl.textContent='❌ La contraseña debe tener al menos 6 caracteres.'; errEl.style.display='block'; return; }
  if(neu !== confirm) { errEl.textContent='❌ Las contraseñas no coinciden.'; errEl.style.display='block'; return; }

  REGISTERED_USERS[managingUserIndex].pass = neu;
  saveRegistered();
  document.getElementById('mu-pass-new').value = '';
  document.getElementById('mu-pass-confirm').value = '';
  const name = REGISTERED_USERS[managingUserIndex].nombre;
  showToast('✅ Contraseña de "' + name + '" actualizada', 'success');
}

function resetUserPass(){
  if(managingUserIndex === null) return;
  REGISTERED_USERS[managingUserIndex].pass = 'reset1234';
  saveRegistered();
  const name = REGISTERED_USERS[managingUserIndex].nombre;
  showToast('🔄 Contraseña de "' + name + '" restablecida a "reset1234"', 'warning');
}

function deleteUserFromAjustes(){
  if(managingUserIndex === null) return;
  const name = REGISTERED_USERS[managingUserIndex].nombre;
  if(!confirm('¿Eliminar la cuenta de "' + name + '"? Esta acción no se puede deshacer.')) return;
  REGISTERED_USERS.splice(managingUserIndex, 1);
  saveRegistered();
  closeManageUser();
  renderAjustes();
  showToast('🗑 Cuenta de "' + name + '" eliminada', 'warning');
}

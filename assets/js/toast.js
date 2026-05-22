//  TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
function showToast(msg, type='info', duration=3500){
  const container = document.getElementById('toast-container');
  const icons = { success:'✅', info:'ℹ️', warning:'⚠️' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]||'ℹ️'}</span>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(()=>{
    toast.style.animation = 'toastOut .35s ease forwards';
    setTimeout(()=>toast.remove(), 350);
  }, duration);
}

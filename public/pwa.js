// Registrar Service Worker para PWA (só em http/https; não funciona em file://)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado:', registration.scope)
      })
      .catch((error) => {
        console.log('[PWA] Erro ao registrar Service Worker:', error)
      })
  })
}

// Detectar se está em modo standalone (app instalado)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
if (isStandalone) {
  document.body.classList.add('app-installed')
  console.log('[PWA] App instalado em modo standalone')
}

// Detectar online/offline
window.addEventListener('online', () => {
  console.log('[PWA] Voltou online!')
  document.body.classList.remove('offline')
})

window.addEventListener('offline', () => {
  console.log('[PWA] Ficou offline')
  document.body.classList.add('offline')
})

// Banner de install (opcional - para Chrome Android)
let deferredPrompt
const installBanner = document.createElement('div')
installBanner.id = 'pwa-install-banner'
installBanner.innerHTML = `
  <div style="
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #b51515, #8a0f0f);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    font-family: 'Inter', sans-serif;
  ">
    <span>📱 Instalar App</span>
    <button id="pwa-install-btn" style="
      background: white;
      color: #b51515;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    ">Instalar</button>
    <button id="pwa-dismiss-btn" style="
      background: transparent;
      color: white;
      border: none;
      padding: 8px;
      cursor: pointer;
      opacity: 0.7;
    ">✕</button>
  </div>
`

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  
  // Mostrar banner depois de 3 segundos
  setTimeout(() => {
    if (!localStorage.getItem('pwa-dismissed')) {
      document.body.appendChild(installBanner)
      
      document.getElementById('pwa-install-btn').addEventListener('click', async () => {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          console.log('[PWA] Usuário instalou o app')
        }
        installBanner.remove()
      })
      
      document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
        localStorage.setItem('pwa-dismissed', 'true')
        installBanner.remove()
      })
    }
  }, 3000)
})
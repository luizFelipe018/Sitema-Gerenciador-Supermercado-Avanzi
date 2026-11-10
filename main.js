const { app, BrowserWindow, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')

const envPath = app.isPackaged
    ? path.join(process.resourcesPath, '.env')
    : path.join(__dirname, '.env')

require('dotenv').config({ path: envPath })

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true
        }
    })

    win.loadURL('http://localhost:3000')
    return win
}

function setupAutoUpdate(mainWin) {
    // Só no app instalado (em dev, sem pacote, não há o que atualizar)
    if (!app.isPackaged) return

    autoUpdater.allowDowngrade = false
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.logger = { info: (...args) => console.log('[autoUpdater]', ...args), warn: (...args) => console.warn('[autoUpdater]', ...args), error: (...args) => console.error('[autoUpdater]', ...args) }

    const textoProgresso = (p) => {
        try { if (!mainWin.isDestroyed()) mainWin.setTitle(`Super Avanzi ERP — baixando atualização ${p}%`) } catch {}
    }

    autoUpdater.on('checking-for-update', () => {
        console.log('[autoUpdater] Verificando atualização...')
    })

    autoUpdater.on('update-available', (info) => {
        const releaseNotes = typeof info.releaseNotes === 'string'
            ? info.releaseNotes.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            : (info.releaseNotes ? String(info.releaseNotes) : 'Clique em Baixar para atualizar o Super Avanzi ERP.')
        dialog.showMessageBox(mainWin, {
            type: 'info',
            title: 'Atualização disponível',
            message: `Versão ${info.version} disponível. Baixar agora?`,
            detail: releaseNotes,
            buttons: ['Baixar', 'Agora não'],
            defaultId: 0
        }).then((res) => {
            if (res.response === 0) autoUpdater.downloadUpdate()
        }).catch((e) => console.error('[autoUpdater] Falha no diálogo:', e && e.message ? e.message : e))
    })

    autoUpdater.on('update-not-available', () => {
        console.log('[autoUpdater] Você já está na versão mais recente.')
    })

    autoUpdater.on('error', (err) => {
        const msg = (err && (err.message || err)) || 'Erro desconhecido'
        console.error('[autoUpdater] Erro na atualização:', msg)
        dialog.showMessageBox({
            type: 'error',
            title: 'Falha ao atualizar',
            message: 'Não foi possível baixar a atualização.',
            detail: String(msg),
            buttons: ['Entendi']
        }).catch(() => {})
    })

    autoUpdater.on('download-progress', (progress) => {
        const p = Math.round(progress.percent || 0)
        textoProgresso(p)
        console.log(`[autoUpdater] Baixando: ${p}% (${(progress.bytesPerSecond / 1024).toFixed(0)} KB/s)`)
    })

    autoUpdater.on('update-downloaded', (info) => {
        textoProgresso(100)
        dialog.showMessageBox(mainWin, {
            type: 'info',
            title: 'Atualização baixada',
            message: `Versão ${info.version} baixada e pronta para instalar.`,
            detail: 'Clique em Fechar e instalar para reiniciar o app.',
            buttons: ['Fechar e instalar', 'Depois'],
            defaultId: 0
        }).then((res) => {
            if (res.response === 0) autoUpdater.quitAndInstall()
        }).catch(() => {})
    })

    // Checagem inicial + a cada 4h com o app aberto
    setTimeout(() => {
        autoUpdater.checkForUpdates().catch((e) => console.error('[autoUpdater] Falha ao verificar:', e && e.message ? e.message : e))
    }, 5000)
    setInterval(() => {
        autoUpdater.checkForUpdates().catch(() => {})
    }, 4 * 60 * 60 * 1000)
}

app.whenReady().then(() => {
    require('./server')
    const win = createWindow()
    setupAutoUpdate(win)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

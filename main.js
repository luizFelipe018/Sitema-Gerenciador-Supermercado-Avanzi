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

    win.loadFile('public/login.html')
    return win
}

function setupAutoUpdate(mainWin) {
    // Só no app instalado (em dev, sem pacote, não há o que atualizar)
    if (!app.isPackaged) return

    autoUpdater.allowDowngrade = false
    autoUpdater.autoDownload = false
    autoUpdater.logger = { info: (...args) => console.log('[autoUpdater]', ...args), warn: (...args) => console.warn('[autoUpdater]', ...args), error: (...args) => console.error('[autoUpdater]', ...args) }

    autoUpdater.on('checking-for-update', () => {
        console.log('[autoUpdater] Verificando atualização...')
    })

    autoUpdater.on('update-available', (info) => {
        dialog.showMessageBox(mainWin, {
            type: 'info',
            title: 'Atualização disponível',
            message: `Versão ${info.version} disponível. Baixar agora?`,
            detail: info.releaseNotes || 'Clique em Baixar para atualizar o Super Avanzi ERP.',
            buttons: ['Baixar', 'Agora não'],
            defaultId: 0
        }).then((res) => {
            if (res.response === 0) autoUpdater.downloadUpdate()
        }).catch(() => {})
    })

    autoUpdater.on('update-not-available', () => {
        console.log('[autoUpdater] Você já está na versão mais recente.')
    })

    autoUpdater.on('error', (err) => {
        console.error('[autoUpdater] Erro na atualização:', err && err.message ? err.message : err)
    })

    autoUpdater.on('download-progress', (progress) => {
        mainWin.webContents.send('update-progress', Math.round(progress.percent || 0))
    })

    autoUpdater.on('update-downloaded', (info) => {
        dialog.showMessageBox(mainWin, {
            type: 'info',
            title: 'Atualização baixada',
            message: `Versão ${info.version} baixada. Fechar o app para instalar?`,
            detail: 'A atualização será aplicada na próxima abertura.',
            buttons: ['Fechar e instalar', 'Depois'],
            defaultId: 0
        }).then((res) => {
            if (res.response === 0) autoUpdater.quitAndInstall()
        }).catch(() => {})
    })

    // Checagem inicial + a cada 4h com o app aberto
    autoUpdater.checkForUpdates().catch(() => {})
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

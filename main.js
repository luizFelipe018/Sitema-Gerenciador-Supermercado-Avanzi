const { app, BrowserWindow, dialog, shell } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

let configPendente = false
let caminhoConfig = ''

/**
 * Em desenvolvimento continua usando a raiz do projeto.
 * No instalado, a configuração fica em %APPDATA%/Super Avanzi ERP/.env —
 * fora do pacote, para não distribuir senha do banco nem JWT_SECRET.
 */
function carregarConfigEnv() {
    if (!app.isPackaged) {
        require('dotenv').config({ path: path.join(__dirname, '.env') })
        return
    }

    const dir = app.getPath('userData')
    const envPath = path.join(dir, '.env')
    caminhoConfig = envPath

    if (!fs.existsSync(envPath)) {
        const modelo = [
            '# Configuração do Super Avanzi ERP — preencha e reinicie o app',
            'DB_HOST=localhost',
            'DB_PORT=3399',
            'DB_NAME=supermercado',
            'DB_USER=',
            'DB_PASSWORD=',
            `JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`,
            'PASTA_IMAGENS=',
            'PASTA_PRATOS=',
            ''
        ].join('\n')
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(envPath, modelo, 'utf8')
        configPendente = true
    }

    require('dotenv').config({ path: envPath })

    if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.JWT_SECRET) {
        configPendente = true
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, 'public', 'assets', 'mirinho.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true
        }
    })

    win.loadURL('http://localhost:3000/login.html')
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

    // Modal no TEMA do app (mesma janela da página). Se o modal não estiver
    // disponível na página, cai no dialog nativo do Windows como fallback.
    async function modalNoTema({ titulo, mensagem, okText, cancelText, confirmar, tipo }) {
        const notas = String(mensagem || '').replace(/<[^>]*>/g, ' ')
            .replace(/\r\n|\r/g, '\n')      // normaliza quebras de linha
            .replace(/[ \t]+/g, ' ')        // colapsa espaços em branco horizontais
            .replace(/\n{3,}/g, '\n\n')     // no máximo 1 linha em branco entre parágrafos
            .trim()
        const msg = notas.length > 650 ? notas.slice(0, 650).trim() + '…' : notas
        const opts = { titulo, tipo: tipo || 'info', okText, cancelText }
        const fn = confirmar ? 'avisoConfirmacao' : 'aviso'
        try {
            const ok = await mainWin.webContents.executeJavaScript(
                `window.${fn} ? window.${fn}(${JSON.stringify(msg)}, ${JSON.stringify(opts)}) : '__sem_modal__'`, true)
            if (ok === '__sem_modal__') throw new Error('modal do app indisponível na página')
            return confirmar ? ok === true : true
        } catch (e) {
            console.warn('[autoUpdater] Modal do app indisponível, usando dialog nativo:', e && e.message ? e.message : e)
            const res = await dialog.showMessageBox(mainWin, {
                type: tipo === 'erro' ? 'error' : 'info',
                title: titulo,
                message: titulo,
                detail: msg,
                buttons: confirmar ? [okText || 'Baixar', cancelText || 'Agora não'] : [okText || 'Entendi'],
                defaultId: 0
            })
            return confirmar ? res.response === 0 : true
        }
    }

    autoUpdater.on('checking-for-update', () => {
        console.log('[autoUpdater] Verificando atualização...')
    })

    autoUpdater.on('update-available', async (info) => {
        const releaseNotes = typeof info.releaseNotes === 'string'
            ? info.releaseNotes
            : (info.releaseNotes ? String(info.releaseNotes) : 'Clique em Baixar para atualizar o Super Avanzi ERP.')
        const baixar = await modalNoTema({
            titulo: 'Atualização disponível',
            mensagem: `Versão ${info.version} disponível.\n\n${releaseNotes}`,
            okText: 'Baixar',
            cancelText: 'Agora não',
            confirmar: true,
            tipo: 'info'
        })
        if (baixar) autoUpdater.downloadUpdate()
    })

    autoUpdater.on('update-not-available', () => {
        console.log('[autoUpdater] Você já está na versão mais recente.')
    })

    autoUpdater.on('error', async (err) => {
        const msg = (err && (err.message || err)) || 'Erro desconhecido'
        console.error('[autoUpdater] Erro na atualização:', msg)
        await modalNoTema({
            titulo: 'Falha ao atualizar',
            mensagem: 'Não foi possível baixar a atualização.\n\n' + String(msg),
            okText: 'Entendi',
            confirmar: false,
            tipo: 'erro'
        })
    })

    autoUpdater.on('download-progress', (progress) => {
        const p = Math.round(progress.percent || 0)
        textoProgresso(p)
        console.log(`[autoUpdater] Baixando: ${p}% (${(progress.bytesPerSecond / 1024).toFixed(0)} KB/s)`)
    })

    autoUpdater.on('update-downloaded', async (info) => {
        textoProgresso(100)
        const fechar = await modalNoTema({
            titulo: 'Atualização baixada',
            mensagem: `Versão ${info.version} baixada e pronta para instalar.\n\nClique em Fechar e instalar para reiniciar o app com a nova versão.`,
            okText: 'Fechar e instalar',
            cancelText: 'Depois',
            confirmar: true,
            tipo: 'ok'
        })
        if (fechar) autoUpdater.quitAndInstall()
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
    carregarConfigEnv()

    if (configPendente) {
        dialog.showMessageBoxSync({
            type: 'warning',
            title: 'Configuração necessária',
            message: 'Configure o banco de dados',
            detail: `Um arquivo .env foi criado em:\n\n${caminhoConfig}\n\nPreencha DB_USER e DB_PASSWORD (o JWT_SECRET já foi gerado) e reinicie o app.`,
            buttons: ['Abrir arquivo', 'Fechar'],
            defaultId: 0
        })
        shell.showItemInFolder(caminhoConfig)
        app.quit()
        return
    }

    require('./server')
    const win = createWindow()
    setupAutoUpdate(win)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

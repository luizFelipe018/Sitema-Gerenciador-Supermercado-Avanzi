const { app, BrowserWindow } = require('electron')
const path = require('path')

// Carrega .env — funciona em dev e no build (extraResources)
const envPath = app.isPackaged
    ? path.join(process.resourcesPath, '.env')
    : path.join(__dirname, '.env')

require('dotenv').config({ path: envPath })

// Inicia o servidor Express
require('./server')

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false // Permite carregar imagens externas
        }
    })

    win.loadFile('public/login.html')
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
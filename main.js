const { app, BrowserWindow } = require('electron')
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
            webSecurity: false
        }
    })

    win.loadFile('public/login.html')
}

app.whenReady().then(() => {
    require('./server')
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
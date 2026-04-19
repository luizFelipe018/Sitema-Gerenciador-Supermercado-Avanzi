const { app, BrowserWindow } = require('electron')
require('./server')
const path = require('path')

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    win.loadFile('public/login.html')
}

app.whenReady().then(() => {
    createWindow()
})
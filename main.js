'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {

  if (process.platform == 'win32') {
    var subpy = require('child_process').spawn('py', ['-3', './server.py']);
  } else {
    var subpy = require('child_process').spawn('python3', ['./server.py']);
  }

	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 600,
    show: false
	});

  var url = `file://${__dirname}/index.html`
  // var url = 'http://localhost:8888'

  mainWindow.loadURL(url);
  mainWindow.webContents.openDevTools()

  // mainWindow.show()

  mainWindow.once('ready-to-show', () => {
    mainWindow.loadURL(url);
    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

app.on('browser-window-created', function(e, window) {
  window.setMenu(null);
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

const { app, autoUpdater, BrowserWindow, dialog } = require('electron');
const path = require('path');
//const config = require("../src/config/config.json");

Object.defineProperty(app, 'isPackaged', {
  get() {
    return true;
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  autoUpdater.checkForUpdates()
});




setInterval(() => {
  autoUpdater.checkForUpdates()
}, 60000)


autoUpdater.on('update-available', (info) => {
  const options = {
    type: 'info',
    title: 'Aktualizacja dostępna',
    message: 'Nowa wersja aplikacji jest dostępna. Chcesz ją zainstalować teraz?',
    buttons: ['Tak', 'Nie']
  };
  dialog.showMessageBox(options, (response) => {
    if (response === 0) {
      // użytkownik wybrał opcję "Tak" - pobierz i zainstaluj aktualizację
      autoUpdater.downloadUpdate();
    }
  });
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (message) => {
  console.error('There was a problem updating the application')
  console.error(message)
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.',
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

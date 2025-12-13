const { app, BrowserWindow, BrowserView, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const sudo = require('sudo-prompt');
const { setupContextMenu, setupCreditsShortcut } = require('./utils/context-menu');
const { setupAdblock } = require('./utils/adblocker');
const { loadConfig } = require('./utils/config_loader');
const { exec } = require('child_process');

const APP_VERSION = "1.0.8";
let mainWindow;
let updateWindow = null;
let tabs = [];
let blockedUrlTemp = null;
let blockedReasonTemp = null;
let settings;
let verifiedSites = [];

async function checkVersion() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://api.maxlware.fr/v1/mxlw-browser/version', (res) => {
      if (res.statusCode !== 200) {
        console.log(`[VERSION] API returned status ${res.statusCode}`);
        resolve(null);
        return;
      }
      
      const contentType = res.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`[VERSION] Invalid content-type: ${contentType}`);
        resolve(null);
        return;
      }
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log(`[VERSION] API response: ${data}`);
          const result = JSON.parse(data);
          
          let version = null;
          if (result && typeof result === 'object') {
            version = result.version || result.Version || result.VERSION || result.v;
          } else if (typeof result === 'string') {
            version = result.trim();
          }
          
          if (version && typeof version === 'string') {
            resolve(version);
          } else {
            console.log('[VERSION] No version found in response');
            resolve(null);
          }
        } catch (error) {
          console.error('[VERSION] JSON parse error:', error);
          resolve(null);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('[VERSION] Request error:', err.message);
      resolve(null);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log('[VERSION] Request timeout');
      resolve(null);
    });
  });
}

function createUpdateWindow(apiVersion) {
  updateWindow = new BrowserWindow({
    width: 400,
    height: 250,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  updateWindow.loadFile('renderer/update.html');
  
  updateWindow.webContents.on('did-finish-load', () => {
    updateWindow.webContents.send('set-versions', {
      current: APP_VERSION,
      new: apiVersion
    });
  });
  
  updateWindow.on('closed', () => {
    updateWindow = null;
  });
}

function downloadUpdate(version) {
  const downloadUrl = `https://api.maxlware.fr/v1/mxlw-browser/download`;
  const fileName = `mxlw-browser-${version}-setup.exe`;
  const filePath = path.join(app.getPath('temp'), fileName);

  console.log(`[UPDATE] Downloading from: ${downloadUrl}`);
  
  if (updateWindow) {
    updateWindow.webContents.send('download-started');
  }

  const file = fs.createWriteStream(filePath);
  
  https.get(downloadUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error(`[UPDATE] Download failed with status: ${response.statusCode}`);
      if (updateWindow) {
        updateWindow.webContents.send('download-error', `HTTP ${response.statusCode}`);
      }
      return;
    }
    
    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloaded = 0;
    
    response.on('data', (chunk) => {
      downloaded += chunk.length;
      const progress = totalSize ? (downloaded / totalSize * 100).toFixed(1) : 0;
      
      if (updateWindow) {
        updateWindow.webContents.send('download-progress', progress);
      }
    });
    
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      
      if (updateWindow) {
        updateWindow.webContents.send('download-finished');
      }
      
      console.log(`[UPDATE] Downloaded to: ${filePath}`);
      
      setTimeout(() => {
        if (updateWindow) updateWindow.close();
        if (mainWindow) mainWindow.close();
        
        exec(`"${filePath}"`, (error) => {
          if (error) {
            console.error('[UPDATE] Error launching installer:', error);
          }
          app.quit();
        });
      }, 1000);
    });
    
  }).on('error', (err) => {
    console.error('[UPDATE] Download error:', err);
    if (updateWindow) {
      updateWindow.webContents.send('download-error', err.message);
    }
  });
}

ipcMain.on('install-update', (event, version) => {
  downloadUpdate(version);
});

ipcMain.on('postpone-update', () => {
  if (updateWindow) {
    updateWindow.close();
  }
  startApp();
});

function startApp() {
  console.log("[START] Loading configurations...");
  settings = loadConfig();
  console.log("[START] Configuration loaded!");

  console.log("[RPC] Loading...");
  if (settings.RpcEnabled) {
    require('./rpc');
  }

  setImmediate(async () => {
    try {
      const response = await fetch(settings.apis.VerifiedSites);
      const data = await response.json();
      verifiedSites = data;
    } catch (error) {
      console.error('[Config/Net/VerifiedSites]: ', error);
    }
  });

  createWindow();
}

app.whenReady().then(async () => {
  console.log("[VERSION] Checking version...");
  try {
    const apiVersion = await checkVersion();
    
    if (apiVersion && apiVersion !== APP_VERSION) {
      console.log(`[VERSION] Update available: ${APP_VERSION} -> ${apiVersion}`);
      createUpdateWindow(apiVersion);
    } else if (apiVersion) {
      console.log(`[VERSION] App is up to date (${APP_VERSION})`);
      checkAdminRights();
    } else {
      console.log('[VERSION] Could not check version, starting app normally');
      checkAdminRights();
    }
  } catch (error) {
    console.error('[VERSION] Version check failed:', error);
    checkAdminRights();
  }
});

function checkAdminRights() {
  if (IDONTCAREABOUTTHEFOLLOWINGCODE) {
    startApp();
  } else {
    if (process.platform === 'win32' && !process.argv.includes('--elevated')) {
      const execPath = process.execPath;
      const options = { name: 'Mxlw Browser' };
      console.log("[START] Requesting admin permissions...");
      const command = `"${execPath}" ${process.argv.slice(1).join(' ')} --elevated`;

      sudo.exec(command, options, (error) => {
        if (error) {
          console.error('[START] Error requesting perms:', error);
          startApp();
        }
      });
    } else {
      startApp();
    }
  }
}

var IDONTCAREABOUTTHEFOLLOWINGCODE = true;

function createWindow() {
  console.log("[START] Starting application...");
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    title: 'Mxlw Browser',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  console.log("[START] Application loaded.");

  console.log("[START] Loading menu...");
  mainWindow.loadFile('renderer/index.html');
  console.log("[START] Menu loaded!");
  setupCreditsShortcut(mainWindow);
  
  createTab(`file://${__dirname}/${settings.homePage}`);

  console.log("--------------------");
  console.log("  [START] Loaded!");
  console.log(`  Version ${APP_VERSION}`);
  console.log("---------------------");

  mainWindow.on('resize', () => resizeActiveTab());
  mainWindow.on('closed', () => mainWindow = null);

  globalShortcut.register('Control+Alt+I', () => {
    const activeTab = tabs[tabs.length - 1];
    if (activeTab) activeTab.webContents.openDevTools({ mode: 'detach' });
  });
}

function createTab(url) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  setupAdblock(view);
  mainWindow.setBrowserView(view);
  tabs.push(view);
  resizeActiveTab();
  view.webContents.loadURL(url);

  view.webContents.on('did-finish-load', () => {
    try {
      const currentURL = view.webContents.getURL();
      const hostname = new URL(currentURL).hostname;

      if (verifiedSites.includes(hostname)) {
        console.log(`[VERIFIED] ${hostname}`);
        mainWindow.webContents.send('site-verified', hostname);
      } else {
        console.log(`[NOT VERIFIED] ${hostname}`);
        mainWindow.webContents.send('site-unverified');
      }
    } catch (err) {
      mainWindow.webContents.send('site-unverified');
    }

    sendTabsToRenderer();
  });

  view.webContents.on('will-navigate', (event, newUrl) => {
    const parsed = new URL(newUrl);
    const hostname = parsed.hostname;
    if (parsed.protocol === 'http:') {
      event.preventDefault();
      blockedUrlTemp = newUrl;
      blockedReasonTemp = 'Connexion non sécurisée (HTTP)';
      loadWarningTab();
    }
  });

  setupContextMenu(mainWindow, view);
  view.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

function resizeActiveTab() {
  if (!mainWindow || tabs.length === 0) return;
  const bounds = mainWindow.getBounds();
  const view = tabs[tabs.length - 1];
  view.setBounds({
    x: 0,
    y: 80,
    width: bounds.width,
    height: bounds.height - 80,
  });
  view.setAutoResize({ width: true, height: true });
}

function sendTabsToRenderer() {
  const tabData = tabs.map(tab => ({
    title: tab.webContents.getTitle(),
    favicon: tab.webContents.getURL().startsWith('http')
      ? `https://www.google.com/s2/favicons?sz=64&domain_url=${tab.webContents.getURL()}`
      : null
  }));
  mainWindow.webContents.send('tabs-updated', tabData);
}

function loadWarningTab() {
  const warningUrl = `file://${path.join(__dirname, 'renderer', 'warning.html')}?reason=${encodeURIComponent(blockedReasonTemp)}&url=${encodeURIComponent(blockedUrlTemp)}`;
  createTab(warningUrl);
}

ipcMain.on('navigate', (_, input) => {
  const view = tabs[tabs.length - 1];
  if (!input) return;

  const url = input.includes('.') ? (input.startsWith('http') ? input : `https://${input}`) : `${settings.searchEngine}${encodeURIComponent(input)}`;
  view.webContents.loadURL(url);
});

ipcMain.on('new-tab', (_, inputUrl) => createTab(inputUrl || settings.homePage));
ipcMain.on('switch-tab', (_, index) => {
  const tab = tabs[index];
  if (tab) {
    mainWindow.setBrowserView(tab);
    resizeActiveTab();
  }
});

ipcMain.on('close-app', () => app.quit());
ipcMain.on('minimize-app', () => mainWindow.minimize());
ipcMain.on('maximize-app', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

const { app, BrowserWindow, BrowserView, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const sudo = require('sudo-prompt');
const { setupContextMenu, setupCreditsShortcut } = require('./utils/context-menu');
const { setupAdblock } = require('./utils/adblocker');
const { loadConfig } = require('./utils/config_loader');
const { exec } = require('child_process');
const { shell } = require('electron');

const APP_VERSION = "1.0.9";

const LICENSE_TEXT = `
Mozilla Public License Version 2.0
==================================

1. Definitions
--------------

1.1. "Contributor"
    means each individual or legal entity that creates, contributes to
    the creation of, or owns Covered Software.

1.2. "Contributor Version"
    means the combination of the Contributions of others (if any) used
    by a Contributor and that particular Contributor's Contribution.

1.3. "Contribution"
    means Covered Software of a particular Contributor.

1.4. "Covered Software"
    means Source Code Form to which the initial Contributor has attached
    the notice in Exhibit A, the Executable Form of such Source Code
    Form, and Modifications of such Source Code Form, in each case
    including portions thereof.

1.5. "Incompatible With Secondary Licenses"
    means

    (a) that the initial Contributor has attached the notice described
        in Exhibit B to the Covered Software; or

    (b) that the Covered Software was made available under the terms of
        version 1.1 or earlier of the License, but not also under the
        terms of a Secondary License.

1.6. "Executable Form"
    means any form of the work other than Source Code Form.

1.7. "Larger Work"
    means a work that combines Covered Software with other material, in
    a separate file or files, that is not Covered Software.

1.8. "License"
    means this document.

1.9. "Licensable"
    means having the right to grant, to the maximum extent possible,
    whether at the time of the initial grant or subsequently, any and
    all of the rights conveyed by this License.

1.10. "Modifications"
    means any of the following:

    (a) any file in Source Code Form that results from an addition to,
        deletion from, or modification of the contents of Covered
        Software; or

    (b) any new file in Source Code Form that contains any Covered
        Software.

1.11. "Patent Claims" of a Contributor
    means any patent claim(s), including without limitation, method,
    process, and apparatus claims, in any patent Licensable by such
    Contributor that would be infringed, but for the grant of the
    License, by the making, using, selling, offering for sale, having
    made, import, or transfer of either its Contributions or its
    Contributor Version.

1.12. "Secondary License"
    means either the GNU General Public License, Version 2.0, the GNU
    Lesser General Public License, Version 2.1, the GNU Affero General
    Public License, Version 3.0, or any later versions of those
    licenses.

1.13. "Source Code Form"
    means the form of the work preferred for making modifications.

1.14. "You" (or "Your")
    means an individual or a legal entity exercising rights under this
    License. For legal entities, "You" includes any entity that
    controls, is controlled by, or is under common control with You. For
    purposes of this definition, "control" means (a) the power, direct
    or indirect, to cause the direction or management of such entity,
    whether by contract or otherwise, or (b) ownership of more than
    fifty percent (50%) of the outstanding shares or beneficial
    ownership of such entity.

2. License Grants and Conditions
--------------------------------

2.1. Grants

Each Contributor hereby grants You a world-wide, royalty-free,
non-exclusive license:

(a) under intellectual property rights (other than patent or trademark)
    Licensable by such Contributor to use, reproduce, make available,
    modify, display, perform, distribute, and otherwise exploit its
    Contributions, either on an unmodified basis, with Modifications, or
    as part of a Larger Work; and

(b) under Patent Claims of such Contributor to make, use, sell, offer
    for sale, have made, import, and otherwise transfer either its
    Contributions or its Contributor Version.

2.2. Effective Date

The licenses granted in Section 2.1 with respect to any Contribution
become effective for each Contribution on the date the Contributor first
distributes such Contribution.

2.3. Limitations on Grant Scope

The licenses granted in this Section 2 are the only rights granted under
this License. No additional rights or licenses will be implied from the
distribution or licensing of Covered Software under this License.
Notwithstanding Section 2.1(b) above, no patent license is granted by a
Contributor:

(a) for any code that a Contributor has removed from Covered Software;
    or

(b) for infringements caused by: (i) Your and any other third party's
    modifications of Covered Software, or (ii) the combination of its
    Contributions with other software (except as part of its Contributor
    Version); or

(c) under Patent Claims infringed by Covered Software in the absence of
    its Contributions.

This License does not grant any rights in the trademarks, service marks,
or logos of any Contributor (except as may be necessary to comply with
the notice requirements in Section 3.4).

2.4. Subsequent Licenses

No Contributor makes additional grants as a result of Your choice to
distribute the Covered Software under a subsequent version of this
License (see Section 10.2) or under the terms of a Secondary License (if
permitted under the terms of Section 3.3).

2.5. Representation

Each Contributor represents that the Contributor believes its
Contributions are its original creation(s) or it has sufficient rights
to grant the rights to its Contributions conveyed by this License.

2.6. Fair Use

This License is not intended to limit any rights You have under
applicable copyright doctrines of fair use, fair dealing, or other
equivalents.

2.7. Conditions

Sections 3.1, 3.2, 3.3, and 3.4 are conditions of the licenses granted
in Section 2.1.

3. Responsibilities
-------------------

3.1. Distribution of Source Form

All distribution of Covered Software in Source Code Form, including any
Modifications that You create or to which You contribute, must be under
the terms of this License. You must inform recipients that the Source
Code Form of the Covered Software is governed by the terms of this
License, and how they can obtain a copy of this License. You may not
attempt to alter or restrict the recipients' rights in the Source Code
Form.

3.2. Distribution of Executable Form

If You distribute Covered Software in Executable Form then:

(a) such Covered Software must also be made available in Source Code
    Form, as described in Section 3.1, and You must inform recipients of
    the Executable Form how they can obtain a copy of such Source Code
    Form by reasonable means in a timely manner, at a charge no more
    than the cost of distribution to the recipient; and

(b) You may distribute such Executable Form under the terms of this
    License, or sublicense it under different terms, provided that the
    license for the Executable Form does not attempt to limit or alter
    the recipients' rights in the Source Code Form under this License.

3.3. Distribution of a Larger Work

You may create and distribute a Larger Work under terms of Your choice,
provided that You also comply with the requirements of this License for
the Covered Software. If the Larger Work is a combination of Covered
Software with a work governed by one or more Secondary Licenses, and the
Covered Software is not Incompatible With Secondary Licenses, this
License permits You to additionally distribute such Covered Software
under the terms of such Secondary License(s), so that the recipient of
the Larger Work may, at their option, further distribute the Covered
Software under the terms of either this License or such Secondary
License(s).

3.4. Notices

You may not remove or alter the substance of any license notices
(including copyright notices, patent notices, disclaimers of warranty,
or limitations of liability) contained within the Source Code Form of
the Covered Software, except that You may alter any license notices to
the extent required to remedy known factual inaccuracies.

3.5. Application of Additional Terms

You may choose to offer, and to charge a fee for, warranty, support,
indemnity or liability obligations to one or more recipients of Covered
Software. However, You may do so only on Your own behalf, and not on
behalf of any Contributor. You must make it absolutely clear that any
such warranty, support, indemnity, or liability obligation is offered by
You alone, and You hereby agree to indemnify every Contributor for any
liability incurred by such Contributor as a result of warranty, support,
indemnity or liability terms You offer. You may include additional
disclaimers of warranty and limitations of liability specific to any
jurisdiction.

4. Inability to Comply Due to Statute or Regulation
---------------------------------------------------

If it is impossible for You to comply with any of the terms of this
License with respect to some or all of the Covered Software due to
statute, judicial order, or regulation then You must: (a) comply with
the terms of this License to the maximum extent possible; and (b)
describe the limitations and the code they affect. Such description must
be placed in a text file included with all distributions of the Covered
Software under this License. Except to the extent prohibited by statute
or regulation, such description must be sufficiently detailed for a
recipient of ordinary skill to be able to understand it.

5. Termination
--------------

5.1. The rights granted under this License will terminate automatically
if You fail to comply with any of its terms. However, if You become
compliant, then the rights granted under this License from a particular
Contributor are reinstated (a) provisionally, unless and until such
Contributor explicitly and finally terminates Your grants, and (b) on an
ongoing basis, if such Contributor fails to notify You of the
non-compliance by some reasonable means prior to 60 days after You have
come back into compliance. Moreover, Your grants from a particular
Contributor are reinstated on an ongoing basis if such Contributor
notifies You of the non-compliance by some reasonable means, this is the
first time You have received notice of non-compliance with this License
from such Contributor, and You become compliant prior to 30 days after
Your receipt of the notice.

5.2. If You initiate litigation against any entity by asserting a patent
infringement claim (excluding declaratory judgment actions,
counter-claims, and cross-claims) alleging that a Contributor Version
directly or indirectly infringes any patent, then the rights granted to
You by any and all Contributors for the Covered Software under Section
2.1 of this License shall terminate.

5.3. In the event of termination under Sections 5.1 or 5.2 above, all
end user license agreements (excluding distributors and resellers) which
have been validly granted by You or Your distributors under this License
prior to termination shall survive termination.

************************************************************************
*                                                                      *
*  6. Disclaimer of Warranty                                           *
*  -------------------------                                           *
*                                                                      *
*  Covered Software is provided under this License on an "as is"       *
*  basis, without warranty of any kind, either expressed, implied, or  *
*  statutory, including, without limitation, warranties that the       *
*  Covered Software is free of defects, merchantable, fit for a        *
*  particular purpose or non-infringing. The entire risk as to the     *
*  quality and performance of the Covered Software is with You.        *
*  Should any Covered Software prove defective in any respect, You     *
*  (not any Contributor) assume the cost of any necessary servicing,   *
*  repair, or correction. This disclaimer of warranty constitutes an   *
*  essential part of this License. No use of any Covered Software is   *
*  authorized under this License except under this disclaimer.         *
*                                                                      *
************************************************************************

************************************************************************
*                                                                      *
*  7. Limitation of Liability                                          *
*  --------------------------                                          *
*                                                                      *
*  Under no circumstances and under no legal theory, whether tort      *
*  (including negligence), contract, or otherwise, shall any           *
*  Contributor, or anyone who distributes Covered Software as          *
*  permitted above, be liable to You for any direct, indirect,         *
*  special, incidental, or consequential damages of any character      *
*  including, without limitation, damages for lost profits, loss of    *
*  goodwill, work stoppage, computer failure or malfunction, or any    *
*  and all other commercial damages or losses, even if such party      *
*  shall have been informed of the possibility of such damages. This   *
*  limitation of liability shall not apply to liability for death or   *
*  personal injury resulting from such party's negligence to the       *
*  extent applicable law prohibits such limitation. Some               *
*  jurisdictions do not allow the exclusion or limitation of           *
*  incidental or consequential damages, so this exclusion and          *
*  limitation may not apply to You.                                    *
*                                                                      *
************************************************************************

8. Litigation
-------------

Any litigation relating to this License may be brought only in the
courts of a jurisdiction where the defendant maintains its principal
place of business and such litigation shall be governed by laws of that
jurisdiction, without reference to its conflict-of-law provisions.
Nothing in this Section shall prevent a party's ability to bring
cross-claims or counter-claims.

9. Miscellaneous
----------------

This License represents the complete agreement concerning the subject
matter hereof. If any provision of this License is held to be
unenforceable, such provision shall be reformed only to the extent
necessary to make it enforceable. Any law or regulation which provides
that the language of a contract shall be construed against the drafter
shall not be used to construe this License against a Contributor.

10. Versions of the License
---------------------------

10.1. New Versions

Mozilla Foundation is the license steward. Except as provided in Section
10.3, no one other than the license steward has the right to modify or
publish new versions of this License. Each version will be given a
distinguishing version number.

10.2. Effect of New Versions

You may distribute the Covered Software under the terms of the version
of the License under which You originally received the Covered Software,
or under the terms of any subsequent version published by the license
steward.

10.3. Modified Versions

If you create software not governed by this License, and you want to
create a new license for such software, you may create and use a
modified version of this License if you rename the license and remove
any references to the name of the license steward (except to note that
such modified license differs from this License).

10.4. Distributing Source Code Form that is Incompatible With Secondary
Licenses

If You choose to distribute Source Code Form that is Incompatible With
Secondary Licenses under the terms of this version of the License, the
notice described in Exhibit B of this License must be attached.

Exhibit A - Source Code Form License Notice
-------------------------------------------

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at https://mozilla.org/MPL/2.0/.

If it is not possible or desirable to put the notice in a particular
file, then You may include the notice in a location (such as a LICENSE
file in a relevant directory) where a recipient would be likely to look
for such a notice.

You may add additional accurate notices of copyright ownership.

Exhibit B - "Incompatible With Secondary Licenses" Notice
---------------------------------------------------------

  This Source Code Form is "Incompatible With Secondary Licenses", as
  defined by the Mozilla Public License, v. 2.0.

─────────────────────────────────────────────────────────────────────────────

Remarques:
• Ce logiciel utilise des composants open-source sous licence MIT
• Les icônes et logos sont la propriété de Maxlware
• Les noms de domaines et APIs externes sont la propriété de leurs détenteurs
• Les sites web visités via ce navigateur restent sous leurs propres licences

Pour plus d'informations:
contact@maxlware.fr
`;

const CREDITS_TEXT = `
Mxlw Browser - Crédits

Développement Principal:
• Maxlware (Fondateur & Lead Developer)
• Équipe Maxlware Developement

Contributeurs:
• EletrixTime
• mydkong

Technologies utilisées:
• Electron - Framework d'application desktop
• Node.js - Environnement d'exécution
• HTML5/CSS3/JavaScript - Interface utilisateur
• Chromium - Moteur de rendu

Bibliothèques tierces:
• sudo-prompt - Élévation de privilèges
• discord-rpc - Discord Rich Presence
• Divers modules npm

Icônes & Design:
• Icônes custom par Maxlware
• Thème sombre personnalisé
• Interface matérielle moderne

Remerciements spéciaux:
• Tous nos testeurs bêta
• La communauté Electron
• Nos utilisateurs fidèles

Version: 1.0.9
Dernière mise à jour: Décembre 2025
`;

let mainWindow;
let updateWindow = null;
let aboutWindow = null;
let tabs = [];
let blockedUrlTemp = null;
let blockedReasonTemp = null;
let settings;
let verifiedSites = [];

function createAboutWindow() {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 500,
    height: 650,
    frame: false,
    resizable: false,
    show: false,
    alwaysOnTop: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  aboutWindow.loadFile('renderer/about.html');
  
  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
    aboutWindow.webContents.send('about-data', {
      currentVersion: APP_VERSION,
      creditsText: CREDITS_TEXT,
      licenseText: LICENSE_TEXT
    });
  });
  
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

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

ipcMain.on('close-about', () => {
  if (aboutWindow) {
    aboutWindow.close();
  }
});

ipcMain.on('check-update-now', async (event) => {
  try {
    const apiVersion = await checkVersion();
    
    if (apiVersion && apiVersion !== APP_VERSION) {
      event.sender.send('update-available', apiVersion);
    } else if (apiVersion) {
      event.sender.send('update-status', 'Votre version est à jour.');
    } else {
      event.sender.send('update-status', 'Impossible de vérifier les mises à jour.');
    }
  } catch (error) {
    console.error('[ABOUT] Update check error:', error);
    event.sender.send('update-status', 'Erreur lors de la vérification.');
  }
});

ipcMain.on('open-external-link', (event, url) => {
  shell.openExternal(url);
});

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
  
  const ret = globalShortcut.register('Control+Alt+C', () => {
    console.log('[SHORTCUT] Ctrl+Alt+C pressed - Opening About window');
    createAboutWindow();
  });
  
  if (!ret) {
    console.log('[SHORTCUT] Registration failed for Ctrl+Alt+C');
  }
  
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
  mainWindow.on('closed', () => {
    mainWindow = null;
    globalShortcut.unregisterAll();
  });

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
chalk.level = 3;

let settings = {
  "homePage": "renderer/home.html",
  "searchEngine": "https://duckduckgo.com/?t=ffab&ai=web&q=",
  "RpcEnabled": true,
  "darkMode": true,
  "adblock": true,
  "autoUpdate": true,
  "trackingProtection": true,
  "blockDangerous": true,
  "warnHttp": true,
  "checkSSL": true,
  "askDownloadLocation": true,
  "scanDownloads": true,
  "showBookmarksBar": true,
  "animations": true,
  "hardwareAcceleration": true,
  "discordRPC": true,
  "systemProxy": true,
  "preloadPages": true,
  "backgroundTabs": false,
  "privateByDefault": false,
  "clearCookiesOnExit": false,
  "theme": "dark",
  "fontSize": "medium",
  "devMode": false,
  "apis": {
    "VerifiedSites": "https://org.maxlware.com/assets/mxlw-browser/verified_sites.json"
  },
  "adblock_sources": [
    "https://org.maxlware.com/assets/mxlw-browser/adblock.txt"
  ],
  "HideProxy": {
    "api": ["proxy1.maxlware.fr", "proxy2.eletrix.fr"],
    "auto_enabled": true,
    "token": ""
  },
  "statistics": {
    "adsBlocked": 0,
    "trackersBlocked": 0,
    "dataSaved": 0,
    "sitesVisited": 0
  }
};

const settingsPath = path.join(__dirname, '../settings.json');

if (fs.existsSync(settingsPath)) {
  try {
    const file = fs.readFileSync(settingsPath, 'utf-8');
    const userSettings = JSON.parse(file);
    
    function deepMerge(target, source) {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    }
    
    settings = deepMerge(settings, userSettings);
    
    const defaultKeys = Object.keys(settings);
    const userKeys = Object.keys(userSettings);
    
    for (const key of defaultKeys) {
      if (!userKeys.includes(key) && key !== 'apis' && key !== 'HideProxy' && key !== 'statistics') {
        settings[key] = settings[key];
      }
    }
    
  } catch (e) {
    console.error(chalk.yellow('[CONFIG] Erreur de chargement du fichier de configuration :', e));
    console.log(chalk.cyan('[CONFIG] Utilisation des valeurs par défaut'));
  }
} else {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log(chalk.cyan('[CONFIG] Fichier de configuration créé avec les valeurs par défaut'));
}

function loadConfig() {
  return settings;
}

function saveConfig(newSettings) {
  try {
    const existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const mergedSettings = { ...existingSettings, ...newSettings };
    
    fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2));
    
    Object.assign(settings, newSettings);
    
    console.log(chalk.green('[CONFIG] Paramètres sauvegardés'));
    return true;
  } catch (e) {
    console.error(chalk.red('[CONFIG] Erreur lors de la sauvegarde :', e));
    return false;
  }
}

function updateStatistics(type, value) {
  if (!settings.statistics) {
    settings.statistics = {
      adsBlocked: 0,
      trackersBlocked: 0,
      dataSaved: 0,
      sitesVisited: 0
    };
  }
  
  switch(type) {
    case 'adBlocked':
      settings.statistics.adsBlocked = (settings.statistics.adsBlocked || 0) + 1;
      break;
    case 'trackerBlocked':
      settings.statistics.trackersBlocked = (settings.statistics.trackersBlocked || 0) + 1;
      break;
    case 'dataSaved':
      settings.statistics.dataSaved = (settings.statistics.dataSaved || 0) + value;
      break;
    case 'siteVisited':
      settings.statistics.sitesVisited = (settings.statistics.sitesVisited || 0) + 1;
      break;
  }
  
  saveConfig({ statistics: settings.statistics });
}

module.exports = { 
  loadConfig, 
  saveConfig,
  updateStatistics 
};

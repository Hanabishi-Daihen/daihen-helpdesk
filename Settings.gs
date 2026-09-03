/**
 * ============================================================================
 * DAIHEN Helpdesk & Issue Tracking System (Pro)
 * File: Settings.gs
 * ============================================================================
 */

var UI_SETTINGS_PROP_KEY = 'DAIHEN_UI_SETTINGS_V2';

var UI_SETTINGS_DEFAULTS = {
  primaryColor: '#cc785c', // Claude warm coral
  accentColor: '#181715',  // Claude dark navy surface
  bgStyle: 'canvas',
  customBg: '#faf9f5',
  fontScale: 'normal',
  logoDataUrl: '',
  logoLabel: 'DAIHEN',
  sidebarLabelLine1: 'DAIHEN',
  sidebarLabelLine2: 'Helpdesk & Issues',
  modulesEnabled: {
    schedules: true
  }
};

function getUISettings() {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty(UI_SETTINGS_PROP_KEY);
  if (!raw) return UI_SETTINGS_DEFAULTS;

  try {
    var parsed = JSON.parse(raw);
    return Object.assign({}, UI_SETTINGS_DEFAULTS, parsed);
  } catch (e) {
    console.error('getUISettings JSON parse error: ' + e.message);
    return UI_SETTINGS_DEFAULTS;
  }
}

function saveUISettings(settingsObj) {
  if (!settingsObj || typeof settingsObj !== 'object') {
    throw new Error('การตั้งค่าไม่ถูกต้อง');
  }

  var current = getUISettings();
  var merged = Object.assign({}, current, settingsObj);

  PropertiesService.getScriptProperties().setProperty(
    UI_SETTINGS_PROP_KEY,
    JSON.stringify(merged)
  );

  return { success: true, settings: merged };
}

function resetUISettings() {
  PropertiesService.getScriptProperties().deleteProperty(UI_SETTINGS_PROP_KEY);
  return { success: true, settings: UI_SETTINGS_DEFAULTS };
}

function getSettings() {
  return getSettingsMap_();
}

function saveSettings(settingsObj) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Settings');
  if (!sheet) {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    sheet = ss.insertSheet('Settings');
    sheet.appendRow(['Key', 'Value']);
  }

  var data = sheet.getDataRange().getValues();
  var keysInSheet = {};
  for (var i = 1; i < data.length; i++) {
    keysInSheet[String(data[i][0]).trim()] = i + 1;
  }

  for (var key in settingsObj) {
    var val = settingsObj[key];
    if (keysInSheet[key]) {
      sheet.getRange(keysInSheet[key], 2).setValue(val);
    } else {
      sheet.appendRow([key, val]);
    }
  }

  return { success: true };
}

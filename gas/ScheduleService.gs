/**
 * ============================================================================
 * DAIHEN Helpdesk & Issue Tracking System (Pro)
 * File: ScheduleService.gs
 * ============================================================================
 */

var SCHEDULE_SPREADSHEET_ID = '1qfYlDU5I30cYi79wfbEV8qtrmSeyiZ9axRek0SrXJ3I';
var SCHEDULE_SHEET_NAME      = 'Q_SchedulesForUpdate';
var SCHEDULE_EXPORTS_FOLDER  = '1l9d4fXKnwDtIgg7LBUCX_BM1JJAxSPHgV';

function getScheduleSheet_() {
  try {
    return SpreadsheetApp.openById(SCHEDULE_SPREADSHEET_ID).getSheetByName(SCHEDULE_SHEET_NAME);
  } catch (e) {
    console.error('getScheduleSheet_ error: ' + e.message);
    return null;
  }
}

function getSchedules(filters) {
  var sheet = getScheduleSheet_();
  if (!sheet) {
    return {
      headers: [],
      items: [],
      processes: svc_getProcessList_()
    };
  }

  var data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) {
    return {
      headers: [],
      items: [],
      processes: svc_getProcessList_()
    };
  }

  var rawHeaders = data[0];
  var headers = rawHeaders.map(function(h) { return String(h).trim(); });

  var fSearch   = (filters && filters.search)   ? String(filters.search).toLowerCase().trim() : '';
  var fProcess  = (filters && filters.process)  ? String(filters.process).trim() : '';
  var fCustomer = (filters && filters.customer) ? String(filters.customer).trim() : '';

  var items = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var rObj = svc_rowToObj_(headers, row);

    if (fSearch) {
      var hay = (rObj._id + ' ' + rObj._title + ' ' + rObj._customer + ' ' + rObj._purchaser + ' ' + rObj._process).toLowerCase();
      if (hay.indexOf(fSearch) === -1) continue;
    }
    if (fProcess && rObj._process !== fProcess) continue;
    if (fCustomer && rObj._customer !== fCustomer) continue;

    items.push({
      id: rObj._id,
      title: rObj._title,
      process: rObj._process,
      processFull: svc_fullProcessName_(rObj._process),
      start: rObj._startTxt,
      finish: rObj._finishTxt,
      purchaser: rObj._purchaser,
      customer: rObj._customer,
      mva: rObj._mva,
      ratingVolt: rObj._ratingVolt,
      newDelivery: rObj._newDeliveryTxt,
      actualPlanDelivery: rObj._actualPlanDeliveryTxt,
      notes: rObj._notes
    });
  }

  return {
    headers: headers,
    items: items,
    processes: svc_getProcessList_()
  };
}

function importToScheduleSheet(data, mode) {
  mode = mode || 'append';
  var sheet = getScheduleSheet_();
  if (!sheet) {
    throw new Error('ไม่พบ Google Sheet สำหรับบันทึกแผนงาน (ID: ' + SCHEDULE_SPREADSHEET_ID + ')');
  }

  if (!data || !data.rows || !data.rows.length) {
    return { ok: false, message: 'ไม่มีข้อมูลสำหรับนำเข้า' };
  }

  if (mode === 'replace') {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  }

  sheet.getRange(sheet.getLastRow() + 1, 1, data.rows.length, data.rows[0].length).setValues(data.rows);
  return { ok: true, count: data.rows.length };
}

function svc_rowToObj_(headers, row) {
  return {
    _id: String(row[0] || '').trim(),
    _title: String(row[1] || '').trim(),
    _process: String(row[2] || '').trim(),
    _startTxt: svc_formatDateSafe_(row[3]),
    _finishTxt: svc_formatDateSafe_(row[4]),
    _purchaser: String(row[5] || '').trim(),
    _customer: String(row[6] || '').trim(),
    _mva: String(row[7] || '').trim(),
    _ratingVolt: String(row[8] || '').trim(),
    _newDeliveryTxt: svc_formatDateSafe_(row[9]),
    _actualPlanDeliveryTxt: svc_formatDateSafe_(row[10]),
    _notes: String(row[11] || '').trim()
  };
}

function svc_formatDateSafe_(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(val).trim();
}

function svc_fullProcessName_(code) {
  var map = {
    'TO': 'Tank & Oil Filling',
    'TN': 'Testing & Verification',
    'T': 'Terminal Assembly',
    'D': 'Drying Oven',
    'DYG': 'Degassing Chamber',
    'FA': 'Final Assembly',
    'RCC': 'Radiator Core Check',
    'LCC': 'Load Coil Core'
  };
  return map[code] || code;
}

function svc_getProcessList_() {
  return [
    { code: 'TO', name: 'Tank & Oil Filling', color: '#60a5fa' },
    { code: 'TN', name: 'Testing & Verification', color: '#34d399' },
    { code: 'T', name: 'Terminal Assembly', color: '#a78bfa' },
    { code: 'D', name: 'Drying Oven', color: '#f472b6' },
    { code: 'DYG', name: 'Degassing Chamber', color: '#facc15' },
    { code: 'FA', name: 'Final Assembly', color: '#fb923c' },
    { code: 'RCC', name: 'Radiator Core Check', color: '#38bdf8' },
    { code: 'LCC', name: 'Load Coil Core', color: '#22d3ee' }
  ];
}

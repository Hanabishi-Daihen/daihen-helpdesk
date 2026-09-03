/**
 * ============================================================================
 * DAIHEN Helpdesk & Issue Tracking System (Pro)
 * File: Triggers.gs
 * ============================================================================
 */

function checkOverdueNewIssues() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var now = new Date();
  var overdueHours = 24; // หากสถานะ New ค้างเกิน 24 ชม.
  var overdueList = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = row[7];
    if (status === 'New') {
      var createdAt = new Date(row[10]);
      var diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      if (diffHours >= overdueHours) {
        overdueList.push({
          id: row[0],
          project: row[1],
          reporter: row[3],
          priority: row[9],
          hours: Math.round(diffHours)
        });
      }
    }
  }

  if (overdueList.length > 0) {
    sendOverdueSummaryEmail_(overdueList);
  }
}

function sendOverdueSummaryEmail_(overdueList) {
  var settings = getSettingsMap_();
  var recipients = settings['AdminEmails'] || 'premwit@daihen.co.th';

  var rowsHtml = overdueList.map(function(item) {
    return '<tr>' +
      '<td style="padding:8px 12px; border-bottom:1px solid #eee; font-weight:700;">' + item.id + '</td>' +
      '<td style="padding:8px 12px; border-bottom:1px solid #eee;">' + item.project + '</td>' +
      '<td style="padding:8px 12px; border-bottom:1px solid #eee;">' + item.reporter + '</td>' +
      '<td style="padding:8px 12px; border-bottom:1px solid #eee; color:#b91c1c; font-weight:700;">' + item.priority + '</td>' +
      '<td style="padding:8px 12px; border-bottom:1px solid #eee; color:#706e6a;">ค้างมา ' + item.hours + ' ชม.</td>' +
    '</tr>';
  }).join('');

  var contentHtml = 
    '<h2 style="margin:0 0 16px 0; color:#b91c1c; font-size:18px;">⚠️ แจ้งเตือน: มีรายการแจ้งปัญหาที่ยังไม่ได้รับเรื่อง</h2>' +
    '<p style="font-size:14px; color:#42403d; margin:0 0 16px 0;">พบรายการสถานะ <b>"New"</b> ค้างเกิน 24 ชั่วโมง จำนวน ' + overdueList.length + ' รายการ กรุณาเข้าตรวจสอบ:</p>' +
    '<table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:20px; text-align:left;">' +
      '<thead><tr style="background:#f5f3ee; color:#42403d;">' +
        '<th style="padding:8px 12px;">รหัส</th>' +
        '<th style="padding:8px 12px;">หัวข้อ</th>' +
        '<th style="padding:8px 12px;">ผู้แจ้ง</th>' +
        '<th style="padding:8px 12px;">ความเร่งด่วน</th>' +
        '<th style="padding:8px 12px;">เวลา</th>' +
      '</tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody>' +
    '</table>';

  var subject = '⚠️ [เตือนความจำ] รายการแจ้งปัญหาค้างรับเรื่อง ' + overdueList.length + ' รายการ';
  var finalHtml = buildEmailTemplate_(contentHtml, 'รายการค้างรับเรื่อง ' + overdueList.length + ' รายการ');

  sendEmailSafe_(recipients, subject, finalHtml, '');
}

function setupDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'checkOverdueNewIssues') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('checkOverdueNewIssues')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
}

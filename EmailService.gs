/**
 * ============================================================================
 * DAIHEN Helpdesk & Issue Tracking System (Pro)
 * File: EmailService.gs
 * ============================================================================
 */

function sendNewIssueAlertEmail(data) {
  var settings = getSettingsMap_();
  var recipients = settings['AdminEmails'] || 'premwit@daihen.co.th';
  var cc = settings['CcEmails'] || '';

  var priorityColors = {
    'Urgent': '#b91c1c',
    'High': '#ea580c',
    'Medium': '#1e4a8c',
    'Low': '#15803d'
  };
  var pColor = priorityColors[data.priority] || '#1e4a8c';

  var contentHtml = 
    '<h2 style="margin:0 0 16px 0; color:#181715; font-size:20px; font-weight:600;">📋 มีการแจ้งปัญหาใหม่ในระบบ</h2>' +
    '<div style="background:#faf9f5; border:1px solid #e5e0d8; border-radius:12px; padding:20px; margin-bottom:20px;">' +
      '<table style="width:100%; border-collapse:collapse; font-size:14px; line-height:1.6;">' +
        '<tr><td style="width:120px; color:#706e6a; padding:6px 0;">รหัสรายการ:</td><td style="font-weight:700; color:#181715;">' + data.id + '</td></tr>' +
        '<tr><td style="color:#706e6a; padding:6px 0;">หัวข้อปัญหา:</td><td style="font-weight:600; color:#181715;">' + data.project + '</td></tr>' +
        '<tr><td style="color:#706e6a; padding:6px 0;">ความเร่งด่วน:</td><td><span style="display:inline-block; padding:3px 10px; border-radius:999px; font-weight:700; font-size:12px; color:#fff; background-color:' + pColor + ';">' + data.priority + '</span></td></tr>' +
        '<tr><td style="color:#706e6a; padding:6px 0;">แผนก / หมวดหมู่:</td><td style="color:#181715;">' + data.section + ' / ' + data.category + '</td></tr>' +
        '<tr><td style="color:#706e6a; padding:6px 0;">ผู้แจ้ง:</td><td style="color:#181715;">' + data.reporter + (data.reporterEmail ? ' (' + data.reporterEmail + ')' : '') + '</td></tr>' +
        '<tr><td style="color:#706e6a; vertical-align:top; padding:6px 0;">รายละเอียด:</td><td style="color:#42403d; white-space:pre-wrap;">' + data.description + '</td></tr>' +
      '</table>' +
    '</div>' +
    '<p style="margin:0; font-size:13px; color:#706e6a;">กรุณาเข้าสู่ระบบ Helpdesk เพื่อตรวจสอบและมอบหมายงานให้ทีมงานดำเนินการ</p>';

  var subject = '🔴 [' + data.priority + '] แจ้งปัญหาใหม่: ' + data.id + ' - ' + data.project;
  var finalHtml = buildEmailTemplate_(contentHtml, 'มีการแจ้งปัญหาใหม่: ' + data.project);

  sendEmailSafe_(recipients, subject, finalHtml, cc);
}

function sendStatusChangeEmail(data) {
  var recipient = data.reporterEmail;
  if (!recipient) return; // ไม่ระบุอีเมลผู้แจ้ง ไม่ต้องส่ง

  var settings = getSettingsMap_();
  var cc = settings['CcEmails'] || '';

  var statusColors = {
    'New': '#3a64a8',
    'Waiting': '#d97706',
    'In Progress': '#cc785c',
    'Resolved': '#10b981',
    'Closed': '#6b7280'
  };
  var sColor = statusColors[data.newStatus] || '#181715';

  var contentHtml = 
    '<h2 style="margin:0 0 16px 0; color:#181715; font-size:20px; font-weight:600;">🔄 มีการอัปเดตสถานะปัญหา</h2>' +
    '<p style="font-size:14px; color:#42403d; margin:0 0 16px 0;">เรียนคุณ ' + data.reporter + ',</p>' +
    '<div style="background:#faf9f5; border:1px solid #e5e0d8; border-radius:12px; padding:20px; margin-bottom:20px;">' +
      '<table style="width:100%; border-collapse:collapse; font-size:14px; line-height:1.6;">' +
        '<tr><td style="width:120px; color:#706e6a; padding:6px 0;">รหัสรายการ:</td><td style="font-weight:700; color:#181715;">' + data.id + '</td></tr>' +
        '<tr><td style="color:#706e6a; padding:6px 0;">หัวข้อ:</td><td style="color:#181715;">' + data.project + '</td></tr>' +
        '<tr><td style="color:#706e6a; padding:6px 0;">สถานะเดิม:</td><td style="color:#706e6a; text-decoration:line-through;">' + data.oldStatus + '</td></tr>' +
        '<tr><td style="color:#706e6a; padding:6px 0;">สถานะใหม่:</td><td><span style="display:inline-block; padding:4px 12px; border-radius:999px; font-weight:700; font-size:13px; color:#fff; background-color:' + sColor + ';">' + data.newStatus + '</span></td></tr>' +
      '</table>' +
    '</div>' +
    '<p style="margin:0; font-size:13px; color:#706e6a;">คุณสามารถติดตามความคืบหน้าหรือสอบถามเพิ่มเติมได้ผ่านระบบ Helpdesk</p>';

  var subject = '📢 อัปเดตสถานะ [' + data.newStatus + ']: ' + data.id + ' - ' + data.project;
  var finalHtml = buildEmailTemplate_(contentHtml, 'อัปเดตสถานะงาน: ' + data.newStatus);

  sendEmailSafe_(recipient, subject, finalHtml, cc);
}

function sendEmailSafe_(recipient, subject, htmlBody, cc) {
  try {
    var options = {
      htmlBody: htmlBody,
      name: 'DAIHEN Helpdesk System'
    };
    if (cc) options.cc = cc;

    MailApp.sendEmail(recipient, subject, '', options);
  } catch (err) {
    console.error('MailApp sendEmail failed: ' + err.message);
  }
}

function buildEmailTemplate_(contentHtml, preheader) {
  return '<!DOCTYPE html>' +
    '<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin:0; padding:24px 0; background-color:#f5f3ee; font-family:\'Plus Jakarta Sans\',-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;">' +
      '<div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e8e3dc; box-shadow:0 4px 20px rgba(0,0,0,0.04);">' +
        '<div style="background-color:#181715; padding:24px; text-align:left; border-bottom:3px solid #cc785c;">' +
          '<span style="font-size:20px; font-weight:700; color:#faf9f5; letter-spacing:-0.5px;">DAIHEN</span> ' +
          '<span style="font-size:13px; color:#cc785c; font-weight:600; text-transform:uppercase; margin-left:8px;">Helpdesk &amp; Issue Tracking</span>' +
        '</div>' +
        '<div style="padding:32px 28px;">' +
          contentHtml +
        '</div>' +
        '<div style="background-color:#faf9f5; padding:18px 28px; border-top:1px solid #ede8e1; font-size:12px; color:#85827d; text-align:center;">' +
          'ข้อความนี้ส่งอัตโนมัติจากระบบ DAIHEN Helpdesk (Google Apps Script Engine)' +
        '</div>' +
      '</div>' +
    '</body></html>';
}

function getSettingsMap_() {
  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Settings');
    if (!sheet) return {};
    var data = sheet.getDataRange().getValues();
    var map = {};
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        map[String(data[i][0]).trim()] = String(data[i][1] || '').trim();
      }
    }
    return map;
  } catch(e) {
    return {};
  }
}

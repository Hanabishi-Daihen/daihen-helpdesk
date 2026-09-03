/**
 * ============================================================================
 * DAIHEN Helpdesk & Issue Tracking System (Pro)
 * File: Code.gs
 * ============================================================================
 */

var SPREADSHEET_ID = '15v9iVv9_3b-s0lH53nZ2L-m8fQjBvV3x';
var SHEET_NAME = 'Data';

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  // รองรับลิงก์ตรงไปยังรายการ เช่น ...exec?issue=ISS-2026001
  template.deepLinkIssueId = (e && e.parameter && e.parameter.issue) ? e.parameter.issue : '';
  return template.evaluate()
      .setTitle('ระบบแจ้งปัญหาและติดตามงาน (Pro) | DAIHEN Helpdesk')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
}

/**
 * ป้องกัน Race Condition ด้วย LockService
 */
function withLock_(callback) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // รอสูงสุด 10 วินาที
    return callback();
  } catch (e) {
    console.error('Lock error: ' + e.message);
    throw new Error('ระบบกำลังประมวลผลคำขออื่นอยู่ กรุณาลองใหม่อีกครั้ง (' + e.message + ')');
  } finally {
    lock.releaseLock();
  }
}

/**
 * ฟังก์ชันดึงสถิติ Dashboard สำหรับแสดงผลภาพรวม
 */
function getDashboardStats() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('dashboard_stats_v2');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch(e) {}
  }

  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var stats = {
    total: 0,
    status: { "New": 0, "Waiting": 0, "In Progress": 0, "Resolved": 0, "Closed": 0 },
    category: {},
    newIssuesCount: 0,
    newIssuesList: []
  };

  if (data.length <= 1) return stats;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = row[7] || 'New';
    var category = row[5] || 'อื่นๆ';
    var issueId = row[0];
    var project = row[1];

    stats.total++;
    stats.status[status] = (stats.status[status] || 0) + 1;
    stats.category[category] = (stats.category[category] || 0) + 1;

    if (status === 'New') {
      stats.newIssuesCount++;
      if (stats.newIssuesList.length < 5) {
        stats.newIssuesList.push({ id: issueId, project: project });
      }
    }
  }

  cache.put('dashboard_stats_v2', JSON.stringify(stats), 120); // แคช 2 นาที
  return stats;
}

/**
 * ฟังก์ชันดึงข้อมูล Issues พร้อมรองรับการค้นหา กรอง และ Pagination
 */
function getIssues(page, pageSize, search, statusFilter, sectionFilter) {
  page = page || 1;
  pageSize = pageSize || 100;
  search = (search || '').toLowerCase();
  statusFilter = statusFilter || 'All';
  sectionFilter = sectionFilter || 'All';

  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { data: [], total: 0, totalPages: 0, page: page };

  var filtered = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var id = String(row[0] || '');
    var project = String(row[1] || '');
    var description = String(row[2] || '');
    var reporter = String(row[3] || '');
    var section = String(row[4] || '');
    var category = String(row[5] || '');
    var status = String(row[7] || 'New');
    var priority = String(row[9] || 'Medium');
    var reporterEmail = String(row[11] || '');

    // กรอง Status
    if (statusFilter !== 'All') {
      var allowedStatuses = statusFilter.split(',');
      if (allowedStatuses.indexOf(status) === -1) continue;
    }

    // กรอง Section
    if (sectionFilter !== 'All' && section !== sectionFilter) continue;

    // กรองข้อความค้นหา
    if (search) {
      var match = id.toLowerCase().indexOf(search) > -1 ||
                  project.toLowerCase().indexOf(search) > -1 ||
                  description.toLowerCase().indexOf(search) > -1 ||
                  reporter.toLowerCase().indexOf(search) > -1 ||
                  section.toLowerCase().indexOf(search) > -1 ||
                  category.toLowerCase().indexOf(search) > -1;
      if (!match) continue;
    }

    filtered.push({
      id: id,
      project: project,
      description: description,
      reporter: reporter,
      section: section,
      category: category,
      files: parseJSONSafe_(row[6], []),
      reportedDate: row[12] ? Utilities.formatDate(new Date(row[12]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
      status: status,
      chat: parseJSONSafe_(row[8], []),
      priority: priority,
      timestamp: row[10] ? Utilities.formatDate(new Date(row[10]), Session.getScriptTimeZone(), 'dd/MM/yyyy, HH:mm:ss') : '',
      reporterEmail: reporterEmail
    });
  }

  // เรียงลำดับจากใหม่สุดไปเก่าสุด
  filtered.reverse();

  var total = filtered.length;
  var totalPages = Math.ceil(total / pageSize) || 1;
  var startIndex = (page - 1) * pageSize;
  var pageData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    data: pageData,
    total: total,
    totalPages: totalPages,
    page: page
  };
}

/**
 * บันทึกปัญหาใหม่
 */
function saveIssue(rawFormData) {
  return withLock_(function() {
    var formData = sanitizeIssueFormData_(rawFormData);
    var sheet = getSheet();
    var runNo = sheet.getLastRow();
    var newId = "ISS-" + new Date().getFullYear() + ("000" + runNo).slice(-3);

    var uploadedFiles = [];
    if (rawFormData.files && rawFormData.files.length > 0) {
      uploadedFiles = uploadFilesToDrive(rawFormData.files);
    }

    var now = new Date();
    var initialChat = [
      {
        id: 'c-' + now.getTime(),
        sender: 'System',
        message: 'เปิดเรื่องแจ้งปัญหาเข้าสู่ระบบเรียบร้อย',
        time: Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm"),
        type: 'status',
        newStatus: 'New'
      }
    ];

    var newRow = [
      newId,
      formData.project,
      formData.description,
      formData.reporter,
      formData.section,
      formData.category,
      JSON.stringify(uploadedFiles),
      'New',
      JSON.stringify(initialChat),
      formData.priority,
      now,
      formData.reporterEmail || '',
      now
    ];

    sheet.appendRow(newRow);

    // ล้าง Cache สถิติ
    CacheService.getScriptCache().remove('dashboard_stats_v2');

    // ส่งอีเมลแจ้งเตือน
    try {
      sendNewIssueAlertEmail({
        id: newId,
        project: formData.project,
        reporter: formData.reporter,
        section: formData.section,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        reporterEmail: formData.reporterEmail
      });
    } catch(e) {
      console.warn('Send email alert failed: ' + e.message);
    }

    return { success: true, id: newId };
  });
}

/**
 * อัปเดตสถานะงาน
 */
function updateStatus(issueId, newStatus) {
  return withLock_(function() {
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    var i = findIssueRowIndex_(data, issueId);

    if (i === -1) {
      throw new Error('ไม่พบข้อมูลรายการที่ระบุ (' + issueId + ')');
    }

    var oldStatus = data[i][7];
    sheet.getRange(i + 1, 8).setValue(newStatus);

    // บันทึกลง Chat History
    var currentChat = parseJSONSafe_(data[i][8], []);
    var now = new Date();
    currentChat.push({
      id: 'sys-' + now.getTime(),
      sender: 'System',
      message: 'สถานะเปลี่ยนจาก "' + oldStatus + '" เป็น "' + newStatus + '"',
      time: Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm"),
      type: 'status',
      newStatus: newStatus
    });

    sheet.getRange(i + 1, 9).setValue(JSON.stringify(currentChat));
    CacheService.getScriptCache().remove('dashboard_stats_v2');

    // ส่งอีเมลแจ้งเตือนการเปลี่ยนสถานะ
    try {
      sendStatusChangeEmail({
        id: issueId,
        project: data[i][1],
        reporter: data[i][3],
        reporterEmail: data[i][11],
        oldStatus: oldStatus,
        newStatus: newStatus
      });
    } catch(e) {
      console.warn('Status change email error: ' + e.message);
    }

    return { success: true, chat: currentChat };
  });
}

/**
 * ส่งข้อความ Chat และไฟล์แนบเพิ่มเติม
 */
function addChat(issueId, messageObj) {
  return withLock_(function() {
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    var i = findIssueRowIndex_(data, issueId);

    if (i === -1) {
      throw new Error('ไม่พบข้อมูลรายการที่ระบุ (' + issueId + ')');
    }

    var currentChat = parseJSONSafe_(data[i][8], []);
    var uploadedFiles = [];
    if (messageObj.files && messageObj.files.length > 0) {
      uploadedFiles = uploadFilesToDrive(messageObj.files);
    }

    var newMsg = {
      id: 'c-' + new Date().getTime(),
      sender: messageObj.sender,
      message: messageObj.message,
      time: messageObj.time || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm"),
      read: false,
      files: uploadedFiles
    };

    currentChat.push(newMsg);
    sheet.getRange(i + 1, 9).setValue(JSON.stringify(currentChat));

    return { success: true, chat: currentChat };
  });
}

/**
 * อัปเดตรายละเอียดของ Issue (Admin แก้ไขข้อมูล)
 */
function updateIssueDetails(issueId, updates) {
  return withLock_(function() {
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    var i = findIssueRowIndex_(data, issueId);

    if (i === -1) {
      throw new Error('ไม่พบข้อมูลรายการที่ระบุ (' + issueId + ')');
    }

    var row = data[i];
    var currentChat = parseJSONSafe_(row[8], []);
    var now = new Date();
    var timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm");
    var changedFields = [];

    // Project title (Col B -> index 1)
    if (updates.project !== undefined && updates.project !== row[1]) {
      sheet.getRange(i + 1, 2).setValue(updates.project);
      changedFields.push('หัวข้อ: "' + updates.project + '"');
    }

    // Description (Col C -> index 2)
    if (updates.description !== undefined && updates.description !== row[2]) {
      sheet.getRange(i + 1, 3).setValue(updates.description);
      changedFields.push('รายละเอียดปัญหา');
    }

    // Reporter (Col D -> index 3)
    if (updates.reporter !== undefined && updates.reporter !== row[3]) {
      sheet.getRange(i + 1, 4).setValue(updates.reporter);
      changedFields.push('ผู้แจ้ง: "' + updates.reporter + '"');
    }

    // Section (Col E -> index 4)
    if (updates.section !== undefined && updates.section !== row[4]) {
      sheet.getRange(i + 1, 5).setValue(updates.section);
      changedFields.push('แผนก: "' + updates.section + '"');
    }

    // Category (Col F -> index 5)
    if (updates.category !== undefined && updates.category !== row[5]) {
      sheet.getRange(i + 1, 6).setValue(updates.category);
      changedFields.push('หมวดหมู่: "' + updates.category + '"');
    }

    // Priority (Col J -> index 9)
    if (updates.priority !== undefined && updates.priority !== row[9]) {
      sheet.getRange(i + 1, 10).setValue(updates.priority);
      changedFields.push('ความเร่งด่วน: "' + updates.priority + '"');
    }

    // Reporter Email (Col L -> index 11)
    if (updates.reporterEmail !== undefined && updates.reporterEmail !== row[11]) {
      sheet.getRange(i + 1, 12).setValue(updates.reporterEmail);
      changedFields.push('อีเมลผู้แจ้ง: "' + updates.reporterEmail + '"');
    }

    // บันทึก Log เข้าระบบ Chat
    if (changedFields.length > 0) {
      currentChat.push({
        id: 'edit-' + now.getTime(),
        sender: 'System',
        message: 'Admin ได้แก้ไขข้อมูล: ' + changedFields.join(', '),
        time: timeStr,
        type: 'status'
      });
      sheet.getRange(i + 1, 9).setValue(JSON.stringify(currentChat));
      CacheService.getScriptCache().remove('dashboard_stats_v2');
    }

    return {
      success: true,
      chat: currentChat,
      changedFields: changedFields
    };
  });
}

/**
 * ทำเครื่องหมายข้อความว่าอ่านแล้ว
 */
function markAsRead(issueId, readerType) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var i = findIssueRowIndex_(data, issueId);

  if (i === -1) return { success: false };

  var currentChat = parseJSONSafe_(data[i][8], []);
  var updated = false;

  currentChat.forEach(function(msg) {
    if (readerType === 'Admin' && msg.sender !== 'Admin' && msg.sender !== 'System') {
      msg.read = true;
      updated = true;
    } else if (readerType === 'User' && msg.sender === 'Admin') {
      msg.read = true;
      updated = true;
    }
  });

  if (updated) {
    sheet.getRange(i + 1, 9).setValue(JSON.stringify(currentChat));
  }

  return { success: true };
}

/**
 * ตรวจสอบการแจ้งเตือน
 */
function checkAlerts(readerType) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var newChatCount = 0;
  var newIssuesCount = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = row[7];
    if (status === 'New') newIssuesCount++;

    var chat = parseJSONSafe_(row[8], []);
    chat.forEach(function(msg) {
      if (readerType === 'Admin' && msg.sender !== 'Admin' && msg.sender !== 'System' && !msg.read) {
        newChatCount++;
      }
    });
  }

  return {
    newChatCount: newChatCount,
    newIssuesCount: newIssuesCount
  };
}

// ----------------------------------------------------------------------------
// Helper Utilities
// ----------------------------------------------------------------------------

function findIssueRowIndex_(data, issueId) {
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(issueId).trim()) {
      return i;
    }
  }
  return -1;
}

function parseJSONSafe_(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch(e) {
    return fallback;
  }
}

function sanitizeIssueFormData_(form) {
  return {
    project: String(form.project || '').substring(0, 300),
    description: String(form.description || '').substring(0, 4000),
    reporter: String(form.reporter || '').substring(0, 100),
    section: String(form.section || 'MF').substring(0, 50),
    category: String(form.category || 'อื่นๆ').substring(0, 50),
    priority: String(form.priority || 'Medium').substring(0, 20),
    reporterEmail: String(form.reporterEmail || '').substring(0, 150)
  };
}

/**
 * ============================================================================
 * DAIHEN Helpdesk & Issue Tracking System (Pro)
 * File: FileService.gs
 * ============================================================================
 */

var DRIVE_FOLDER_ID = '1Qx0_sN34kX_6L1v7Xz_9B8p5M2n0q1r'; // ค่าเริ่มต้นโฟลเดอร์ Google Drive

function uploadFilesToDrive(filesData) {
  if (!filesData || !filesData.length) return [];

  var folder;
  try {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (e) {
    console.warn('ไม่สามารถเปิดโฟลเดอร์ตาม ID ได้ กำลังใช้โฟลเดอร์ DAIHEN_Helpdesk_Uploads: ' + e.message);
    var folders = DriveApp.getFoldersByName('DAIHEN_Helpdesk_Uploads');
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('DAIHEN_Helpdesk_Uploads');
    }
  }

  var fileLinks = [];
  filesData.forEach(function(file) {
    try {
      if (!file || !file.data) {
        if (file && file.url) {
          fileLinks.push(file);
        }
        return;
      }

      var dataUrl = file.data;
      var semiIdx = dataUrl.indexOf(';');
      var commaIdx = dataUrl.indexOf(',');

      if (semiIdx === -1 || commaIdx === -1) {
        if (file.url) fileLinks.push(file);
        return;
      }

      var contentType = dataUrl.substring(5, semiIdx);
      var base64Content = dataUrl.substring(commaIdx + 1);
      var blob = Utilities.newBlob(Utilities.base64Decode(base64Content), contentType, file.name || 'attachment');
      var driveFile = folder.createFile(blob);

      try {
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {
        console.warn('Set sharing failed: ' + shareErr.message);
      }

      var fileId = driveFile.getId();
      var isImage = contentType.indexOf('image/') === 0;

      fileLinks.push({
        name: file.name,
        type: contentType,
        url: driveFile.getUrl(),
        thumbnail: isImage ? ('https://drive.google.com/thumbnail?id=' + fileId + '&sz=w200') : null
      });
    } catch (err) {
      console.error('Failed to upload file ' + (file ? file.name : 'unknown') + ': ' + err.message);
    }
  });

  return fileLinks;
}

function saveImageDataURL(dataUrl, fileNameBase) {
  try {
    var folder;
    try {
      folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    } catch (e) {
      var folders = DriveApp.getFoldersByName('DAIHEN_Helpdesk_Uploads');
      folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('DAIHEN_Helpdesk_Uploads');
    }

    var semiIdx = dataUrl.indexOf(';');
    var commaIdx = dataUrl.indexOf(',');
    var contentType = dataUrl.substring(5, semiIdx);
    var base64Content = dataUrl.substring(commaIdx + 1);
    var ext = contentType.split('/')[1] || 'png';
    var fileName = (fileNameBase || 'upload') + '_' + new Date().getTime() + '.' + ext;

    var blob = Utilities.newBlob(Utilities.base64Decode(base64Content), contentType, fileName);
    var driveFile = folder.createFile(blob);
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      url: driveFile.getUrl(),
      id: driveFile.getId()
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

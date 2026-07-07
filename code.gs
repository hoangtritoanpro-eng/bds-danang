// ============================================================
// BẤT ĐỘNG SẢN ĐÀ NẴNG – code.gs
// ============================================================

// Chạy hàm này một lần duy nhất từ Google Apps Script Editor để cấp quyền Google Drive
function authorizeDrive() {
  var folder = DriveApp.createFolder('BDS_Images_Temp_' + new Date().getTime());
  folder.createFile('test.txt', 'test');
  folder.setTrashed(true); // Xóa ngay sau khi tạo
}

var SHEET = {
  USERS:      'Users',
  DISTRICTS:  'Districts',
  PROPERTIES: 'Properties',
  INQUIRIES:  'Inquiries'
};

var COL = {
  USERS:      ['Email', 'Name', 'Role', 'Pin', 'Active'],
  DISTRICTS:  ['DistrictID', 'Name', 'CoverImage'],
  PROPERTIES: ['PropertyID', 'Type', 'DistrictID', 'Street', 'Price', 'Area', 'Images', 'Amenities', 'Description', 'ContactPhone', 'Status', 'Video'],
  INQUIRIES:  ['InquiryID', 'PropertyID', 'CustomerName', 'CustomerPhone', 'Note', 'Date', 'Status']
};

function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

function getSheet(name) {
  var sheet = ss().getSheetByName(name);
  if (!sheet) {
    sheet = ss().insertSheet(name);
    var cols = COL[Object.keys(SHEET).find(k => SHEET[k] === name)];
    if (cols) sheet.getRange(1, 1, 1, cols.length).setValues([cols]);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      var v = row[i];
      if (v instanceof Date) {
        obj[h] = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else if (v === true || v === 'true' || v === 'TRUE') obj[h] = 'TRUE';
      else if (v === false || v === 'false' || v === 'FALSE') obj[h] = 'FALSE';
      else obj[h] = (v === null || v === undefined) ? '' : String(v);
    });
    return obj;
  });
}

function ok(data) { return ContentService.createTextOutput(JSON.stringify({ ok: true, data: data })).setMimeType(ContentService.MimeType.JSON); }
function err(msg) { return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg })).setMimeType(ContentService.MimeType.JSON); }

function generateId(prefix, sheet) {
  var rows = sheet.getLastRow() - 1;
  var n = rows < 0 ? 0 : rows;
  return prefix + String(n + 1).padStart(3, '0');
}

function today() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// ==========================================
// ENTRY POINT
// ==========================================
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var email = body.authEmail || body.email || '';

    switch (action) {
      case 'login': return login(body);
      case 'getPublicData': return getPublicData(body);
      case 'submitInquiry': return submitInquiry(body);
      
      // Admin only
      case 'getAdminData': return getAdminData(body, email);
      case 'uploadImage': return uploadImage(body, email);
      case 'addProperty': return addProperty(body, email);
      case 'editProperty': return editProperty(body, email);
      case 'deleteProperty': return deleteProperty(body, email);
      case 'updateInquiryStatus': return updateInquiryStatus(body, email);
      case 'deleteInquiry': return deleteInquiry(body, email);
      case 'addDistrict': return addDistrict(body, email);
      case 'editDistrict': return editDistrict(body, email);
      case 'deleteDistrict': return deleteDistrict(body, email);
      
      default: return err('Action không hợp lệ: ' + action);
    }
  } catch(ex) {
    return err(ex.message || String(ex));
  }
}

// ==========================================
// AUTH
// ==========================================
function requireAuth(email) {
  if (!email) throw new Error('Chưa đăng nhập');
  var users = sheetToObjects(getSheet(SHEET.USERS));
  var u = users.find(function(x){ return x.Email === email && x.Active === 'TRUE'; });
  if (!u) throw new Error('Tài khoản không tồn tại hoặc đã bị khóa');
  return u;
}

function login(body) {
  var users = sheetToObjects(getSheet(SHEET.USERS));
  var u = users.find(function(x){
    return x.Email === body.email && x.Pin === String(body.pin) && x.Active === 'TRUE';
  });
  if (!u) return err('Email hoặc PIN không đúng');
  return ok({ email: u.Email, name: u.Name, role: u.Role });
}

// ==========================================
// PUBLIC API (Không cần đăng nhập)
// ==========================================
function getPublicData(body) {
  var districts = sheetToObjects(getSheet(SHEET.DISTRICTS));
  var properties = sheetToObjects(getSheet(SHEET.PROPERTIES)).filter(function(p) {
    return p.Status !== 'SOLD'; // Ẩn các bất động sản đã bán
  });
  return ok({ districts: districts, properties: properties });
}

function submitInquiry(body) {
  var sheet = getSheet(SHEET.INQUIRIES);
  var id = generateId('INQ', sheet);
  var attachmentUrl = '';
  
  if (body.image) {
    try {
      var folderName = 'BDS_Images';
      var folders = DriveApp.getFoldersByName(folderName);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
      
      var decoded = Utilities.base64Decode(body.image.split(',')[1]);
      var blob = Utilities.newBlob(decoded, body.mimeType || 'image/jpeg', id + '_' + (body.imageName || 'upload.jpg'));
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      attachmentUrl = file.getDownloadUrl();
    } catch(e) {
      attachmentUrl = 'Lỗi upload ảnh: ' + e.toString();
    }
  }

  var note = body.note || '';
  if (attachmentUrl) {
    note += '\n[Ảnh đính kèm]: ' + attachmentUrl;
  }

  sheet.appendRow([
    id,
    body.propertyId || '',
    body.customerName || '',
    body.customerPhone ? ("'" + body.customerPhone) : '',
    note,
    today(),
    'NEW'
  ]);
  return ok({ inquiryId: id });
}

// ==========================================
// ADMIN API
// ==========================================
function getAdminData(body, email) {
  requireAuth(email);
  var districts = sheetToObjects(getSheet(SHEET.DISTRICTS));
  var properties = sheetToObjects(getSheet(SHEET.PROPERTIES));
  var inquiries = sheetToObjects(getSheet(SHEET.INQUIRIES));
  return ok({ districts: districts, properties: properties, inquiries: inquiries });
}

function uploadImage(body, email) {
  requireAuth(email);
  if (!body.image) return err('Không có ảnh');
  try {
    var folderName = 'BDS_Images';
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var decoded = Utilities.base64Decode(body.image.split(',')[1]);
    var blob = Utilities.newBlob(decoded, body.mimeType || 'image/jpeg', 'upload_' + new Date().getTime() + '.jpg');
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return ok({ url: file.getDownloadUrl() });
  } catch(e) {
    return err('Lỗi upload ảnh: ' + e.toString());
  }
}

function addProperty(body, email) {
  requireAuth(email);
  var sheet = getSheet(SHEET.PROPERTIES);
  var id = generateId('PRP', sheet);
  sheet.appendRow([
    id,
    body.type || 'RENT',
    body.districtId || '',
    body.street || '',
    body.price || '',
    body.area || '',
    body.images || '',
    body.amenities || '',
    body.description || '',
    body.contactPhone ? ("'" + body.contactPhone) : '',
    body.status || 'AVAILABLE',
    body.video || ''
  ]);
  return ok({ propertyId: id });
}

function editProperty(body, email) {
  requireAuth(email);
  var sheet = getSheet(SHEET.PROPERTIES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === body.propertyId) {
      if (body.type !== undefined) sheet.getRange(i+1, 2).setValue(body.type);
      if (body.districtId !== undefined) sheet.getRange(i+1, 3).setValue(body.districtId);
      if (body.street !== undefined) sheet.getRange(i+1, 4).setValue(body.street);
      if (body.price !== undefined) sheet.getRange(i+1, 5).setValue(body.price);
      if (body.area !== undefined) sheet.getRange(i+1, 6).setValue(body.area);
      if (body.images !== undefined) sheet.getRange(i+1, 7).setValue(body.images);
      if (body.amenities !== undefined) sheet.getRange(i+1, 8).setValue(body.amenities);
      if (body.description !== undefined) sheet.getRange(i+1, 9).setValue(body.description);
      if (body.contactPhone !== undefined) sheet.getRange(i+1, 10).setValue(body.contactPhone);
      if (body.status !== undefined) sheet.getRange(i+1, 11).setValue(body.status);
      if (body.video !== undefined) sheet.getRange(i+1, 12).setValue(body.video);
      return ok('updated');
    }
  }
  return err('Không tìm thấy mặt bằng');
}

function deleteProperty(body, email) {
  requireAuth(email);
  var sheet = getSheet(SHEET.PROPERTIES);
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === body.propertyId) {
      sheet.deleteRow(i + 1);
      return ok('deleted');
    }
  }
  return err('Không tìm thấy mặt bằng');
}

function addDistrict(body, email) {
  requireAuth(email);
  var sheet = getSheet(SHEET.DISTRICTS);
  var id = generateId('D_', sheet);
  sheet.appendRow([
    id,
    body.name || '',
    body.coverImage || ''
  ]);
  return ok({ districtId: id });
}

function editDistrict(body, email) {
  requireAuth(email);
  var sheet = getSheet(SHEET.DISTRICTS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === body.districtId) {
      if (body.name !== undefined) sheet.getRange(i+1, 2).setValue(body.name);
      if (body.coverImage !== undefined) sheet.getRange(i+1, 3).setValue(body.coverImage);
      return ok('updated');
    }
  }
  return err('Không tìm thấy quận/huyện');
}

function deleteDistrict(body, email) {
  requireAuth(email);
  var sheet = getSheet(SHEET.DISTRICTS);
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === body.districtId) {
      sheet.deleteRow(i + 1);
      return ok('deleted');
    }
  }
  return err('Không tìm thấy quận/huyện');
}

function updateInquiryStatus(body, email) {
  requireAuth(email);
  var sheet = getSheet(SHEET.INQUIRIES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === body.inquiryId) {
      sheet.getRange(i+1, 7).setValue(body.status);
      return ok('updated');
    }
  }
  return err('Không tìm thấy yêu cầu');
}

function deleteInquiry(body, email) {
  requireAuth(email);
  var sheet = getSheet(SHEET.INQUIRIES);
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === body.inquiryId) {
      sheet.deleteRow(i + 1);
      return ok('deleted');
    }
  }
  return err('Không tìm thấy yêu cầu');
}

// ==========================================
// SETUP
// ==========================================
function setupSheets() {
  Object.values(SHEET).forEach(function(name) {
    getSheet(name);
  });
  
  var userSheet = getSheet(SHEET.USERS);
  if (userSheet.getLastRow() < 2) {
    userSheet.appendRow(['admin@bds.com', 'Admin BĐS', 'ADMIN', '1234', 'TRUE']);
  }
  
  var distSheet = getSheet(SHEET.DISTRICTS);
  if (distSheet.getLastRow() < 2) {
    var districts = [
      ['D_HAICHAU', 'Hải Châu', 'https://example.com/haichau.jpg'],
      ['D_THANHKHE', 'Thanh Khê', 'https://example.com/thanhkhe.jpg'],
      ['D_SONTRA', 'Sơn Trà', 'https://example.com/sontra.jpg'],
      ['D_NGUHANHSON', 'Ngũ Hành Sơn', 'https://example.com/nguhanhson.jpg'],
      ['D_LIENCHIEU', 'Liên Chiểu', 'https://example.com/lienchieu.jpg'],
      ['D_CAMLE', 'Cẩm Lệ', 'https://example.com/camle.jpg'],
      ['D_HOAVANG', 'Hòa Vang', 'https://example.com/hoavang.jpg']
    ];
    districts.forEach(d => distSheet.appendRow(d));
  }
  
  SpreadsheetApp.getUi().alert('✅ Đã tạo các Sheet thành công!\n\nTài khoản Admin mặc định:\nEmail: admin@bds.com\nPIN: 1234');
}

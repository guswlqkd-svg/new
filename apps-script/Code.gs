const SPREADSHEET_ID = '1sf-dfEDWxGV2fFFXE3gGCFzNL-B3uQERmwjs7hCqVWM';
const SHEET_NAME = '한줄댓글';
const MAX_LENGTH = 120;

function getCommentSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['작성일시', '댓글']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    const message = String(payload.message || '').trim();
    if (!message || message.length > MAX_LENGTH) {
      return json_({ ok: false, error: '댓글은 1~120자로 입력해주세요.' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // Prevent spreadsheet formula injection from user-entered text.
      const safeMessage = /^[=+\\-@]/.test(message) ? "'" + message : message;
      getCommentSheet_().appendRow([new Date(), safeMessage]);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

function doGet(e) {
  try {
    const sheet = getCommentSheet_();
    const lastRow = sheet.getLastRow();
    const startRow = Math.max(2, lastRow - 29);
    const rows = lastRow < 2 ? [] : sheet.getRange(startRow, 1, lastRow - startRow + 1, 2).getDisplayValues();
    const comments = rows.reverse().map(row => ({ date: row[0], message: row[1] }));
    const callback = e && e.parameter && e.parameter.callback;
    const body = JSON.stringify(comments).replace(/</g, '\\u003c');
    if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      return ContentService.createTextOutput(callback + '(' + body + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

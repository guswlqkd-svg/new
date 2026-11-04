const SPREADSHEET_ID = '1sf-dfEDWxGV2fFFXE3gGCFzNL-B3uQERmwjs7hCqVWM';
const SHEET_NAME = '한줄댓글';
const MAX_LENGTH = 120;

// 시트 탭과 헤더 행이 없으면 자동 생성합니다.
function getCommentSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 2).setValues([['작성일시', '댓글']]);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  }

  return sheet;
}

// 웹페이지에서 댓글을 POST하면 스프레드시트에 한 행으로 저장합니다.
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents
      ? e.postData.contents
      : '{}';
    const payload = JSON.parse(raw);
    const message = String(payload.message || '').trim();

    if (!message || message.length > MAX_LENGTH) {
      return json_({ ok: false, error: '댓글은 1~120자로 입력해주세요.' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      // 수식으로 실행될 수 있는 입력을 문자로 저장해 수식 삽입을 방지합니다.
      const safeMessage = /^[=+@-]/.test(message) ? "'" + message : message;
      getCommentSheet_().appendRow([new Date(), safeMessage]);
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

// 최근 댓글 30개를 최신순으로 반환합니다. 브라우저 JSONP 조회를 지원합니다.
function doGet(e) {
  try {
    const sheet = getCommentSheet_();
    const lastRow = sheet.getLastRow();
    const firstDataRow = Math.max(2, lastRow - 29);
    const rows = lastRow < 2
      ? []
      : sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, 2).getDisplayValues();

    const comments = rows.reverse().map(row => ({
      date: row[0],
      message: row[1]
    }));

    const body = JSON.stringify(comments).replace(/</g, '\\u003c');
    const callback = e && e.parameter && e.parameter.callback;

    if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      return ContentService
        .createTextOutput(callback + '(' + body + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(body)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

// 편집기에서 한 번 실행하면 DB 접근 권한을 승인하고 댓글 탭/헤더를 미리 만듭니다.
function setup() {
  const sheet = getCommentSheet_();
  Logger.log('준비 완료: ' + sheet.getName());
}

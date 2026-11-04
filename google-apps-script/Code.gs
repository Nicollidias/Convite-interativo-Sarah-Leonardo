const RSVP_SHEET_PROPERTY = 'RSVP_SPREADSHEET_ID';
const RSVP_TAB_NAME = 'Confirmações';
const SARAH_EMAIL = 'nicollijdias@gmail.com';

/** Run once from the Apps Script editor. Creates the shared RSVP spreadsheet. */
function setup() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty(RSVP_SHEET_PROPERTY);
  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create('Confirmações — Sarah e Leonardo');
    properties.setProperty(RSVP_SHEET_PROPERTY, spreadsheet.getId());
  }

  let sheet = spreadsheet.getSheetByName(RSVP_TAB_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(RSVP_TAB_NAME);
  spreadsheet.getSheets().forEach(existingSheet => {
    if (existingSheet.getSheetId() !== sheet.getSheetId() && existingSheet.getLastRow() === 0) {
      spreadsheet.deleteSheet(existingSheet);
    }
  });
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data e hora', 'Grupo', 'Nome', 'Status']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    sheet.autoResizeColumns(1, 4);
  }

  Logger.log('Planilha criada: ' + spreadsheet.getUrl());
  MailApp.getRemainingDailyQuota(); // Solicita a autorização para enviar as notificações por e-mail.
  return spreadsheet.getUrl();
}

/** Receives a guest list and stores one checklist row per confirmed person. */
function doPost(event) {
  try {
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty(RSVP_SHEET_PROPERTY);
    if (!spreadsheetId) throw new Error('Execute setup() antes de publicar o Web App.');
    if (!SARAH_EMAIL || SARAH_EMAIL.indexOf('@') < 1) throw new Error('Configure o e-mail da Sarah no código.');

    const payload = JSON.parse(event.postData.contents || '{}');
    const names = Array.isArray(payload.names)
      ? payload.names.map(cleanName).filter(Boolean).slice(0, 20)
      : [];
    if (!names.length) throw new Error('A lista de nomes está vazia.');

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(RSVP_TAB_NAME);
    if (!sheet) throw new Error('A aba de confirmações não foi encontrada.');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const now = new Date();
      const groupId = Utilities.getUuid();
      const rows = names.map(name => [now, groupId, name, 'Confirmado']);
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
      MailApp.sendEmail({
        to: SARAH_EMAIL,
        subject: 'Nova confirmação — Sarah e Leonardo',
        body: 'Uma nova confirmação foi registrada.\n\nConvidados:\n' +
          names.map((name, index) => (index + 1) + '. ' + name).join('\n') +
          '\n\nTotal: ' + names.length + ' pessoa(s).\n\nLista completa: ' + spreadsheet.getUrl()
      });
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error.message || error) });
  }
}

function cleanName(value) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 100);
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

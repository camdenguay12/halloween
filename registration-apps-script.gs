/**
 * Cup Pong registration endpoint for Halloween at Ramsgate Ridge.
 * Paste this file into Extensions > Apps Script in the Cup Pong Registration Google Sheet.
 * Deploy as Web app: Execute as Me; access Anyone.
 */
const SHEET_NAME = 'Sheet1';
const CLOSE_AT = new Date('2026-10-30T19:30:00-04:00').getTime();
function doGet() {
  return HtmlService.createHtmlOutput('<h2>Cup Pong Registration</h2><p>Please register through the Halloween invitation website.</p>');
}
function doPost(e) {
  const p = (e && e.parameter) || {};
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const response = (message, ok) => HtmlService.createHtmlOutput(
    '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:20px Arial;background:#1c1121;color:#fff1dc;text-align:center;padding:45px 15px}a{color:#ff963b}</style><h2>'+escape(message)+'</h2><p><a href="https://camdenguay12.github.io/halloween/">Return to invitation</a></p>'
  );
  if (p.website) return response('Invalid submission.',false);
  const fields = ['team','player1','player2'].map(k => String(p[k]||'').trim().replace(/\s+/g,' '));
  if (fields.some(v=>!v || v.length>80)) return response('Please complete all three fields (80 characters maximum).',false);
  if (Date.now()>=CLOSE_AT) return response('Registration is closed.',false);
  const lock=LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const sheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if(!sheet) return response('Registration sheet is not configured.',false);
    if(sheet.getLastRow()===0) sheet.appendRow(['Submitted At','Team Name','Player 1','Player 2']);
    const existing=sheet.getLastRow()>1?sheet.getRange(2,2,sheet.getLastRow()-1,1).getDisplayValues().flat():[];
    if(existing.some(v=>v.toLowerCase()===fields[0].toLowerCase())) return response('That team name is already registered. Please choose another.',false);
    // Prefix formula-like values to prevent spreadsheet formula injection.
    const safe=v=>/^[=+\-@]/.test(v)?"'"+v:v;
    sheet.appendRow([new Date(),...fields.map(safe)]);
    return response('Team registered successfully! 🎃',true);
  } catch(err) {
    return response('Registration could not be saved. Please try again.',false);
  } finally {try{lock.releaseLock()}catch(_){}}
}

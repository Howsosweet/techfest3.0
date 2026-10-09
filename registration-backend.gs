/**
 * Tech Fusion 2026 registration backend.
 * Bind this script to the target Google Sheet: Extensions > Apps Script.
 * Script Properties:
 *   ORGANIZER_EMAIL = inbox for registration notifications
 *   SEND_STUDENT_CONFIRMATION = true (optional)
 * Deploy as Web app, Execute as: Me, Who has access: Anyone.
 */
const SHEET_NAME = 'Registrations';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) ? e.parameter : {};
    ['event','name','college','email','phone'].forEach(function(k) {
      if (!String(p[k] || '').trim()) throw new Error('Missing required field: ' + k);
    });
    const email = String(p.email).trim();
    if (!/^[^\s@]+@[^\s@]+\\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
    const phone = String(p.phone).replace(/\s+/g, '');
    if (!/^\\+?[0-9]{10,13}$/.test(phone)) throw new Error('Invalid phone');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('No spreadsheet is bound to this script');
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Registration ID','Submitted At','Event','Category','Full Name','College','Email','Course / Branch / Year','Phone','Team Name / Members','Status']);
      sh.setFrozenRows(1);
    }

    const eventName = String(p.event).trim();
    const category = getCategory_(eventName);
    const id = 'TF26-' + Utilities.getUuid().slice(0,8).toUpperCase();
    sh.appendRow([id,new Date(),eventName,category,String(p.name).trim(),String(p.college).trim(),email,String(p.course||'-').trim(),phone,String(p.team||'-').trim(),'Received']);

    const props = PropertiesService.getScriptProperties();
    const organizerEmail = String(props.getProperty('ORGANIZER_EMAIL') || '').trim();
    if (organizerEmail) {
      const body = [
        'A new Tech Fusion 2026 registration was received.','',
        'Registration ID: '+id,'Event: '+eventName,'Category: '+category,
        'Name: '+String(p.name).trim(),'College: '+String(p.college).trim(),
        'Email: '+email,'Course / Branch / Year: '+String(p.course||'-').trim(),
        'Phone: '+phone,'Team: '+String(p.team||'-').trim(),'',
        'Spreadsheet: '+ss.getUrl()
      ].join('\n');
      MailApp.sendEmail(organizerEmail,'New Tech Fusion 2026 registration: '+eventName,body);
    }
    if (String(props.getProperty('SEND_STUDENT_CONFIRMATION')||'').toLowerCase()==='true') {
      MailApp.sendEmail(email,'Tech Fusion 2026 registration received',
        'Hi '+String(p.name).trim()+',\n\nWe received your registration request for '+eventName+
        '. Your registration ID is '+id+'.\n\nTech Fusion 2026 | Vaish College of Engineering, Rohtak\n26–28 October 2026');
    }
    return json_({ok:true,registrationId:id});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message ? err.message : err)});
  } finally { try { lock.releaseLock(); } catch (ignored) {} }
}
function doGet() { return json_({ok:true,service:'Tech Fusion 2026 registration endpoint'}); }
function getCategory_(n) {
  const tech=['QUIZ','TECHNICAL DEBATE + GD','MANAGEMENT GAMES','SERVER CRASH','PROJECT EXHIBITION','APP / WEB DEVELOPMENT','E-SPORTS','CAPTURE THE FLAG (CTF)','VIRTUAL TREASURE HUNT','TECHNICAL SKIT','DRIFT AND DRAFT'];
  if (tech.indexOf(n)!==-1) return 'TECHNICAL';
  const sports=['100M RACE','LONG JUMP','TABLE TENNIS','CHESS','BADMINTON','COUPLE CRICKET','SLOW CYCLING','3 LEG RACE','SACK RACE'];
  if (sports.some(function(x){return n.indexOf(x)===0;})) return 'SPORTS';
  return 'CULTURAL';
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

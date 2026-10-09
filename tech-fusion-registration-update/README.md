# Tech Fusion 2026 Website

## Google Sheets registration setup
1. Sign into the Google account that should own the registration spreadsheet.
2. Create a Google Sheet, for example `Tech Fusion 2026 Registrations`.
3. In that sheet, choose **Extensions → Apps Script** and replace the script with `registration-backend.gs`.
4. In Apps Script **Project Settings → Script properties**, add `ORGANIZER_EMAIL` with the inbox that should receive registration alerts. Optional: set `SEND_STUDENT_CONFIRMATION` to `true` to email receipts to students.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Deploy and authorize the requested permissions.
6. Copy the web app URL ending in `/exec`.
7. In `index.html`, find `const REG_API_URL="";` and paste that URL between the quotes.
8. Upload the updated `index.html` to your existing website deployment. The registration backend is hosted by Google Apps Script, so Cloudflare Pages can remain a static site.
9. Submit a test registration and verify it appears in the `Registrations` tab and the organiser inbox.

## Which email account is used?
The spreadsheet belongs to the Google account that created it. Registration alerts go to the address configured in `ORGANIZER_EMAIL`. It does not automatically use a college email unless you configure that address. If `SEND_STUDENT_CONFIRMATION` is `true`, the student also receives an email receipt.

## Notes
- Do not put Google passwords or private keys in website code.
- Keep the spreadsheet shared only with organisers who need access.
- Apps Script web app access must allow public submissions for the public registration form to work.
- The website uses a cross-origin no-cors request, so during setup you must verify a test registration in the sheet; the browser cannot read the Apps Script response to prove the row was saved.
- Exact schedule times/venues remain TBA because they were not supplied.

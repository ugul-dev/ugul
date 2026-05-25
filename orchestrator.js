/**
 * ORCHESTRATOR — Two-Agent Pipeline
 * ─────────────────────────────────────────────────────────────────
 *
 * Pipeline:
 *   [Agent 1: Writer] → generates fresh content via web search
 *         ↓
 *   [Agent 2: Auditor] → reviews for accuracy, tone, completeness
 *         ↓ (only if APPROVED)
 *   [Email Builder] → renders polished HTML email
 *         ↓
 *   [Gmail] → saves as draft in ufukdogus@gmail.com
 *
 * Run: node scripts/orchestrator.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { google }        = require('googleapis');
const { generateContent } = require('./agent1_writer');
const { auditContent }    = require('./agent2_auditor');
const { renderEmail }     = require('./render_email');

const RECIPIENT           = 'ufukdogus@gmail.com';
const GMAIL_CLIENT_ID     = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

function getSGTDateLabel() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Singapore'
  });
}

function getWeekLabel() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${week}`;
}

async function createGmailDraft(subject, htmlBody) {
  console.log('\n📧  Creating Gmail draft...');
  const oauth2Client = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const message = [
    `To: ${RECIPIENT}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    `Subject: ${subject}`,
    '',
    htmlBody
  ].join('\r\n');

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw: Buffer.from(message).toString('base64url') } }
  });

  return res.data.id;
}

(async () => {
  const startTime = Date.now();
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Sompo APAC HR Intelligence — Two-Agent Pipeline              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  Started: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SGT\n`);

  try {
    // ── STEP 1: Agent 1 generates content
    const rawContent = await generateContent();

    // ── STEP 2: Agent 2 audits content
    // This will THROW if audit verdict is REJECTED — pipeline stops here
    const approvedContent = await auditContent(rawContent);

    // ── STEP 3: Render HTML email from approved content
    console.log('\n🎨  Building email from approved content...');
    const htmlBody = renderEmail(approvedContent);

    // ── STEP 4: Push to Gmail drafts
    const dateLabel = getSGTDateLabel();
    const weekLabel = getWeekLabel();
    const subject   = `🌏 Sompo APAC HR Intelligence — ${weekLabel} · ${dateLabel}`;
    const draftId   = await createGmailDraft(subject, htmlBody);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
    console.log(`║  ✅  PIPELINE COMPLETE                                        ║`);
    console.log(`╚══════════════════════════════════════════════════════════════╝`);
    console.log(`  Gmail draft ID : ${draftId}`);
    console.log(`  Subject        : ${subject}`);
    console.log(`  Elapsed        : ${elapsed}s`);
    console.log(`  Draft URL      : https://mail.google.com/mail/#drafts\n`);

  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\n╔══════════════════════════════════════════════════════════════╗`);
    console.error(`║  ❌  PIPELINE FAILED                                          ║`);
    console.error(`╚══════════════════════════════════════════════════════════════╝`);
    console.error(`  Error   : ${err.message}`);
    console.error(`  Elapsed : ${elapsed}s\n`);
    process.exit(1);
  }
})();

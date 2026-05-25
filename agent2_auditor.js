/**
 * AGENT 2 — Auditor Agent
 * ─────────────────────────────────────────────────────────────────
 * Independently reviews the Writer Agent's output for:
 *   1. Factual accuracy — no fabricated stats, quotes, or URLs
 *   2. Content appropriateness — professional, HR-relevant
 *   3. Brand alignment — tone and topics fit Sompo APAC HR audience
 *   4. Structural completeness — all 5 pillars + Sompo News present
 *   5. Link validity — URLs are real-looking, not placeholders
 *
 * Returns:
 *   { verdict: 'APPROVED' | 'REJECTED', score: 0-100,
 *     issues: [...], approved_content: {...} | null }
 *
 * If APPROVED, passes content forward to the email builder.
 * If REJECTED, throws an error with the audit report (pipeline stops).
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const https = require('https');

const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(new Error('JSON parse failed: ' + raw.slice(0, 300))); }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function auditContent(writerContent) {
  console.log('\n🔍  Agent 2 (Auditor) — Reviewing newsletter content...');

  const contentStr = JSON.stringify(writerContent, null, 2);

  const prompt = `You are the Auditor Agent for the Sompo APAC HR Intelligence newsletter.

Your role is to independently review newsletter content written by the Writer Agent, before it is sent to the Sompo APAC HR Leadership Team.

You are auditing for:

1. FACTUAL ACCURACY
   - Are statistics plausible and realistic? (e.g. "400% of employees" is impossible)
   - Do source URLs look like real, working links (not placeholder text like "https://..." or "example.com")?
   - Are company names, people names, and dates plausible?
   - Are Sompo news items clearly marked as real/verified vs unverified?

2. CONTENT APPROPRIATENESS
   - Is all content professional and appropriate for a senior HR audience?
   - No offensive, discriminatory, politically inflammatory, or legally sensitive claims
   - No exaggerated or sensationalist language
   - Tone is balanced and constructive

3. BRAND ALIGNMENT
   - Content is relevant to Sompo APAC HR teams across SG, MY, ID, TH, HK, CN
   - Focuses on the 5 pillars: Talent, Leadership, Engagement, Well-Being, Data & AI
   - Actionable insights for HR professionals

4. STRUCTURAL COMPLETENESS
   - All 5 pillars present (talent, leadership, engagement, wellbeing, data_ai)
   - Each pillar has: headline, body, market_insights for all 6 markets, stats, hr_action
   - sompo_news section present with at least 1 item
   - No empty or obviously placeholder text like "[catchy subtitle]"

5. LINK QUALITY
   - Source URLs must be real domains (e.g. shrm.org, deloitte.com, gallup.com, bbc.com)
   - Flag any URLs that are clearly fake (e.g. "https://..." or "https://example.com")
   - URLs with "placeholder" or "todo" in them must be flagged

SCORING GUIDE:
- 90-100: Approve — content is accurate, professional, complete
- 70-89: Approve with minor notes — flag issues but content is publishable
- 50-69: Reject — significant issues that must be fixed
- 0-49: Reject — content is unsuitable for distribution

Here is the content to audit:
${contentStr}

Return ONLY this JSON (no markdown fences):
{
  "verdict": "APPROVED" or "REJECTED",
  "score": 0-100,
  "summary": "One sentence overall assessment",
  "issues": [
    {
      "severity": "CRITICAL" | "MAJOR" | "MINOR",
      "pillar": "which pillar or section this affects (or 'global')",
      "issue": "clear description of the problem",
      "recommendation": "what should be changed"
    }
  ],
  "approved_content": <the full original content object if APPROVED, or null if REJECTED>,
  "audit_timestamp": "${new Date().toISOString()}"
}

IMPORTANT:
- CRITICAL issues (fabricated data, inappropriate content, broken structure) → must REJECT
- MAJOR issues (suspicious URLs, missing sections) → REJECT if 2+ present
- MINOR issues (wording, style) → note but still APPROVE
- If verdict is APPROVED, include the full original content in approved_content
- If verdict is REJECTED, set approved_content to null and list all issues clearly`;

  const response = await httpsPost(
    'api.anthropic.com',
    '/v1/messages',
    {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    {
      model: ANTHROPIC_MODEL,
      max_tokens: 10000,
      messages: [{ role: 'user', content: prompt }]
    }
  );

  const textBlock = response.content?.find(b => b.type === 'text');
  if (!textBlock) throw new Error('Agent 2: No text block in response');

  let jsonStr = textBlock.text.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  let audit;
  try {
    audit = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Agent 2: Failed to parse audit JSON: ' + jsonStr.slice(0, 400));
  }

  // Log audit report
  console.log(`\n📋  AUDIT REPORT`);
  console.log(`   Verdict : ${audit.verdict}`);
  console.log(`   Score   : ${audit.score}/100`);
  console.log(`   Summary : ${audit.summary}`);

  if (audit.issues && audit.issues.length > 0) {
    console.log(`\n   Issues found (${audit.issues.length}):`);
    audit.issues.forEach((issue, i) => {
      const icon = issue.severity === 'CRITICAL' ? '🔴' : issue.severity === 'MAJOR' ? '🟠' : '🟡';
      console.log(`   ${icon} [${issue.severity}] ${issue.pillar}: ${issue.issue}`);
      if (issue.recommendation) console.log(`      → ${issue.recommendation}`);
    });
  } else {
    console.log('   ✅ No issues found');
  }

  if (audit.verdict === 'REJECTED') {
    const criticals = (audit.issues || []).filter(i => i.severity === 'CRITICAL');
    const majors    = (audit.issues || []).filter(i => i.severity === 'MAJOR');
    throw new Error(
      `Agent 2 REJECTED the content (score: ${audit.score}/100).\n` +
      `Reason: ${audit.summary}\n` +
      `Critical issues: ${criticals.length}, Major issues: ${majors.length}\n` +
      `The newsletter will NOT be sent. Please investigate and re-run.`
    );
  }

  console.log('\n✅  Agent 2 — Content APPROVED. Proceeding to email build...');
  return audit.approved_content || writerContent;
}

module.exports = { auditContent };

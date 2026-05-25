/**
 * AGENT 1 — Writer Agent
 * ─────────────────────────────────────────────────────────────────
 * Searches the web for fresh news and generates newsletter content
 * structured around Sompo's 5 strategic HR pillars.
 * Returns a structured JSON content object for Agent 2 to audit.
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

function getSGTDate() {
  return new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'Asia/Singapore'
  });
}

function getWeekLabel() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${week}_${d.getFullYear()}`;
}

async function generateContent() {
  console.log('\n✍️  Agent 1 (Writer) — Searching web and generating content...');

  const today = getSGTDate();
  const markets = 'Singapore, Malaysia, Indonesia, Thailand, Hong Kong, and China';

  const prompt = `You are the Writer Agent for the Sompo APAC HR Intelligence newsletter.
Today is ${today}. Your audience is the Sompo APAC HR Leadership Team.

Search the web thoroughly for the LATEST news on these topics, then produce a JSON object structured around Sompo's 5 strategic HR pillars.

Search queries to use:
- "AI HR workforce 2026 APAC latest"
- "HR leadership development APAC 2026"
- "employee engagement APAC insurance 2026"
- "employee wellbeing mental health APAC 2026"
- "people analytics AI HR data 2026"
- "Sompo APAC news appointments 2026"
- "APAC insurance market ${today}"

Return ONLY this JSON — no markdown fences, no extra keys:

{
  "edition": "${getWeekLabel()}",
  "date": "${today}",
  "pillars": [
    {
      "id": "talent",
      "number": "01",
      "name": "Talent — Attracting & Developing",
      "color": "red",
      "headline": "One punchy sentence summarising the top talent story this week",
      "body": "2-3 sentences of insight. Use real data from your searches.",
      "market_insights": [
        { "market": "Singapore", "flag": "🇸🇬", "text": "2-3 sentences of current talent intelligence" },
        { "market": "Malaysia", "flag": "🇲🇾", "text": "2-3 sentences" },
        { "market": "Indonesia", "flag": "🇮🇩", "text": "2-3 sentences" },
        { "market": "Thailand", "flag": "🇹🇭", "text": "2-3 sentences" },
        { "market": "Hong Kong", "flag": "🇭🇰", "text": "2-3 sentences" },
        { "market": "China", "flag": "🇨🇳", "text": "2-3 sentences" }
      ],
      "stats": [
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" }
      ],
      "hr_action": "1-2 sentence actionable recommendation for Sompo HR teams",
      "read_links": [
        { "label": "Article title — Source", "url": "https://..." },
        { "label": "Article title — Source", "url": "https://..." }
      ]
    },
    {
      "id": "leadership",
      "number": "02",
      "name": "Leadership — Lead Yourself · Lead Your Team",
      "color": "navy",
      "headline": "One punchy sentence on the top leadership story",
      "body": "2-3 sentences of insight from real sources",
      "market_insights": [
        { "market": "Singapore", "flag": "🇸🇬", "text": "2-3 sentences" },
        { "market": "Malaysia", "flag": "🇲🇾", "text": "2-3 sentences" },
        { "market": "Indonesia", "flag": "🇮🇩", "text": "2-3 sentences" },
        { "market": "Thailand", "flag": "🇹🇭", "text": "2-3 sentences" },
        { "market": "Hong Kong", "flag": "🇭🇰", "text": "2-3 sentences" },
        { "market": "China", "flag": "🇨🇳", "text": "2-3 sentences" }
      ],
      "stats": [
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" }
      ],
      "hr_action": "1-2 sentence actionable recommendation",
      "read_links": [
        { "label": "Article title — Source", "url": "https://..." }
      ]
    },
    {
      "id": "engagement",
      "number": "03",
      "name": "Engagement — Highly Engaged Culture",
      "color": "green",
      "headline": "One punchy sentence on the top engagement story",
      "body": "2-3 sentences of insight",
      "market_insights": [
        { "market": "Singapore", "flag": "🇸🇬", "text": "2-3 sentences" },
        { "market": "Malaysia", "flag": "🇲🇾", "text": "2-3 sentences" },
        { "market": "Indonesia", "flag": "🇮🇩", "text": "2-3 sentences" },
        { "market": "Thailand", "flag": "🇹🇭", "text": "2-3 sentences" },
        { "market": "Hong Kong", "flag": "🇭🇰", "text": "2-3 sentences" },
        { "market": "China", "flag": "🇨🇳", "text": "2-3 sentences" }
      ],
      "stats": [
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" }
      ],
      "hr_action": "1-2 sentence actionable recommendation",
      "read_links": [
        { "label": "Article title — Source", "url": "https://..." }
      ]
    },
    {
      "id": "wellbeing",
      "number": "04",
      "name": "Well-Being — Sustaining Performance & Building Resilience",
      "color": "brown",
      "headline": "One punchy sentence on the top well-being story",
      "body": "2-3 sentences of insight",
      "market_insights": [
        { "market": "Singapore", "flag": "🇸🇬", "text": "2-3 sentences" },
        { "market": "Malaysia", "flag": "🇲🇾", "text": "2-3 sentences" },
        { "market": "Indonesia", "flag": "🇮🇩", "text": "2-3 sentences" },
        { "market": "Thailand", "flag": "🇹🇭", "text": "2-3 sentences" },
        { "market": "Hong Kong", "flag": "🇭🇰", "text": "2-3 sentences" },
        { "market": "China", "flag": "🇨🇳", "text": "2-3 sentences" }
      ],
      "stats": [
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" }
      ],
      "hr_action": "1-2 sentence actionable recommendation",
      "read_links": [
        { "label": "Article title — Source", "url": "https://..." }
      ]
    },
    {
      "id": "data_ai",
      "number": "05",
      "name": "Data & AI — Powering People Decisions with Data",
      "color": "dark",
      "headline": "One punchy sentence on the top Data & AI story",
      "body": "2-3 sentences of insight",
      "market_insights": [
        { "market": "Singapore", "flag": "🇸🇬", "text": "2-3 sentences" },
        { "market": "Malaysia", "flag": "🇲🇾", "text": "2-3 sentences" },
        { "market": "Indonesia", "flag": "🇮🇩", "text": "2-3 sentences" },
        { "market": "Thailand", "flag": "🇹🇭", "text": "2-3 sentences" },
        { "market": "Hong Kong", "flag": "🇭🇰", "text": "2-3 sentences" },
        { "market": "China", "flag": "🇨🇳", "text": "2-3 sentences" }
      ],
      "stats": [
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" },
        { "number": "XX%", "label": "short label" }
      ],
      "hr_action": "1-2 sentence actionable recommendation",
      "read_links": [
        { "label": "Article title — Source", "url": "https://..." },
        { "label": "Article title — Source", "url": "https://..." }
      ]
    }
  ],
  "sompo_news": {
    "headline": "One punchy sentence summarising Sompo APAC news this week",
    "intro": "1-2 sentence intro",
    "items": [
      {
        "date_tag": "Month YYYY",
        "title": "Appointment or news title",
        "text": "2-3 sentences. Must be REAL verified news from search. If no new Sompo news found, say so clearly.",
        "source_url": "https://..."
      }
    ]
  }
}

CRITICAL RULES:
- Use ONLY real, verified facts from your web searches
- Never fabricate statistics, quotes, appointments, or URLs
- If you cannot verify a stat, omit it or use a range
- All source URLs must be real pages you found in search
- Return ONLY valid JSON — no markdown, no commentary`;

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
      max_tokens: 8000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    }
  );

  const textBlock = response.content?.find(b => b.type === 'text');
  if (!textBlock) throw new Error('Agent 1: No text block in response: ' + JSON.stringify(response).slice(0, 500));

  let jsonStr = textBlock.text.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const content = JSON.parse(jsonStr);
    console.log('✅  Agent 1 — Content generated successfully');
    console.log(`   Edition: ${content.edition} | Pillars: ${content.pillars?.length} | Sompo items: ${content.sompo_news?.items?.length}`);
    return content;
  } catch (e) {
    throw new Error('Agent 1: Failed to parse JSON: ' + jsonStr.slice(0, 400));
  }
}

module.exports = { generateContent };

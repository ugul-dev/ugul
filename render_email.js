/**
 * Email Renderer
 * ─────────────────────────────────────────────────────────────────
 * Takes the audited content JSON and renders a polished HTML email
 * matching the Sompo APAC HR Intelligence brand design.
 */

const PILLAR_COLORS = {
  talent:     { bar: '#DF082A', badge_bg: '#DF082A',  badge_text: '#fff',     box_bg: '#FFF1F1' },
  leadership: { bar: '#1A3A5C', badge_bg: '#1A3A5C',  badge_text: '#fff',     box_bg: '#EEF3F8' },
  engagement: { bar: '#2D6A4F', badge_bg: '#2D6A4F',  badge_text: '#fff',     box_bg: '#EEF8F3' },
  wellbeing:  { bar: '#7B3F00', badge_bg: '#7B3F00',  badge_text: '#fff',     box_bg: '#FFF5EE' },
  data_ai:    { bar: '#1A1A1A', badge_bg: '#1A1A1A',  badge_text: '#fff',     box_bg: '#F5F5F5' },
};

const PILLAR_ICONS = {
  talent: '01', leadership: '02', engagement: '03', wellbeing: '04', data_ai: '05'
};

function statBoxes(stats, color) {
  if (!stats || !stats.length) return '';
  const accents = [color, '#1A3A5C', '#2D6A4F'];
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr>
      ${stats.map((s, i) => `
        <td width="30%" style="background:#F9F9F9;border-left:4px solid ${accents[i % 3]};padding:14px;text-align:center;">
          <div style="font-family:Arial,sans-serif;font-size:26px;font-weight:bold;color:#1A1A1A;">${s.number}</div>
          <div style="font-family:Arial,sans-serif;font-size:10px;color:#93989C;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">${s.label}</div>
        </td>
        ${i < stats.length - 1 ? '<td width="4%"></td>' : ''}
      `).join('')}
    </tr>
  </table>`;
}

function marketCards(items, color) {
  if (!items || !items.length) return '';
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2);
    rows.push(`
      <tr>
        ${pair.map((m, j) => `
          <td width="48%" valign="top" style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="background:${color};padding:5px 8px;">
                <span style="font-family:Arial,sans-serif;font-size:8px;font-weight:bold;color:#fff;letter-spacing:1px;text-transform:uppercase;">${m.flag}&nbsp; ${m.market.toUpperCase()}</span>
              </td></tr>
              <tr><td style="background:#F9F9F9;padding:10px 8px;">
                <span style="font-family:Arial,sans-serif;font-size:12px;color:#333;line-height:1.6;">${m.text}</span>
              </td></tr>
            </table>
          </td>
          ${j === 0 ? '<td width="4%"></td>' : ''}
        `).join('')}
        ${pair.length === 1 ? '<td width="4%"></td><td width="48%"></td>' : ''}
      </tr>
      <tr><td colspan="3" style="height:8px;"></td></tr>
    `);
  }
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;">${rows.join('')}</table>`;
}

function readLinks(links) {
  if (!links || !links.length) return '';
  return `
    <div style="margin-top:12px;padding:10px 14px;background:#F5F5F5;border-radius:4px;">
      <div style="font-family:Arial,sans-serif;font-size:10px;color:#93989C;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Read more</div>
      ${links.filter(l => l.url && !l.url.includes('https://...') && l.url !== '#').map(l =>
        `<div style="margin:4px 0;font-family:Arial,sans-serif;font-size:12px;">
          <a href="${l.url}" style="color:#1A3A5C;text-decoration:none;">→&nbsp;${l.label}</a>
        </div>`
      ).join('')}
    </div>`;
}

function pillarSection(p) {
  const col = PILLAR_COLORS[p.id] || PILLAR_COLORS.data_ai;
  return `
  <!-- PILLAR ${p.number}: ${p.name} -->
  <tr><td style="padding:28px 40px 10px;background:#fff;">
    <div style="display:inline-block;background:${col.badge_bg};padding:5px 14px;border-radius:3px;margin-bottom:14px;">
      <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:${col.badge_text};letter-spacing:2px;text-transform:uppercase;">${p.number}&nbsp;&nbsp;${p.name.toUpperCase()}</span>
    </div>
    <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#1A1A1A;margin-bottom:8px;">${p.headline}</div>
    <div style="font-family:Arial,sans-serif;font-size:13px;color:#444;line-height:1.7;">${p.body}</div>
  </td></tr>
  <tr><td style="padding:0 40px 20px;background:#fff;">
    ${statBoxes(p.stats, col.bar)}
    ${marketCards(p.market_insights, col.bar)}
    <div style="background:${col.box_bg};border-left:4px solid ${col.bar};padding:12px 16px;margin-top:10px;border-radius:0 4px 4px 0;">
      <div style="font-family:Arial,sans-serif;font-size:10px;color:${col.bar};letter-spacing:1px;text-transform:uppercase;font-weight:bold;margin-bottom:4px;">📌&nbsp; HR Action</div>
      <div style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.6;">${p.hr_action}</div>
    </div>
    ${readLinks(p.read_links)}
  </td></tr>
  <tr><td style="padding:0 40px;background:#fff;"><div style="border-top:2px solid #F0F2F5;"></div></td></tr>`;
}

function sompoSection(s) {
  if (!s) return '';
  const items = (s.items || []).map(item => `
    <div style="margin-bottom:18px;padding-bottom:18px;border-bottom:1px dotted #E0E0E0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="90px" valign="top">
            <div style="background:#DF082A;padding:5px 8px;display:inline-block;">
              <span style="font-family:Arial,sans-serif;font-size:9px;font-weight:bold;color:#fff;">${item.date_tag}</span>
            </div>
          </td>
          <td valign="top" style="padding-left:12px;">
            ${item.title ? `<div style="font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#1A1A1A;margin-bottom:6px;">${item.title}</div>` : ''}
            <div style="font-family:Arial,sans-serif;font-size:13px;color:#444;line-height:1.65;">${item.text}</div>
            ${item.source_url && !item.source_url.includes('https://...') ?
              `<div style="margin-top:6px;"><a href="${item.source_url}" style="font-family:Arial,sans-serif;font-size:11px;color:#1A3A5C;text-decoration:none;">→ Source</a></div>` : ''}
          </td>
        </tr>
      </table>
    </div>
  `).join('');

  return `
  <!-- SOMPO NEWS -->
  <tr><td style="padding:28px 40px 10px;background:#fff;">
    <div style="display:inline-block;background:#DF082A;padding:5px 14px;border-radius:3px;margin-bottom:14px;">
      <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#fff;letter-spacing:2px;text-transform:uppercase;">●&nbsp;&nbsp;SOMPO NEWS</span>
    </div>
    <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#1A1A1A;margin-bottom:8px;">${s.headline || ''}</div>
    <div style="font-family:Arial,sans-serif;font-size:13px;color:#444;line-height:1.7;">${s.intro || ''}</div>
  </td></tr>
  <tr><td style="padding:0 40px 28px;background:#fff;">${items}</td></tr>`;
}

function renderEmail(content) {
  const { edition, date, pillars, sompo_news } = content;
  const weekNum = edition || date || '';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ECECEC;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ECECEC;padding:20px 0;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:640px;">

  <!-- HEADER -->
  <tr><td style="background:#1A1A1A;padding:20px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <div style="font-family:Arial,sans-serif;font-size:10px;color:#93989C;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">SOMPO APAC · HUMAN RESOURCES</div>
        <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:bold;color:#fff;letter-spacing:1px;">
          <span style="color:#fff;">HR</span>&nbsp;<span style="color:#DF082A;">INTELLIGENCE</span>
        </div>
      </td>
      <td align="right" valign="middle">
        <div style="font-family:Arial,sans-serif;font-size:10px;color:#93989C;text-align:right;line-height:1.6;">Edition ${weekNum}<br>${date}</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- PILLAR STRIP -->
  <tr><td style="background:#DF082A;padding:8px 40px;">
    <span style="font-family:Arial,sans-serif;font-size:9px;color:#fff;letter-spacing:1px;">01 TALENT &nbsp;·&nbsp; 02 LEADERSHIP &nbsp;·&nbsp; 03 ENGAGEMENT &nbsp;·&nbsp; 04 WELL-BEING &nbsp;·&nbsp; 05 DATA &amp; AI &nbsp;·&nbsp; SOMPO NEWS</span>
  </td></tr>

  <!-- INTRO -->
  <tr><td style="background:#fff;padding:24px 40px 16px;">
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#444;line-height:1.7;">
      Good morning. Your <strong>weekly</strong> intelligence briefing — curated for the <strong>Sompo APAC HR Team</strong> — is ready. This edition is structured around Sompo's five strategic HR pillars, with market intelligence across Singapore, Malaysia, Indonesia, Thailand, Hong Kong, and China.
    </div>
  </td></tr>
  <tr><td style="padding:0 40px;background:#fff;"><div style="border-top:2px solid #DF082A;"></div></td></tr>

  ${(pillars || []).map(pillarSection).join('')}
  ${sompoSection(sompo_news)}

  <!-- FOOTER -->
  <tr><td style="background:#1A1A1A;padding:24px 40px;border-radius:0 0 8px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <div style="font-family:Arial,sans-serif;font-size:13px;color:#fff;font-weight:bold;margin-bottom:4px;">Sompo APAC HR Intelligence</div>
        <div style="font-family:Arial,sans-serif;font-size:11px;color:#93989C;line-height:1.7;">
          AI-curated weekly for the Sompo APAC HR Team<br>
          Delivered every Monday at 9:00 AM SGT &nbsp;·&nbsp; Markets: SG · MY · ID · TH · HK · CN
        </div>
      </td>
      <td align="right" valign="middle">
        <div style="font-family:Arial,sans-serif;font-size:10px;color:#93989C;text-align:right;">sompo-intl.com</div>
      </td>
    </tr></table>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

module.exports = { renderEmail };

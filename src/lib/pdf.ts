import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Playbook, PersonalizedLayer } from './playbook-types';
import type { Hustle } from './hustles';

const css = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #0A0A0A; color: #FAFAFA; font-family: -apple-system, "SF Pro", Geist, system-ui, sans-serif; }
  .page { padding: 40px 36px; }
  .cover {
    min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between;
    background: radial-gradient(circle at 20% 10%, #1a2200 0%, #0A0A0A 60%);
    padding: 48px 36px;
  }
  .brand { font-weight: 800; font-size: 14px; letter-spacing: -0.4px; }
  .lime { color: #C8FF3E; }
  .muted { color: #A0A0A0; }
  .mono { font-family: "Geist Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: 1.4px; text-transform: uppercase; color: #6B6B6B; }
  h1 { font-size: 56px; font-weight: 800; letter-spacing: -2.4px; line-height: 0.95; margin: 0; }
  h2 { font-size: 28px; font-weight: 800; letter-spacing: -1.2px; margin: 32px 0 12px; }
  h3 { font-size: 18px; font-weight: 700; letter-spacing: -0.4px; margin: 18px 0 8px; }
  p { font-size: 14px; line-height: 1.5; margin: 6px 0; color: #d0d0d0; }
  .meta { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 18px; }
  .pill {
    display: inline-flex; padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.18);
    font-family: "Geist Mono", monospace; font-size: 10px; letter-spacing: 1px; color: #FAFAFA;
  }
  .lime-pill {
    display: inline-flex; padding: 6px 10px; border-radius: 6px; background: #C8FF3E; color: #0A0A0A;
    font-weight: 800; font-size: 11px; letter-spacing: 0.5px;
  }
  .card { padding: 16px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: #141414; margin: 10px 0; }
  .intro-card { padding: 18px; border-radius: 14px; border: 1.5px solid rgba(200,255,62,0.35); background: rgba(200,255,62,0.08); margin: 16px 0; }
  .mrr {
    margin: 28px 0; padding: 22px; border-radius: 18px; background: #C8FF3E; color: #0A0A0A;
  }
  .mrr .label { font-size: 11px; font-family: "Geist Mono", monospace; letter-spacing: 1.4px; opacity: 0.65; }
  .mrr .big { font-size: 72px; font-weight: 800; letter-spacing: -4px; line-height: 1; margin-top: 6px; }
  .week { padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: #141414; margin: 8px 0; page-break-inside: avoid; }
  .week-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .week-title { font-weight: 700; font-size: 15px; }
  .week-num { font-family: "Geist Mono", monospace; font-size: 11px; color: #C8FF3E; }
  .action { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px dashed rgba(255,255,255,0.06); }
  .action:last-child { border: 0; }
  .day-chip { width: 38px; flex-shrink: 0; font-family: "Geist Mono", monospace; font-size: 10px; color: #6B6B6B; padding-top: 2px; }
  .action-body { flex: 1; }
  .action-body .a { font-size: 13px; color: #FAFAFA; }
  .action-body .s { font-size: 11px; color: #A0A0A0; margin-top: 3px; }
  .action-body .m { font-size: 10px; color: #6B6B6B; font-family: "Geist Mono", monospace; }
  .tool-row { display: flex; gap: 12px; align-items: center; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: #141414; margin: 6px 0; }
  .tool-glyph { width: 34px; height: 34px; border-radius: 8px; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.08); color: #C8FF3E; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 12px; }
  .tool-body { flex: 1; }
  .tool-name { font-weight: 700; font-size: 13px; }
  .tool-why { color: #A0A0A0; font-size: 11px; margin-top: 2px; }
  .tool-price { color: #6B6B6B; font-family: "Geist Mono", monospace; font-size: 10px; }
  .script {
    padding: 14px; border-radius: 12px; background: #0A0A0A; border: 1px solid rgba(255,255,255,0.08);
    font-family: "Geist Mono", monospace; font-size: 11px; line-height: 1.6; color: #d0d0d0; margin: 8px 0;
    white-space: pre-wrap;
  }
  .failure { padding: 10px 12px; border-radius: 10px; background: rgba(255,92,57,0.12); border: 1px solid rgba(255,92,57,0.25); margin: 6px 0; font-size: 13px; }
  .launch {
    padding: 12px 14px; border-radius: 12px; background: #141414; border: 1px solid rgba(255,255,255,0.08);
    margin: 6px 0; page-break-inside: avoid;
  }
  .launch .name { font-weight: 700; }
  .launch .meta { font-size: 11px; color: #A0A0A0; margin-top: 4px; }
  .footer { margin-top: 40px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); color: #6B6B6B; font-size: 10px; font-family: "Geist Mono", monospace; letter-spacing: 1px; }
  .pagebreak { page-break-before: always; }
`;

function esc(s: string) {
  return String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
}

function renderHTML(hustle: Hustle, p: Playbook, personalized: PersonalizedLayer, matchScore: number): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body>

  <!-- COVER -->
  <div class="cover">
    <div>
      <div class="brand">HUSTLE<span class="lime">AI</span></div>
      <div class="mono" style="margin-top: 4px;">PLAYBOOK · 90 DAYS · YOURS</div>
    </div>
    <div>
      <div class="mono">${matchScore}% FIT</div>
      <h1 style="margin-top: 8px;">${esc(hustle.title)}</h1>
      <p class="muted" style="font-size: 15px; line-height: 1.4; margin-top: 12px;">${esc(hustle.tagline)}</p>
      <div class="meta">
        <span class="pill">${esc(hustle.monthly)}/MO</span>
        <span class="pill">${esc(hustle.time)}</span>
        <span class="pill">${esc(hustle.startup)} START</span>
        <span class="pill">FIRST $ IN ${esc(hustle.firstDollar)}</span>
      </div>
    </div>
    <div class="mono">EXPORTED FROM HUSTLEAI · ${new Date().toLocaleDateString()}</div>
  </div>

  <!-- PERSONALIZED INTRO -->
  <div class="page pagebreak">
    <div class="mono">FROM YOUR COACH</div>
    <div class="intro-card">
      <p style="font-size: 15px; line-height: 1.6; color: #FAFAFA; margin: 0;">${esc(personalized.intro)}</p>
    </div>

    <h2>The thesis</h2>
    <p>${esc(p.hero.thesis)}</p>
    <p class="muted"><strong>Market:</strong> ${esc(p.hero.marketSize)}</p>
    <p class="muted"><strong>Paying-customer evidence:</strong> ${esc(p.hero.payingEvidence)}</p>

    <div class="mrr">
      <div class="label">REALISTIC MRR · MONTH 6</div>
      <div class="big">${esc(hustle.monthly)}<span style="font-size: 18px;">/mo</span></div>
    </div>
  </div>

  <!-- 90-DAY -->
  <div class="page pagebreak">
    <div class="mono">QUARTER 01</div>
    <h2>The 12-week plan</h2>
    ${p.ninetyDay.map((w) => `
      <div class="week">
        <div class="week-head">
          <div class="week-title">${esc(w.title)}</div>
          <div class="week-num">WEEK ${w.week}</div>
        </div>
        ${w.actions.map((a) => `
          <div class="action">
            <div class="day-chip">${esc(a.day || '·')}</div>
            <div class="action-body">
              <div class="a">${esc(a.action)}</div>
              <div class="s">✓ ${esc(a.success)} <span class="m">· ${a.minutes} min</span></div>
            </div>
          </div>
        `).join('')}
        <p class="muted" style="margin-top: 10px; font-size: 12px;"><strong>Metric:</strong> ${esc(w.metric)}</p>
      </div>
    `).join('')}
  </div>

  <!-- FIRST 10 CUSTOMERS -->
  <div class="page pagebreak">
    <div class="mono">YOUR FIRST 10</div>
    <h2>How to find them</h2>
    <p><strong>Where they hang out:</strong></p>
    <div class="meta">
      ${p.firstTenCustomers.channels.map((c) => `<span class="pill">${esc(c)}</span>`).join('')}
    </div>
    <p style="margin-top: 18px;"><strong>Cadence:</strong> ${esc(p.firstTenCustomers.cadence)}</p>

    <h3>The script (copy-paste)</h3>
    <div class="script">${esc(p.firstTenCustomers.script)}</div>

    <h3 style="margin-top: 24px;">Your 3 personalized scripts</h3>
    ${personalized.scripts.map((s) => `
      <div class="card">
        <div class="lime-pill">${esc(s.label)}</div>
        <div class="script">${esc(s.body)}</div>
      </div>
    `).join('')}
  </div>

  <!-- TOOL STACK -->
  <div class="page pagebreak">
    <div class="mono">GEAR</div>
    <h2>Your tool stack</h2>
    ${p.toolStack.map((t) => `
      <div class="tool-row">
        <div class="tool-glyph">${esc(t.name.slice(0, 2).toLowerCase())}</div>
        <div class="tool-body">
          <div class="tool-name">${esc(t.name)}</div>
          <div class="tool-why">${esc(t.why)}</div>
        </div>
        <div class="tool-price">${esc(t.pricing)}</div>
      </div>
    `).join('')}
  </div>

  <!-- PRICING -->
  <div class="page pagebreak">
    <div class="mono">$$$</div>
    <h2>Pricing playbook</h2>
    <div class="card">
      <h3>Starter</h3>
      <p>${esc(p.pricing.starter)}</p>
    </div>
    <div class="card">
      <h3>Growth</h3>
      <p>${esc(p.pricing.growth)}</p>
    </div>
    <div class="card">
      <h3>Premium</h3>
      <p>${esc(p.pricing.premium)}</p>
    </div>
    <p><strong>When to raise:</strong> ${esc(p.pricing.raisingRules)}</p>
  </div>

  <!-- FAILURE MODES -->
  <div class="page pagebreak">
    <div class="mono">WARNING</div>
    <h2>How this fails</h2>
    ${p.failureModes.map((f) => `<div class="failure">${esc(f)}</div>`).join('')}
  </div>

  <!-- REAL LAUNCHES -->
  <div class="page pagebreak">
    <div class="mono">PROOF</div>
    <h2>Real comparable launches</h2>
    ${p.realLaunches.map((l) => `
      <div class="launch">
        <div class="name">${esc(l.name)} — by ${esc(l.operator)}</div>
        <div class="meta">${esc(l.mrr)}/mo at month ${l.months} · via ${l.channels.map(esc).join(', ')}</div>
      </div>
    `).join('')}
  </div>

  <!-- SETUP + SCALING -->
  <div class="page pagebreak">
    <div class="mono">BUSINESS</div>
    <h2>Setup</h2>
    <p><strong>LLC:</strong> ${esc(p.setup.llc)}</p>
    <p><strong>Payments:</strong> ${esc(p.setup.payments)}</p>
    <p><strong>Contracts:</strong> ${esc(p.setup.contracts)}</p>
    ${p.setup.insurance ? `<p><strong>Insurance:</strong> ${esc(p.setup.insurance)}</p>` : ''}

    <h2>Scaling beyond solo</h2>
    <p>${esc(p.scaling)}</p>

    <div class="footer">
      Generated by HustleAI · hustleai.app · matched to you on ${new Date().toLocaleDateString()}
    </div>
  </div>
</body></html>`;
}

export async function exportPlaybookPDF(
  hustle: Hustle,
  playbook: Playbook,
  personalized: PersonalizedLayer,
  matchScore: number,
): Promise<void> {
  const html = renderHTML(hustle, playbook, personalized, matchScore);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `${hustle.title} — your playbook`,
    });
  }
}

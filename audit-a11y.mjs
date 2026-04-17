import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

await page.goto('https://opendesk-edu.org/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const results = await page.evaluate(() => {
  // WCAG contrast ratio calculation
  function sRGBtoLinear(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function relativeLuminance(r, g, b) {
    return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
  }
  function contrastRatio(rgb1, rgb2) {
    const l1 = relativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = relativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  function parseRGB(str) {
    const m = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : [0, 0, 0];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function parseOKLab(str) {
    // For oklab colors, extract from rgb approximation
    const els = document.querySelectorAll(str);
    if (els.length === 0) return null;
    const style = getComputedStyle(els[0]);
    // Force computation by reading all color properties
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = style.color;
    return parseRGB(ctx.fillStyle);
  }

  const issues = [];
  const passes = [];

  function checkContrast(element, label, bgProp, fgProp) {
    const style = getComputedStyle(element);
    const bgColor = style[bgProp];
    const fgColor = style[fgProp];
    
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1, 1);
    const bgPixel = ctx.getImageData(0, 0, 1, 1).data;
    
    ctx.fillStyle = fgColor;
    ctx.fillRect(0, 0, 1, 1);
    const fgPixel = ctx.getImageData(0, 0, 1, 1).data;
    
    const ratio = contrastRatio([bgPixel[0], bgPixel[1], bgPixel[2]], [fgPixel[0], fgPixel[1], fgPixel[2]]);
    
    const entry = {
      label,
      bgRaw: bgColor,
      fgRaw: fgColor,
      ratio: Math.round(ratio * 100) / 100,
      tag: fgColor.includes('rgba(0, 0, 0, 0)') ? 'TRANSPARENT_TEXT' : '',
    };
    
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    // WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
    if (ratio < 3) {
      entry.severity = 'CRITICAL';
      issues.push(entry);
    } else if (ratio < 4.5) {
      entry.severity = 'FAIL_AA';
      issues.push(entry);
    } else if (ratio < 7) {
      entry.severity = 'AA_ONLY';
      passes.push(entry);
    } else {
      entry.severity = 'AAA';
      passes.push(entry);
    }
  }

  // Check body text (foreground on background)
  const body = document.body;
  checkContrast(body, 'Body text', 'backgroundColor', 'color');

  // Check h1
  const h1 = document.querySelector('h1');
  if (h1) checkContrast(h1, 'H1 heading', 'backgroundColor', 'color');

  // Check h2
  const h2 = document.querySelector('h2');
  if (h2) checkContrast(h2, 'H2 heading', 'backgroundColor', 'color');

  // Check subtitle
  const h2Els = document.querySelectorAll('h2');
  h2Els.forEach((el, i) => checkContrast(el, `H2 #${i}`, 'backgroundColor', 'color'));

  // Check description paragraph
  const p = document.querySelector('main p');
  if (p) checkContrast(p, 'Description paragraph', 'backgroundColor', 'color');

  // Check CTA buttons (bg-accent class)
  document.querySelectorAll('a.bg-accent').forEach((btn, i) => {
    checkContrast(btn, `CTA Button #${i}`, 'backgroundColor', 'color');
  });

  // Check nav links
  document.querySelectorAll('nav a').forEach((link, i) => {
    checkContrast(link, `Nav link #${i}`, 'backgroundColor', 'color');
  });

  // Check footer
  const footer = document.querySelector('footer');
  if (footer) {
    checkContrast(footer, 'Footer background', 'backgroundColor', 'color');
    footer.querySelectorAll('a').forEach((link, i) => {
      checkContrast(link, `Footer link #${i}`, 'backgroundColor', 'color');
    });
  }

  // Check card elements
  document.querySelectorAll('article').forEach((card, i) => {
    checkContrast(card, `Card #${i} bg`, 'backgroundColor', 'color');
    const title = card.querySelector('h3');
    if (title) checkContrast(title, `Card #${i} title`, 'backgroundColor', 'color');
    const time = card.querySelector('time');
    if (time) checkContrast(time, `Card #${i} date`, 'backgroundColor', 'color');
    const desc = card.querySelector('p');
    if (desc) checkContrast(desc, `Card #${i} desc`, 'backgroundColor', 'color');
    // Check tag badges
    card.querySelectorAll('span').forEach((tag, j) => {
      checkContrast(tag, `Card #${i} tag #${j}`, 'backgroundColor', 'color');
    });
  });

  // Check "Get in Touch" section
  const contactSection = document.querySelectorAll('section')[1];
  if (contactSection) {
    const contactH2 = contactSection.querySelector('h2');
    if (contactH2) checkContrast(contactH2, 'Contact H2', 'backgroundColor', 'color');
    const contactP = contactSection.querySelector('p');
    if (contactP) checkContrast(contactP, 'Contact P', 'backgroundColor', 'color');
    const contactA = contactSection.querySelector('a');
    if (contactA) checkContrast(contactA, 'Contact link', 'backgroundColor', 'color');
  }

  // Skip nav link
  const skipLink = document.querySelector('a[href="#main-content"]');
  if (skipLink) checkContrast(skipLink, 'Skip link (focus)', 'backgroundColor', 'color');

  // Check color tokens defined in CSS
  const rootStyle = getComputedStyle(document.documentElement);
  const computedVars = {};
  ['--background', '--foreground', '--foreground-secondary', '--accent', '--accent-button', '--border', '--background-secondary'].forEach(v => {
    computedVars[v] = rootStyle.getPropertyValue(v).trim();
  });

  return { issues, passes, computedVars };
});

console.log('=== ACCESSIBILITY ISSUES ===');
results.issues.forEach(i => {
  console.log(`[${i.severity}] ${i.label}: ratio=${i.ratio}:1 (fg="${i.fgRaw}", bg="${i.bgRaw}")${i.tag ? ' ⚠️ ' + i.tag : ''}`);
});
console.log(`\n=== PASSES (${results.passes.length}) ===`);
results.passes.forEach(p => {
  console.log(`[${p.severity}] ${p.label}: ratio=${p.ratio}:1`);
});
console.log('\n=== CSS CUSTOM PROPERTIES ===');
console.log(JSON.stringify(results.computedVars, null, 2));

await browser.close();

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = path.resolve('docs/policies/pdf');
const publicDir = path.resolve('public/policies');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

function mdToHtml(md) {
  let lines = md.split('\n');
  let html = [];
  let inList = false;
  let inTable = false;
  let tableRows = [];

  for (let line of lines) {
    let trimmed = line.trim();

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) inTable = true;
      let cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        // separator row, skip
        continue;
      }
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      inTable = false;
      if (tableRows.length > 0) {
        let tableHtml = '<table><thead><tr>' + tableRows[0].map(c => `<th>${inlineFormat(c)}</th>`).join('') + '</tr></thead><tbody>';
        for (let i = 1; i < tableRows.length; i++) {
          tableHtml += '<tr>' + tableRows[i].map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>';
        }
        tableHtml += '</tbody></table>';
        html.push(tableHtml);
        tableRows = [];
      }
    }

    // Unordered lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        inList = true;
        html.push('<ul>');
      }
      html.push(`<li>${inlineFormat(trimmed.substring(2))}</li>`);
      continue;
    } else if (inList) {
      inList = false;
      html.push('</ul>');
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      html.push(`<h1>${inlineFormat(trimmed.substring(2))}</h1>`);
    } else if (trimmed.startsWith('## ')) {
      html.push(`<h2>${inlineFormat(trimmed.substring(3))}</h2>`);
    } else if (trimmed.startsWith('### ')) {
      html.push(`<h3>${inlineFormat(trimmed.substring(4))}</h3>`);
    } else if (trimmed.startsWith('---')) {
      html.push('<hr>');
    } else if (trimmed.length > 0) {
      html.push(`<p>${inlineFormat(trimmed)}</p>`);
    }
  }

  if (inList) html.push('</ul>');
  if (inTable && tableRows.length > 0) {
    let tableHtml = '<table><thead><tr>' + tableRows[0].map(c => `<th>${inlineFormat(c)}</th>`).join('') + '</tr></thead><tbody>';
    for (let i = 1; i < tableRows.length; i++) {
      tableHtml += '<tr>' + tableRows[i].map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>';
    }
    tableHtml += '</tbody></table>';
    html.push(tableHtml);
  }

  return html.join('\n');
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
}

const baseCss = `
  @page {
    size: A4;
    margin: 16mm 16mm 16mm 16mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 9.5pt;
    background: #fff;
    margin: 0;
    padding: 0;
  }
  .header {
    border-bottom: 2px solid #1B475D;
    padding-bottom: 12px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .brand {
    font-size: 22pt;
    font-weight: 900;
    color: #1B475D;
    letter-spacing: -0.5px;
  }
  .brand-sub {
    font-size: 9pt;
    color: #64748b;
    font-weight: 700;
    margin-top: 3px;
  }
  .meta {
    font-size: 8pt;
    color: #475569;
    text-align: right;
    line-height: 1.4;
  }
  h1 {
    font-size: 16pt;
    font-weight: 900;
    color: #0f172a;
    margin: 0 0 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  h2 {
    font-size: 11.5pt;
    font-weight: 800;
    color: #1B475D;
    margin-top: 16px;
    margin-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 10pt;
    font-weight: 800;
    color: #334155;
    margin-top: 12px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }
  p {
    margin: 0 0 8px 0;
    color: #334155;
    text-align: justify;
  }
  ul, ol {
    margin: 0 0 10px 0;
    padding-left: 20px;
  }
  li {
    margin-bottom: 4px;
    color: #334155;
  }
  hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 14px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 7px 10px;
    text-align: left;
  }
  th {
    background-color: #f1f5f9;
    font-weight: 800;
    color: #0f172a;
  }
  .footer-note {
    margin-top: 24px;
    padding-top: 8px;
    border-top: 1px solid #cbd5e1;
    font-size: 7.5pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
  }
  .page-break {
    page-break-after: always;
  }
`;

const fileMapping = [
  {
    mdFile: 'terms-and-conditions.md',
    pdfFile: 'Terms_and_Conditions_Jog_and_Joy.pdf',
    title: 'Terms & Conditions of Service'
  },
  {
    mdFile: 'privacy-policy.md',
    pdfFile: 'Privacy_Policy_Jog_and_Joy.pdf',
    title: 'Privacy and Data Protection Policy'
  },
  {
    mdFile: 'refund-and-cancellation-policy.md',
    pdfFile: 'Refund_and_Cancellation_Policy_Jog_and_Joy.pdf',
    title: 'Refund, Return and Cancellation Policy'
  },
  {
    mdFile: 'shipping-and-delivery-policy.md',
    pdfFile: 'Shipping_and_Delivery_Policy_Jog_and_Joy.pdf',
    title: 'Shipping and Delivery Policy'
  }
];

const headerHtml = `
  <div class="header">
    <div>
      <div class="brand">JOG & JOY®</div>
      <div class="brand-sub">Love is in the wear • Kids Athleisure & Activewear</div>
    </div>
    <div class="meta">
      <strong>Jog & Joy (Jainam Products)</strong><br>
      2488, Navo Vas, Swaminarayan Mandir, Kalupur<br>
      Ahmedabad, Gujarat-24, India<br>
      jogjoy85@gmail.com | +91 94299 05118
    </div>
  </div>
`;

let combinedSections = [];

for (const item of fileMapping) {
  const mdPath = path.resolve('docs/policies', item.mdFile);
  const mdRaw = fs.readFileSync(mdPath, 'utf-8');
  const bodyHtml = mdToHtml(mdRaw);
  const itemHeader = headerHtml;
  const itemFooterCompany = 'Jainam Products';

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${item.title} - Jog & Joy</title>
      <style>${baseCss}</style>
    </head>
    <body>
      ${itemHeader}
      ${bodyHtml}
      <div class="footer-note">
        <span>JOG & JOY® Official Store Policy Document • ${itemFooterCompany}</span>
        <span>Ahmedabad Jurisdiction • India</span>
      </div>
    </body>
    </html>
  `;

  const tempHtmlPath = path.join(outputDir, item.pdfFile.replace('.pdf', '.html'));
  fs.writeFileSync(tempHtmlPath, fullHtml);

  const pdfPath = path.join(outputDir, item.pdfFile);
  const publicPdfPath = path.join(publicDir, item.pdfFile);

  console.log(`Generating in-depth PDF: ${item.pdfFile}...`);
  try {
    execSync(`"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${tempHtmlPath}"`, { stdio: 'inherit' });
    fs.copyFileSync(pdfPath, publicPdfPath);
    console.log(`✓ Successfully generated ${item.pdfFile}`);
  } catch (err) {
    console.error(`Error generating ${item.pdfFile}:`, err);
  }

  combinedSections.push({ body: bodyHtml });
}

// Consolidated Master PDF
const combinedHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Jog & Joy - Master Store Policies</title>
    <style>${baseCss}</style>
  </head>
  <body>
    ${combinedSections.map((sectionObj, idx) => `
      <div>
        ${headerHtml}
        ${sectionObj.body}
        <div class="footer-note">
          <span>JOG & JOY® Master Legal Policies • Section ${idx + 1} of 4</span>
          <span>Jog & Joy (Jainam Products), Ahmedabad, Gujarat, India</span>
        </div>
      </div>
      ${idx < combinedSections.length - 1 ? '<div class="page-break"></div>' : ''}
    `).join('')}
  </body>
  </html>
`;

const combinedHtmlPath = path.join(outputDir, 'Jog_and_Joy_Complete_Store_Policies.html');
fs.writeFileSync(combinedHtmlPath, combinedHtml);

const combinedPdfPath = path.join(outputDir, 'Jog_and_Joy_Complete_Store_Policies.pdf');
const publicCombinedPdfPath = path.join(publicDir, 'Jog_and_Joy_Complete_Store_Policies.pdf');

console.log('Generating detailed consolidated master PDF...');
try {
  execSync(`"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${combinedPdfPath}" "${combinedHtmlPath}"`, { stdio: 'inherit' });
  fs.copyFileSync(combinedPdfPath, publicCombinedPdfPath);
  console.log('✓ Successfully generated Jog_and_Joy_Complete_Store_Policies.pdf');
} catch (err) {
  console.error('Error generating consolidated PDF:', err);
}

console.log('Finished compiling detailed policies!');

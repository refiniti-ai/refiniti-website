/**
 * Generates paystub.pdf from paystub.html using Puppeteer.
 * Run: node scripts/generate-paystub-pdf.js
 * Or:  npm run paystub:pdf
 */

const path = require('path');
const fs = require('fs');

const htmlPath = path.join(__dirname, '..', 'paystub.html');
const pdfPath = path.join(__dirname, '..', 'paystub.pdf');

if (!fs.existsSync(htmlPath)) {
  console.error('paystub.html not found at', htmlPath);
  process.exit(1);
}

async function generate() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('Puppeteer is not installed. Run: npm install puppeteer --save-dev');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
  });
  await browser.close();
  console.log('PDF saved to:', path.resolve(pdfPath));
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});

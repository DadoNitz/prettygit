import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];

export function findChrome() {
  const found = CANDIDATES.find((p) => p && existsSync(p));
  if (!found) throw new Error('Chrome/Edge/Chromium not found. Set CHROME_PATH.');
  return found;
}

// Prints HTML to PDF with headless Chrome: no npm dependency needed.
export function htmlToPdf(html, outPdf) {
  const dir = mkdtempSync(join(tmpdir(), 'prettygit-'));
  const htmlFile = join(dir, 'resume.html');
  writeFileSync(htmlFile, html);
  execFileSync(findChrome(), [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    `--user-data-dir=${join(dir, 'profile')}`,
    `--print-to-pdf=${resolve(outPdf)}`, pathToFileURL(htmlFile).href,
  ], { stdio: 'ignore', timeout: 60000 });
  if (!existsSync(outPdf)) throw new Error('Chrome did not produce the PDF');
}

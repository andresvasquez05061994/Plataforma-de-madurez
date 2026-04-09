import puppeteer from 'puppeteer-core';

export async function htmlToPdf(html: string): Promise<Buffer> {
    let browser;
    try {
        if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
            const chromium = await import('@sparticuz/chromium');
            browser = await puppeteer.launch({
                args: chromium.default.args,
                defaultViewport: { width: 1123, height: 794 },
                executablePath: await chromium.default.executablePath(),
                headless: true,
            });
        } else {
            const fs = await import('fs');
            const paths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                '/usr/bin/google-chrome',
                '/usr/bin/chromium-browser',
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            ];
            const executablePath = paths.find((p) => {
                try { return fs.existsSync(p); } catch { return false; }
            });
            if (!executablePath) throw new Error('Chrome no encontrado para generar PDF');

            browser = await puppeteer.launch({
                executablePath,
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: { width: 1123, height: 794 },
            });
        }

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.evaluateHandle('document.fonts.ready');

        const pdf = await page.pdf({
            landscape: true,
            printBackground: true,
            format: 'A4',
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });

        return Buffer.from(pdf);
    } finally {
        if (browser) await browser.close();
    }
}

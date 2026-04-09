import fs from 'fs';
import path from 'path';
import type { ReportData } from './generateReport';

let cachedTemplate: string | null = null;

export function getReportTemplate(): string {
    if (cachedTemplate) return cachedTemplate;

    const candidates = [
        path.join(process.cwd(), 'src/lib/report-template.html'),
        path.join(process.cwd(), 'public/report-template.html'),
    ];

    for (const p of candidates) {
        try {
            cachedTemplate = fs.readFileSync(p, 'utf-8');
            return cachedTemplate;
        } catch {
            // try next path
        }
    }

    throw new Error('report-template.html not found in any expected location');
}

const DATA_BLOCK_REGEX = /\/\*[\s\S]*?SURVEY RESULTS[\s\S]*?\*\/[\s\S]*?const DATA\s*=\s*\{[\s\S]*?\n\};/;

export function injectReportData(template: string, data: ReportData): string {
    const dataBlock = `const DATA = ${JSON.stringify(data, null, 2)};`;
    const normalized = template.replace(/\r\n/g, '\n');

    const replaced = normalized.replace(DATA_BLOCK_REGEX, dataBlock);

    if (replaced === normalized) {
        console.warn('report-utils: primary regex did not match, trying generic approach');
        const generic = normalized.replace(
            /const DATA\s*=\s*\{[\s\S]*?\n\};/,
            dataBlock
        );
        if (generic !== normalized) return generic;

        console.error('report-utils: no DATA block found in template');
        throw new Error('Could not inject DATA into report template');
    }

    return replaced;
}

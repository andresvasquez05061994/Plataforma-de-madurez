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

export function injectReportData(template: string, data: ReportData): string {
    const dataBlock = `const DATA = ${JSON.stringify(data, null, 2)};`;

    // Handles both \n and \r\n line endings
    const replaced = template.replace(
        /\/\*\s*─+[\s\S]*?─+\s*\*\/\s*[\r\n]+const DATA\s*=\s*\{[\s\S]*?\r?\n\};/,
        dataBlock
    );

    if (replaced === template) {
        console.warn('report-utils: regex did not match — injecting DATA before </script>');
        return template.replace('</script>', `${dataBlock}\n</script>`);
    }

    return replaced;
}

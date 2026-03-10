import { NextRequest, NextResponse } from 'next/server';
import { buildReportData } from '@/lib/generateReport';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const { answers } = await request.json();

        const DATA = buildReportData(answers);

        const templatePath = path.join(process.cwd(), 'src/lib/report-template.html');
        let html = fs.readFileSync(templatePath, 'utf-8');

        const dataBlock = `const DATA = ${JSON.stringify(DATA, null, 2)};`;
        html = html.replace(
            /\/\* ─────────────────────────────[\s\S]*?───────────────────────────────\*\/\s*\nconst DATA = \{[\s\S]*?\n\};/,
            dataBlock
        );

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    } catch (error) {
        console.error('Report generation error:', error);
        return NextResponse.json(
            { error: 'Error al generar el reporte' },
            { status: 500 }
        );
    }
}

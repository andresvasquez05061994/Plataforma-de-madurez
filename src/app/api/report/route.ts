import { NextRequest, NextResponse } from 'next/server';
import { buildReportData } from '@/lib/generateReport';
import { getReportTemplate, injectReportData } from '@/lib/report-utils';

export async function POST(request: NextRequest) {
    try {
        const { answers, scores } = await request.json();

        const DATA = buildReportData(answers, scores);
        const template = getReportTemplate();
        const html = injectReportData(template, DATA);

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

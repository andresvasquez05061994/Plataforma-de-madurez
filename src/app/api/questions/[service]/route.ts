import { NextRequest, NextResponse } from 'next/server';
import { fetchQuestionsFromSheet, getSheetConfig } from '@/lib/google-sheets';
import { questionsBim } from '@/data/questions-bim';
import { questionsIA } from '@/data/questions-ia';
import { questionsPLM } from '@/data/questions-plm';
import { ServiceType } from '@/types/assessment';

export const dynamic = 'force-dynamic';

const STATIC_FALLBACK: Record<ServiceType, typeof questionsBim> = {
    bim: questionsBim,
    ia: questionsIA,
    plm: questionsPLM,
};

export async function GET(
    _request: NextRequest,
    { params }: { params: { service: string } }
) {
    const service = params.service as ServiceType;

    if (!['bim', 'ia', 'plm'].includes(service)) {
        return NextResponse.json({ error: 'Servicio inválido' }, { status: 400 });
    }

    const config = getSheetConfig();
    const sheetInfo = config[service];

    if (sheetInfo) {
        try {
            const questions = await fetchQuestionsFromSheet(sheetInfo.sheetId, sheetInfo.gid);
            if (questions.length > 0) {
                return NextResponse.json({ questions, source: 'google-sheets' });
            }
        } catch (error) {
            console.error(`Sheet fetch failed for ${service}, using fallback:`, error);
        }
    }

    return NextResponse.json({
        questions: STATIC_FALLBACK[service],
        source: 'static',
    });
}

import { ServiceScore, MaturityLevel } from '@/types/assessment';

export interface PDFData {
    company: string;
    industry: string;
    employees: string;
    scores: ServiceScore[];
    globalScore: number;
    globalLevel: MaturityLevel;
    priorityRoadmap: ServiceScore[];
    analysis: string;
    objective: string;
    contact: { name: string; email: string; role: string };
}

// ═══════════════════════════════════════════════════════════════════
// COLOR PALETTE — Inspired by Truora: navy + teal + clean whites
// ═══════════════════════════════════════════════════════════════════

type RGB = [number, number, number];

const PAL = {
    navy:       [15, 23, 42]    as RGB,
    navyMid:    [30, 41, 59]    as RGB,
    navyLight:  [51, 65, 85]    as RGB,
    teal:       [0, 201, 167]   as RGB,
    tealDark:   [0, 160, 133]   as RGB,
    tealSoft:   [224, 252, 246] as RGB,
    white:      [255, 255, 255] as RGB,
    offWhite:   [248, 250, 252] as RGB,
    gray50:     [249, 250, 251] as RGB,
    gray100:    [243, 244, 246] as RGB,
    gray200:    [229, 231, 235] as RGB,
    gray400:    [156, 163, 175] as RGB,
    gray500:    [107, 114, 128] as RGB,
    gray700:    [55, 65, 81]    as RGB,
    gray900:    [17, 24, 39]    as RGB,
    red:        [220, 56, 56]   as RGB,
    redSoft:    [254, 242, 242] as RGB,
    orange:     [234, 140, 30]  as RGB,
    orangeSoft: [255, 249, 235] as RGB,
    green:      [22, 163, 74]   as RGB,
    greenSoft:  [236, 253, 245] as RGB,
};

function levelColor(level: MaturityLevel): RGB {
    switch (level) {
        case 'Inicial':     return PAL.red;
        case 'Oportunista': return PAL.orange;
        case 'Sistemático': return PAL.orange;
        case 'Gestionado':  return PAL.green;
        case 'Optimizado':  return PAL.teal;
    }
}

function levelBg(level: MaturityLevel): RGB {
    switch (level) {
        case 'Inicial':     return PAL.redSoft;
        case 'Oportunista': return PAL.orangeSoft;
        case 'Sistemático': return PAL.orangeSoft;
        case 'Gestionado':  return PAL.greenSoft;
        case 'Optimizado':  return PAL.tealSoft;
    }
}

function nextLevelName(level: MaturityLevel): string {
    const chain: MaturityLevel[] = ['Inicial', 'Oportunista', 'Sistemático', 'Gestionado', 'Optimizado'];
    const idx = chain.indexOf(level);
    return idx < chain.length - 1 ? chain[idx + 1] : 'Optimizado';
}

function industryLabel(key: string): string {
    const map: Record<string, string> = { construccion: 'Construcción', manufactura: 'Manufactura', servicios: 'Servicios / BPO' };
    return map[key] || key || 'N/A';
}

const DIM_KEYS = ['procesos', 'personas', 'herramientas', 'tecnologia'] as const;
const DIM_LABELS = ['Procesos', 'Personas', 'Herramientas', 'Tecnología'];

// ═══════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════════

export async function generatePDF(data: PDFData): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const PW = pdf.internal.pageSize.width;   // 210
    const PH = pdf.internal.pageSize.height;  // 297
    const ML = 20;                            // margin left
    const MR = 20;                            // margin right
    const CW = PW - ML - MR;                 // content width = 170
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    let totalPages = 7;

    // ─── Helper: new page with white bg ────────────────────────────
    const newPage = () => {
        pdf.addPage();
        pdf.setFillColor(...PAL.white);
        pdf.rect(0, 0, PW, PH, 'F');
    };

    // ─── Helper: consistent header stripe ──────────────────────────
    const headerStripe = () => {
        pdf.setFillColor(...PAL.navy);
        pdf.rect(0, 0, PW, 3, 'F');
    };

    // ─── Helper: consistent footer ─────────────────────────────────
    const footer = (pageN: number) => {
        const footY = PH - 14;
        pdf.setDrawColor(...PAL.gray200);
        pdf.setLineWidth(0.3);
        pdf.line(ML, footY, PW - MR, footY);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray400);
        pdf.text('IAC — Ingeniería Asistida por Computador  |  www.iac.com.co', ML, footY + 6);
        pdf.text(`Página ${pageN} de ${totalPages}`, PW - MR, footY + 6, { align: 'right' });
    };

    // ─── Helper: section title ─────────────────────────────────────
    const sectionTitle = (num: string, title: string, y: number): number => {
        pdf.setFillColor(...PAL.teal);
        pdf.roundedRect(ML, y, 8, 8, 2, 2, 'F');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...PAL.white);
        pdf.text(num, ML + 4, y + 5.8, { align: 'center' });

        pdf.setFontSize(15);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...PAL.navy);
        pdf.text(title, ML + 12, y + 6);

        const lineY = y + 11;
        pdf.setDrawColor(...PAL.gray200);
        pdf.setLineWidth(0.3);
        pdf.line(ML, lineY, PW - MR, lineY);
        return lineY + 6;
    };

    // ─── Helper: card box ──────────────────────────────────────────
    const drawCard = (x: number, y: number, w: number, h: number, fill: RGB = PAL.white) => {
        pdf.setFillColor(...fill);
        pdf.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
        pdf.setDrawColor(...PAL.gray200);
        pdf.setLineWidth(0.25);
        pdf.roundedRect(x, y, w, h, 2.5, 2.5, 'S');
    };

    // ─── Helper: score bar ─────────────────────────────────────────
    const drawBar = (x: number, y: number, w: number, h: number, value: number, color: RGB) => {
        pdf.setFillColor(...PAL.gray100);
        pdf.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
        const filled = Math.max((value / 5) * w, h);
        pdf.setFillColor(...color);
        pdf.roundedRect(x, y, filled, h, h / 2, h / 2, 'F');
    };

    // ─── Helper: pill badge ────────────────────────────────────────
    const drawPill = (x: number, y: number, text: string, fg: RGB, bg: RGB): number => {
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        const tw = pdf.getTextWidth(text);
        const pw = tw + 8;
        pdf.setFillColor(...bg);
        pdf.roundedRect(x, y, pw, 6, 3, 3, 'F');
        pdf.setTextColor(...fg);
        pdf.text(text, x + 4, y + 4.3);
        return pw;
    };

    // ─── Helper: check if Y needs page break ──────────────────────
    const needsBreak = (y: number, needed: number = 30): boolean => y + needed > PH - 20;

    // ═══════════════════════════════════════════════════════════════
    // PÁGINA 1 — PORTADA
    // ═══════════════════════════════════════════════════════════════
    pdf.setFillColor(...PAL.navy);
    pdf.rect(0, 0, PW, PH, 'F');

    // Thin teal accent line at top
    pdf.setFillColor(...PAL.teal);
    pdf.rect(0, 0, PW, 3, 'F');

    // Logo area
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(253, 185, 19);  // IAC yellow
    pdf.text('i', ML, 44);
    const iWidth = pdf.getTextWidth('i');
    pdf.setTextColor(...PAL.white);
    pdf.text('ac', ML + iWidth, 44);

    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.gray400);
    pdf.text('Ingeniería Asistida Por Computador', ML, 51);

    // Report badge
    pdf.setFillColor(...PAL.teal);
    pdf.roundedRect(ML, 68, 46, 7, 3, 3, 'F');
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.navy);
    pdf.text('INFORME EJECUTIVO', ML + 4, 73);

    // Title
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.white);
    pdf.text('Diagnóstico de', ML, 95);
    pdf.text('Madurez Digital', ML, 108);

    // Teal underline
    pdf.setFillColor(...PAL.teal);
    pdf.rect(ML, 113, 50, 2, 'F');

    // Company name
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.teal);
    pdf.text(data.company || 'Empresa', ML, 128);

    // Metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.gray400);
    let metaY = 138;
    pdf.text(`Industria:  ${industryLabel(data.industry)}`, ML, metaY);
    if (data.employees) { metaY += 7; pdf.text(`Empleados:  ${data.employees}`, ML, metaY); }
    metaY += 7;
    pdf.text(`Fecha:  ${dateStr}`, ML, metaY);

    // Global score — right aligned card
    const scoreCardX = PW - MR - 60;
    const scoreCardY = 85;
    pdf.setFillColor(...PAL.navyMid);
    pdf.roundedRect(scoreCardX, scoreCardY, 60, 65, 4, 4, 'F');

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.gray400);
    pdf.text('ÍNDICE GLOBAL', scoreCardX + 30, scoreCardY + 12, { align: 'center' });

    const gColor = levelColor(data.globalLevel);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...gColor);
    pdf.text(data.globalScore.toFixed(1), scoreCardX + 30, scoreCardY + 33, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.gray400);
    pdf.text('/ 5.0', scoreCardX + 30, scoreCardY + 41, { align: 'center' });

    pdf.setFillColor(...gColor);
    pdf.roundedRect(scoreCardX + 10, scoreCardY + 47, 40, 8, 3, 3, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.white);
    pdf.text(data.globalLevel.toUpperCase(), scoreCardX + 30, scoreCardY + 52.8, { align: 'center' });

    // Services evaluated tags
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.gray400);
    pdf.text('Servicios evaluados', ML, 170);

    let tagX = ML;
    for (const score of data.scores) {
        pdf.setFillColor(...PAL.navyMid);
        pdf.roundedRect(tagX, 174, 0, 7, 3, 3, 'F'); // measure first
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        const labelW = pdf.getTextWidth(score.label);
        pdf.setFillColor(...PAL.navyMid);
        pdf.roundedRect(tagX, 174, labelW + 10, 7, 3, 3, 'F');
        pdf.setTextColor(...PAL.teal);
        pdf.text(score.label, tagX + 5, 179);
        tagX += labelW + 16;
    }

    // Table of contents
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.gray400);
    pdf.text('CONTENIDO', ML, 200);

    const tocItems = [
        '01  Resumen Ejecutivo',
        '02  Mapa de Brechas por Dimensión',
        '03  Diagnóstico por Servicio Evaluado',
        '04  Plan de Acción — Hoja de Ruta 90 Días',
        '05  Análisis Estratégico y Recomendaciones',
        '06  Próximos Pasos y Métricas de Seguimiento',
    ];
    let tocY = 208;
    for (const item of tocItems) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(180, 190, 210);
        pdf.text(item, ML, tocY);
        tocY += 7;
    }

    // Bottom accent bar
    pdf.setFillColor(...PAL.teal);
    pdf.rect(0, PH - 8, PW, 8, 'F');
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.navy);
    pdf.text('www.iac.com.co  |  info@iac.com.co  |  30 años elevando la eficiencia de los negocios', PW / 2, PH - 3, { align: 'center' });

    // ═══════════════════════════════════════════════════════════════
    // PÁGINA 2 — RESUMEN EJECUTIVO
    // ═══════════════════════════════════════════════════════════════
    newPage();
    headerStripe();
    let y = sectionTitle('01', 'Resumen Ejecutivo', 14);
    footer(2);

    // 3 KPI cards
    const kpiW = (CW - 10) / 3;
    const kpiData = [
        { label: 'Índice Global',    value: `${data.globalScore.toFixed(1)}/5.0`, sub: 'Promedio ponderado', color: levelColor(data.globalLevel), bg: levelBg(data.globalLevel) },
        { label: 'Nivel Actual',     value: data.globalLevel,                     sub: 'Madurez identificada', color: levelColor(data.globalLevel), bg: levelBg(data.globalLevel) },
        { label: 'Siguiente Nivel',  value: nextLevelName(data.globalLevel),      sub: 'Objetivo de mejora',   color: PAL.teal, bg: PAL.tealSoft },
    ];

    for (let i = 0; i < 3; i++) {
        const kx = ML + i * (kpiW + 5);
        const kpi = kpiData[i];
        drawCard(kx, y, kpiW, 30, kpi.bg);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray500);
        pdf.text(kpi.label.toUpperCase(), kx + kpiW / 2, y + 9, { align: 'center' });
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...kpi.color);
        pdf.text(kpi.value, kx + kpiW / 2, y + 21, { align: 'center' });
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray400);
        pdf.text(kpi.sub, kx + kpiW / 2, y + 27, { align: 'center' });
    }
    y += 38;

    // Maturity journey
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.navy);
    pdf.text('Escala de Madurez', ML, y);
    y += 5;

    const levels: MaturityLevel[] = ['Inicial', 'Oportunista', 'Sistemático', 'Gestionado', 'Optimizado'];
    const segW = CW / 5;
    for (let i = 0; i < 5; i++) {
        const lv = levels[i];
        const isActive = lv === data.globalLevel;
        const isPast = levels.indexOf(data.globalLevel) > i;

        if (isActive) {
            pdf.setFillColor(...levelColor(lv));
        } else if (isPast) {
            const c = levelColor(lv);
            pdf.setFillColor(
                Math.round(c[0] * 0.3 + 255 * 0.7),
                Math.round(c[1] * 0.3 + 255 * 0.7),
                Math.round(c[2] * 0.3 + 255 * 0.7)
            );
        } else {
            pdf.setFillColor(...PAL.gray100);
        }

        const segX = ML + i * segW;
        pdf.roundedRect(segX + 0.5, y, segW - 1, 9, 1.5, 1.5, 'F');

        pdf.setFontSize(7);
        pdf.setFont('helvetica', isActive ? 'bold' : 'normal');
        pdf.setTextColor(isActive ? 255 : isPast ? 80 : 170, isActive ? 255 : isPast ? 80 : 170, isActive ? 255 : isPast ? 80 : 170);
        pdf.text(lv, segX + (segW - 1) / 2 + 0.5, y + 6.2, { align: 'center' });

        if (isActive) {
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...levelColor(lv));
            pdf.text('▲ Usted está aquí', segX + (segW - 1) / 2 + 0.5, y + 16, { align: 'center' });
        }
    }
    y += 24;

    // Alert matrix
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.navy);
    pdf.text('Matriz de Resultados por Dimensión', ML, y);
    y += 5;

    // Table header
    const labelCol = 38;
    const dataColW = (CW - labelCol) / data.scores.length;

    drawCard(ML, y, CW, 10, PAL.navy);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.white);
    pdf.text('DIMENSIÓN', ML + 4, y + 7);
    for (let s = 0; s < data.scores.length; s++) {
        pdf.text(data.scores[s].label, ML + labelCol + dataColW * s + dataColW / 2, y + 7, { align: 'center' });
    }
    y += 12;

    // Data rows
    for (let d = 0; d < DIM_KEYS.length; d++) {
        const dim = DIM_KEYS[d];
        const rowBg = d % 2 === 0 ? PAL.gray50 : PAL.white;
        drawCard(ML, y, CW, 11, rowBg);

        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray700);
        pdf.text(DIM_LABELS[d], ML + 4, y + 7.5);

        for (let s = 0; s < data.scores.length; s++) {
            const val = data.scores[s].dimensionScores[dim];
            const col = val >= 3.5 ? PAL.green : val >= 2.5 ? PAL.orange : PAL.red;
            const cx = ML + labelCol + dataColW * s + dataColW / 2;

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...col);
            pdf.text(val.toFixed(1), cx, y + 7.5, { align: 'center' });
        }
        y += 12;
    }

    // Total row
    drawCard(ML, y, CW, 11, PAL.navy);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.white);
    pdf.text('SCORE TOTAL', ML + 4, y + 7.5);
    for (let s = 0; s < data.scores.length; s++) {
        const col = levelColor(data.scores[s].level);
        pdf.setTextColor(...col);
        pdf.text(data.scores[s].score.toFixed(1), ML + labelCol + dataColW * s + dataColW / 2, y + 7.5, { align: 'center' });
    }
    y += 18;

    // Top critical gaps
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.navy);
    pdf.text('Brechas Críticas Identificadas', ML, y);
    y += 6;

    const allGaps: { svc: string; dim: string; val: number }[] = [];
    for (const sc of data.scores) {
        for (let d = 0; d < DIM_KEYS.length; d++) {
            const val = sc.dimensionScores[DIM_KEYS[d]];
            if (val < 3.0) allGaps.push({ svc: sc.label, dim: DIM_LABELS[d], val });
        }
    }
    allGaps.sort((a, b) => a.val - b.val);

    if (allGaps.length === 0) {
        drawCard(ML, y, CW, 14, PAL.greenSoft);
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.green);
        pdf.text('Sin brechas críticas — todas las dimensiones están por encima del umbral.', ML + 6, y + 9);
    } else {
        for (let i = 0; i < Math.min(allGaps.length, 5); i++) {
            const g = allGaps[i];
            const isUrgent = g.val < 2.0;
            drawCard(ML, y, CW, 12, isUrgent ? PAL.redSoft : PAL.orangeSoft);
            pdf.setFillColor(...(isUrgent ? PAL.red : PAL.orange));
            pdf.roundedRect(ML, y, 2.5, 12, 1, 1, 'F');

            pdf.setFontSize(8.5);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...(isUrgent ? PAL.red : PAL.orange));
            pdf.text(`${g.svc}  ›  ${g.dim}`, ML + 8, y + 8);

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...PAL.gray500);
            pdf.text(`${g.val.toFixed(1)}/5.0`, PW - MR - 30, y + 8);

            drawPill(PW - MR - 22, y + 5, isUrgent ? 'URGENTE' : 'ATENCIÓN', isUrgent ? PAL.red : PAL.orange, isUrgent ? PAL.redSoft : PAL.orangeSoft);
            y += 14;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PÁGINA 3 — MAPA DE BRECHAS
    // ═══════════════════════════════════════════════════════════════
    newPage();
    headerStripe();
    y = sectionTitle('02', 'Mapa de Brechas por Dimensión', 14);
    footer(3);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.gray500);
    pdf.text('Mapa de calor que identifica los frentes que requieren intervención prioritaria.', ML, y);
    y += 10;

    // Heat map
    const hmLabelW = 42;
    const hmColW = (CW - hmLabelW) / data.scores.length;
    const hmCellH = 22;

    // Header
    drawCard(ML, y, CW, 10, PAL.navy);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.white);
    pdf.text('DIMENSIÓN', ML + 4, y + 7);
    for (let s = 0; s < data.scores.length; s++) {
        pdf.text(data.scores[s].label, ML + hmLabelW + hmColW * s + hmColW / 2, y + 7, { align: 'center' });
    }
    y += 12;

    for (let d = 0; d < DIM_KEYS.length; d++) {
        const dim = DIM_KEYS[d];

        // Row label
        pdf.setFillColor(...PAL.gray50);
        pdf.roundedRect(ML, y, hmLabelW - 2, hmCellH, 2, 2, 'F');
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...PAL.gray700);
        pdf.text(DIM_LABELS[d], ML + 4, y + hmCellH / 2 + 1);

        // Data cells
        for (let s = 0; s < data.scores.length; s++) {
            const val = data.scores[s].dimensionScores[dim];
            const col = val >= 3.5 ? PAL.green : val >= 2.5 ? PAL.orange : PAL.red;
            const bg2 = val >= 3.5 ? PAL.greenSoft : val >= 2.5 ? PAL.orangeSoft : PAL.redSoft;
            const cellX = ML + hmLabelW + hmColW * s;

            pdf.setFillColor(...bg2);
            pdf.roundedRect(cellX + 1, y, hmColW - 2, hmCellH, 2, 2, 'F');

            pdf.setFontSize(13);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...col);
            pdf.text(val.toFixed(1), cellX + hmColW / 2, y + hmCellH / 2, { align: 'center' });

            const statusTxt = val >= 3.5 ? 'Controlado' : val >= 2.5 ? 'Atención' : 'Crítico';
            pdf.setFontSize(6.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...col);
            pdf.text(statusTxt, cellX + hmColW / 2, y + hmCellH - 4, { align: 'center' });
        }
        y += hmCellH + 2;
    }

    // Global row
    y += 2;
    drawCard(ML, y, CW, 12, PAL.navy);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.white);
    pdf.text('SCORE GLOBAL', ML + 4, y + 8.5);
    for (let s = 0; s < data.scores.length; s++) {
        const col = levelColor(data.scores[s].level);
        pdf.setTextColor(...col);
        pdf.text(`${data.scores[s].score.toFixed(1)}  ·  ${data.scores[s].level}`, ML + hmLabelW + hmColW * s + hmColW / 2, y + 8.5, { align: 'center' });
    }
    y += 20;

    // Legend
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.navy);
    pdf.text('Interpretación:', ML, y);
    y += 6;

    const legends = [
        { label: 'Crítico (< 2.5) — Intervención inmediata requerida',    color: PAL.red,    bg: PAL.redSoft },
        { label: 'Atención (2.5 – 3.5) — Oportunidad de mejora activa',   color: PAL.orange, bg: PAL.orangeSoft },
        { label: 'Controlado (> 3.5) — Fortaleza de la organización',      color: PAL.green,  bg: PAL.greenSoft },
    ];
    for (const lg of legends) {
        pdf.setFillColor(...lg.color);
        pdf.roundedRect(ML, y - 2, 4, 4, 1, 1, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray700);
        pdf.text(lg.label, ML + 7, y + 1);
        y += 8;
    }

    // ═══════════════════════════════════════════════════════════════
    // PÁGINA 4 — DIAGNÓSTICO POR SERVICIO
    // ═══════════════════════════════════════════════════════════════
    newPage();
    headerStripe();
    y = sectionTitle('03', 'Diagnóstico por Servicio Evaluado', 14);
    footer(4);

    for (const score of data.scores) {
        if (needsBreak(y, 75)) {
            newPage();
            headerStripe();
            footer(4);
            y = 18;
        }

        const col = levelColor(score.level);
        const bg2 = levelBg(score.level);
        const nextLvl = nextLevelName(score.level);
        const cardH = 68;

        drawCard(ML, y, CW, cardH, PAL.white);

        // Left accent bar
        pdf.setFillColor(...col);
        pdf.roundedRect(ML, y, 3, cardH, 1.5, 1.5, 'F');

        // Service name
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...PAL.navy);
        pdf.text(score.label, ML + 10, y + 12);

        // Level pill
        drawPill(ML + 10, y + 16, score.level.toUpperCase(), col, bg2);

        // Objective pill
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray400);
        pdf.text(`Objetivo  →  ${nextLvl}`, ML + 10, y + 28);

        // Score big
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...col);
        pdf.text(score.score.toFixed(1), PW - MR - 10, y + 14, { align: 'right' });
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray400);
        pdf.text('/ 5.0', PW - MR - 10, y + 21, { align: 'right' });

        // Dimension bars
        let barY = y + 36;
        for (let d = 0; d < DIM_KEYS.length; d++) {
            const dim = DIM_KEYS[d];
            const val = score.dimensionScores[dim];
            const dc = val >= 3.5 ? PAL.green : val >= 2.5 ? PAL.orange : PAL.red;

            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...PAL.gray700);
            pdf.text(DIM_LABELS[d], ML + 10, barY + 3);

            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(...dc);
            pdf.text(val.toFixed(1), ML + 52, barY + 3);

            drawBar(ML + 62, barY, CW - 82, 4, val, dc);
            barY += 8;
        }

        y += cardH + 8;
    }

    // ═══════════════════════════════════════════════════════════════
    // PÁGINA 5 — HOJA DE RUTA 90 DÍAS
    // ═══════════════════════════════════════════════════════════════
    newPage();
    headerStripe();
    y = sectionTitle('04', 'Plan de Acción — Hoja de Ruta 90 Días', 14);
    footer(5);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.gray500);
    pdf.text('Plan estructurado para llevar a la organización al siguiente nivel de eficiencia.', ML, y);
    y += 8;

    const phases = [
        {
            num: '01', title: 'QUICK WINS', range: 'Días 1 – 30', color: PAL.teal,
            items: [
                'Diagnóstico profundo de procesos con líderes de área',
                `Priorizar intervención en ${data.priorityRoadmap[0]?.label || 'frente más crítico'}`,
                'Designar equipo y sponsor de transformación digital',
                'Definir KPIs de línea base para cada dimensión',
                'Identificar 3 procesos candidatos a automatización',
            ],
        },
        {
            num: '02', title: 'IMPLEMENTACIÓN', range: 'Días 31 – 60', color: PAL.orange,
            items: [
                'Desplegar piloto en proceso de mayor impacto',
                'Capacitación del equipo en herramientas digitales',
                'Integrar flujos de trabajo entre áreas evaluadas',
                'Primera medición de KPIs vs. línea base',
                'Documentar lecciones aprendidas del piloto',
            ],
        },
        {
            num: '03', title: 'ESCALAMIENTO', range: 'Días 61 – 90', color: PAL.green,
            items: [
                'Replicar piloto exitoso a otros procesos',
                'Establecer gobierno de mejora continua mensual',
                'Elaborar roadmap a 12 meses con inversión estimada',
                'Re-evaluación de madurez (2do diagnóstico)',
                'Validar alineación con siguiente nivel objetivo',
            ],
        },
    ];

    const phW = (CW - 10) / 3;

    for (let i = 0; i < 3; i++) {
        const ph = phases[i];
        const px = ML + i * (phW + 5);

        // Phase header
        pdf.setFillColor(...ph.color);
        pdf.roundedRect(px, y, phW, 20, 2, 2, 'F');

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...PAL.white);
        pdf.text(ph.num, px + 6, y + 9);

        pdf.setFontSize(9);
        pdf.text(ph.title, px + phW / 2, y + 9, { align: 'center' });

        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(230, 240, 245);
        pdf.text(ph.range, px + phW / 2, y + 16.5, { align: 'center' });

        // Action items
        let iy = y + 24;
        for (const item of ph.items) {
            drawCard(px, iy, phW, 14, PAL.gray50);
            pdf.setFillColor(...ph.color);
            pdf.circle(px + 5, iy + 5.5, 1.3, 'F');

            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...PAL.gray700);
            const lines = pdf.splitTextToSize(item, phW - 14);
            pdf.text(lines[0], px + 9, iy + 6);
            if (lines[1]) pdf.text(lines[1], px + 9, iy + 11);
            iy += 16;
        }
    }

    // Priority order
    y += 24 + phases[0].items.length * 16 + 10;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.navy);
    pdf.text('Orden de Prioridad de Intervención', ML, y);
    y += 6;

    for (let i = 0; i < data.priorityRoadmap.length; i++) {
        const sr = data.priorityRoadmap[i];
        const isFirst = i === 0;
        drawCard(ML, y, CW, 14, isFirst ? PAL.tealSoft : PAL.gray50);

        if (isFirst) {
            pdf.setFillColor(...PAL.teal);
            pdf.roundedRect(ML, y, 3, 14, 1.5, 1.5, 'F');
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...(isFirst ? PAL.teal : PAL.gray700));
        pdf.text(`#${i + 1}`, ML + 8, y + 9.5);

        pdf.setTextColor(...PAL.navy);
        pdf.text(sr.label, ML + 22, y + 9.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray500);
        pdf.text(`${sr.score.toFixed(1)}/5.0  ·  ${sr.level}`, ML + CW * 0.55, y + 9.5);

        if (isFirst) {
            drawPill(PW - MR - 35, y + 6.5, 'EMPEZAR AQUÍ', PAL.teal, PAL.tealSoft);
        }

        y += 16;
    }

    // ═══════════════════════════════════════════════════════════════
    // PÁGINA 6 — ANÁLISIS ESTRATÉGICO
    // ═══════════════════════════════════════════════════════════════
    newPage();
    headerStripe();
    y = sectionTitle('05', 'Análisis Estratégico', 14);
    footer(6);

    if (!data.analysis || data.analysis.trim().length === 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray500);
        pdf.text('El análisis estratégico detallado no está disponible.', ML, y);
        pdf.text('Contacte al equipo IAC para una consultoría personalizada.', ML, y + 6);
    } else {
        // Parse markdown-style analysis into sections
        const rawLines = data.analysis.split('\n');
        let currentSection: { heading: string; bullets: string[]; paragraphs: string[] } | null = null;
        const analysisSections: { heading: string; bullets: string[]; paragraphs: string[] }[] = [];

        for (const rawLine of rawLines) {
            const line = rawLine.trim();
            if (!line) continue;

            const headingMatch = line.match(/^#{1,3}\s+(.+)/);
            if (headingMatch) {
                if (currentSection) analysisSections.push(currentSection);
                currentSection = { heading: headingMatch[1].replace(/\*\*/g, ''), bullets: [], paragraphs: [] };
                continue;
            }

            if (!currentSection) {
                currentSection = { heading: '', bullets: [], paragraphs: [] };
            }

            const bulletMatch = line.match(/^[-*•]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
            if (bulletMatch) {
                currentSection.bullets.push(bulletMatch[1].replace(/\*\*/g, ''));
            } else {
                currentSection.paragraphs.push(line.replace(/\*\*/g, ''));
            }
        }
        if (currentSection) analysisSections.push(currentSection);

        let secIndex = 0;
        for (const sec of analysisSections) {
            if (needsBreak(y, 30)) {
                newPage();
                headerStripe();
                footer(6);
                y = 18;
            }

            // Section heading with card
            if (sec.heading) {
                const headColor = secIndex === 0 ? PAL.teal : secIndex === 1 ? PAL.red : secIndex === 2 ? PAL.orange : PAL.green;

                drawCard(ML, y, CW, 10, PAL.navy);
                pdf.setFillColor(...headColor);
                pdf.roundedRect(ML, y, 3, 10, 1.5, 1.5, 'F');
                pdf.setFontSize(9.5);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(...PAL.white);
                pdf.text(sec.heading, ML + 8, y + 7);
                y += 14;
            }

            // Paragraphs
            for (const para of sec.paragraphs) {
                if (needsBreak(y, 15)) {
                    newPage(); headerStripe(); footer(6); y = 18;
                }
                pdf.setFontSize(8.5);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(...PAL.gray700);
                const wrapped = pdf.splitTextToSize(para, CW - 4);
                for (const wl of wrapped) {
                    if (needsBreak(y, 6)) {
                        newPage(); headerStripe(); footer(6); y = 18;
                    }
                    pdf.text(wl, ML + 2, y);
                    y += 4.5;
                }
                y += 2;
            }

            // Bullets as styled list
            if (sec.bullets.length > 0) {
                for (const bullet of sec.bullets) {
                    if (needsBreak(y, 16)) {
                        newPage(); headerStripe(); footer(6); y = 18;
                    }

                    const bulletLines = pdf.splitTextToSize(bullet, CW - 18);
                    const bulletH = Math.max(12, bulletLines.length * 5 + 6);

                    drawCard(ML + 2, y, CW - 4, bulletH, PAL.gray50);

                    const bColor = secIndex === 1 ? PAL.red : secIndex === 2 ? PAL.orange : PAL.teal;
                    pdf.setFillColor(...bColor);
                    pdf.circle(ML + 8, y + 6, 1.5, 'F');

                    pdf.setFontSize(8.5);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(...PAL.gray700);
                    let blY = y + 6.5;
                    for (const bl of bulletLines) {
                        pdf.text(bl, ML + 14, blY);
                        blY += 5;
                    }

                    y += bulletH + 2;
                }
            }

            y += 4;
            secIndex++;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PÁGINA 7 — PRÓXIMOS PASOS + CTA
    // ═══════════════════════════════════════════════════════════════
    newPage();
    headerStripe();
    y = sectionTitle('06', 'Próximos Pasos', 14);
    footer(7);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PAL.gray500);
    pdf.text('Acciones inmediatas recomendadas para los próximos 30 días.', ML, y);
    y += 8;

    const nextSteps = [
        { plazo: '1 – 3 días',   desc: 'Socializar este informe con el equipo directivo y sponsor de transformación.', color: PAL.teal  },
        { plazo: '3 – 7 días',   desc: `Agendar sesión de kickoff con IAC para ${data.priorityRoadmap[0]?.label || 'el frente más crítico'}.`, color: PAL.teal },
        { plazo: '7 – 14 días',  desc: 'Definir KPIs de línea base y asignar responsables por cada dimensión evaluada.', color: PAL.orange },
        { plazo: '14 – 30 días', desc: 'Iniciar piloto en el proceso de mayor impacto identificado en el diagnóstico.', color: PAL.green },
    ];

    for (const ns of nextSteps) {
        drawCard(ML, y, CW, 18, PAL.white);
        pdf.setFillColor(...ns.color);
        pdf.roundedRect(ML, y, 3, 18, 1.5, 1.5, 'F');

        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...ns.color);
        pdf.text(ns.plazo, ML + 8, y + 7);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray700);
        const descLines = pdf.splitTextToSize(ns.desc, CW - 20);
        pdf.text(descLines[0], ML + 8, y + 13);
        if (descLines[1]) pdf.text(descLines[1], ML + 8, y + 18);
        y += 22;
    }

    // Metrics table
    y += 4;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.navy);
    pdf.text('Métricas de Seguimiento — Línea Base vs. Meta a 90 Días', ML, y);
    y += 6;

    // Table header
    drawCard(ML, y, CW, 10, PAL.navy);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.white);
    pdf.text('INDICADOR', ML + 4, y + 7);
    pdf.text('LÍNEA BASE', ML + CW * 0.55, y + 7, { align: 'center' });
    pdf.text('META 90 DÍAS', ML + CW * 0.82, y + 7, { align: 'center' });
    y += 12;

    const metricRows = [
        { label: 'Índice Global de Madurez', base: `${data.globalScore.toFixed(1)}/5.0`, meta: `${Math.min(data.globalScore + 0.8, 5).toFixed(1)}/5.0` },
        ...data.scores.map(s => ({
            label: `Madurez ${s.label}`,
            base: `${s.score.toFixed(1)}/5.0`,
            meta: `${Math.min(s.score + 1.0, 5).toFixed(1)}/5.0`,
        })),
    ];

    for (let r = 0; r < metricRows.length; r++) {
        const row = metricRows[r];
        const rowBg = r % 2 === 0 ? PAL.gray50 : PAL.white;
        drawCard(ML, y, CW, 10, rowBg);

        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...PAL.gray700);
        pdf.text(row.label, ML + 4, y + 7);

        pdf.setTextColor(...PAL.gray500);
        pdf.text(row.base, ML + CW * 0.55, y + 7, { align: 'center' });

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...PAL.teal);
        pdf.text(row.meta, ML + CW * 0.82, y + 7, { align: 'center' });
        y += 11;
    }

    // CTA Block
    y += 8;
    const ctaH = 52;
    pdf.setFillColor(...PAL.navy);
    pdf.roundedRect(ML, y, CW, ctaH, 4, 4, 'F');

    // Teal accent line inside
    pdf.setFillColor(...PAL.teal);
    pdf.rect(ML + 6, y + 6, 40, 2, 'F');

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.white);
    pdf.text('¿Listo para acelerar su transformación?', ML + 6, y + 18);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(180, 195, 215);
    pdf.text('El equipo IAC diseña planes de implementación personalizados', ML + 6, y + 27);
    pdf.text('basados en los resultados de este diagnóstico.', ML + 6, y + 33);

    // Contact info
    pdf.setFillColor(...PAL.teal);
    pdf.roundedRect(ML + 6, y + 38, 56, 8, 3, 3, 'F');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...PAL.navy);
    pdf.text('info@iac.com.co', ML + 10, y + 43.5);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(180, 195, 215);
    pdf.text('www.iac.com.co', ML + 70, y + 43.5);

    // Save
    const safeName = (data.company || 'empresa').replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '').replace(/\s+/g, '_');
    const filename = `IAC_Diagnostico_Madurez_${safeName}_${now.toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
}

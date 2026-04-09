import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildReportData } from '@/lib/generateReport';
import { getReportTemplate, injectReportData } from '@/lib/report-utils';

export async function POST(request: NextRequest) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'Resend no está configurado. Agrega RESEND_API_KEY en las variables de entorno.' },
            { status: 503 }
        );
    }

    try {
        const { name, email, company, services, answers, scores } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
        }

        const resend = new Resend(apiKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        let reportHtml: string;
        try {
            const DATA = buildReportData(answers, scores);
            const template = getReportTemplate();
            reportHtml = injectReportData(template, DATA);
        } catch (tplErr) {
            console.error('Template generation error:', tplErr);
            reportHtml = `<html><body><h1>Diagnóstico de Madurez Digital — ${company || 'Empresa'}</h1><p>El reporte completo no pudo generarse. Descárgalo desde la plataforma.</p></body></html>`;
        }

        const servicesText = (services as string[])?.join(', ') || 'Madurez Digital';
        const contactName = name || 'Estimado/a';

        const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #1B2A4A; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #F8F9FB;">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://iac.com.co/wp-content/uploads/2023/01/logo-IAC.png" alt="IAC" style="height: 60px;" />
  </div>

  <div style="background: #FFFFFF; border-radius: 16px; padding: 32px; border: 1px solid #E2E8F0;">
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Buen día <strong>${contactName}</strong>
    </p>

    <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px; color: #334155;">
      Desde <strong>Ingeniería Asistida por Computador</strong> estamos complacidos de compartirte los resultados de evaluación de madurez <strong>${servicesText}</strong> para <strong>${company || 'tu organización'}</strong>.
    </p>

    <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px; color: #334155;">
      Esperamos que estos hallazgos sean la base de transformación para lograr impactos reales en los procesos de tu organización.
    </p>

    <p style="font-size: 15px; line-height: 1.7; margin: 0 0 24px; color: #334155;">
      Nos ponemos a tu disposición para acompañarte como aliado estratégico y lograr resultados extraordinarios.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="mailto:info@iac.com.co?subject=Consultoría Diagnóstico de Madurez Digital - ${company || ''}"
         style="display: inline-block; background: #FDB813; color: #1B2A4A; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px;">
        Agendar consultoría gratuita
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />

    <p style="font-size: 12px; color: #94A3B8; text-align: center; line-height: 1.5;">
      Adjuntamos tu reporte completo de diagnóstico en el archivo HTML.<br/>
      Ábrelo en tu navegador para ver los resultados detallados e imprimir a PDF.
    </p>
  </div>

  <div style="text-align: center; margin-top: 24px;">
    <p style="font-size: 11px; color: #94A3B8; line-height: 1.5;">
      IAC — Ingeniería Asistida por Computador<br/>
      30 años elevando la eficiencia de los negocios<br/>
      <a href="https://iac.com.co" style="color: #FDB813;">iac.com.co</a>
    </p>
  </div>
</body>
</html>`;

        const { data, error } = await resend.emails.send({
            from: `IAC Diagnóstico <${fromEmail}>`,
            to: [email],
            subject: `Resultados de Evaluación de Madurez Digital — ${company || 'Tu Empresa'}`,
            html: emailHtml,
            attachments: [
                {
                    filename: `Diagnostico-${(company || 'Empresa').replace(/\s+/g, '-')}.html`,
                    content: Buffer.from(reportHtml, 'utf-8'),
                },
            ],
        });

        if (error) {
            console.error('Resend API error:', JSON.stringify(error));
            return NextResponse.json(
                { error: error.message || 'Error del servicio de correo' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, id: data?.id });
    } catch (err: any) {
        console.error('Send email error:', err?.message || err);
        return NextResponse.json(
            { error: err?.message || 'Error al enviar el correo' },
            { status: 500 }
        );
    }
}

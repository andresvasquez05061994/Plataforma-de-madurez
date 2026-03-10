import { Question, QuestionOption } from '@/types/assessment';

/**
 * Fetches questions from a published Google Sheet and parses them
 * into the Question[] format the app expects.
 *
 * SHEET FORMAT (columns A-O):
 * ┌──────────┬────────────┬──────┬──────┬─────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
 * │ id       │ dimension  │ text │ help │ type    │ opt1_title│ opt1_desc │ opt2_title│ opt2_desc │ opt3_title│ opt3_desc │ opt4_title│ opt4_desc │ opt5_title│ opt5_desc │
 * ├──────────┼────────────┼──────┼──────┼─────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┤
 * │ bim-proc-1│ procesos  │ ...  │ ...  │ options │ Título 1  │ Desc 1    │ Título 2  │ Desc 2    │ ...       │ ...       │ ...       │ ...       │ ...       │ ...       │
 * │ bim-prio │ procesos   │ ...  │ ...  │ priority│           │           │           │           │           │           │           │           │           │           │
 * └──────────┴────────────┴──────┴──────┴─────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘
 *
 * The sheet must be published: File → Share → Publish to Web → CSV
 */

const CACHE = new Map<string, { data: Question[]; ts: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds — keeps sheets fresh

function csvUrls(sheetId: string, gid = '0'): string[] {
    return [
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
        `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv&gid=${gid}`,
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
    ];
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

function parseCSV(csv: string): Record<string, string>[] {
    const lines = csv.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
            row[h.toLowerCase().trim()] = values[idx] || '';
        });
        rows.push(row);
    }
    return rows;
}

function rowToQuestion(row: Record<string, string>): Question | null {
    const id = row['id'];
    const text = row['text'];
    const type = row['type'] as 'options' | 'priority' | 'open';

    if (!id || !text || !type) return null;

    const dimension = (row['dimension'] || 'procesos') as Question['dimension'];
    const help = row['help'] || '';

    const question: Question = { id, dimension, text, help, type };

    if (type === 'options') {
        const options: QuestionOption[] = [];
        for (let level = 1; level <= 5; level++) {
            const title = row[`opt${level}_title`];
            const description = row[`opt${level}_desc`];
            if (title && description) {
                options.push({ level, title, description });
            }
        }
        if (options.length > 0) {
            question.options = options;
        }
    }

    return question;
}

export async function fetchQuestionsFromSheet(
    sheetId: string,
    gid = '0'
): Promise<Question[]> {
    const cacheKey = `${sheetId}_${gid}`;
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
    }

    const urls = csvUrls(sheetId, gid);
    let lastError: Error | null = null;

    for (const url of urls) {
        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: { 'Accept': 'text/csv,text/plain,*/*' },
            });

            if (!response.ok) {
                console.warn(`Google Sheets fetch failed: ${response.status} for URL ${url}`);
                continue;
            }

            const text = await response.text();

            if (text.includes('<!DOCTYPE html>') || text.includes('Sign in') || text.includes('<html')) {
                console.warn(`Google Sheets returned HTML (auth page) for URL ${url}`);
                continue;
            }

            const rows = parseCSV(text);
            const questions = rows
                .map(rowToQuestion)
                .filter((q): q is Question => q !== null);

            if (questions.length > 0) {
                CACHE.set(cacheKey, { data: questions, ts: Date.now() });
                console.log(`Loaded ${questions.length} questions from Google Sheets (${url})`);
                return questions;
            }

            console.warn(`No valid questions parsed from ${url}`);
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            console.warn(`Fetch error for ${url}:`, lastError.message);
        }
    }

    throw lastError || new Error(`Failed to fetch sheet ${sheetId} from all endpoints`);
}

export function getSheetConfig(): Record<string, { sheetId: string; gid: string } | null> {
    return {
        bim: process.env.GOOGLE_SHEET_BIM
            ? { sheetId: process.env.GOOGLE_SHEET_BIM, gid: process.env.GOOGLE_SHEET_BIM_GID || '0' }
            : null,
        ia: process.env.GOOGLE_SHEET_IA
            ? { sheetId: process.env.GOOGLE_SHEET_IA, gid: process.env.GOOGLE_SHEET_IA_GID || '0' }
            : null,
        plm: process.env.GOOGLE_SHEET_PLM
            ? { sheetId: process.env.GOOGLE_SHEET_PLM, gid: process.env.GOOGLE_SHEET_PLM_GID || '0' }
            : null,
    };
}

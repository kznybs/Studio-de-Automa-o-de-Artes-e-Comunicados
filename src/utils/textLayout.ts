/**
 * Pure functions for text wrapping, hit testing, and CSV formatting.
 * Decoupled from DOM for fast unit testing.
 */

export interface LineObject {
  words: string[];
  isLastInParagraph: boolean;
}

export function wrapParagraphLines(
  text: string,
  maxWidth: number,
  measureWidth: (str: string) => number
): LineObject[] {
  const rawParagraphs = String(text ?? '').split('\n');
  const allLines: LineObject[] = [];

  rawParagraphs.forEach((para) => {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      allLines.push({ words: [''], isLastInParagraph: true });
      return;
    }

    let currentLine: string[] = [words[0]];
    for (let i = 1; i < words.length; i++) {
      const testStr = currentLine.concat(words[i]).join(' ');
      if (measureWidth(testStr) <= maxWidth) {
        currentLine.push(words[i]);
      } else {
        allLines.push({ words: currentLine, isLastInParagraph: false });
        currentLine = [words[i]];
      }
    }
    allLines.push({ words: currentLine, isLastInParagraph: true });
  });

  return allLines;
}

export function calculateTextBoxHeight(
  linesCount: number,
  fontSize: number,
  lineHeightMultiplier = 1.25
): number {
  const count = Math.max(1, linesCount);
  const lineHeightPx = fontSize * lineHeightMultiplier;
  return Math.round(count * lineHeightPx);
}

export function isPointInBox(
  px: number,
  py: number,
  box: { x: number; y: number; w: number; h: number },
  padding = 6
): boolean {
  return (
    px >= box.x - padding &&
    px <= box.x + box.w + padding &&
    py >= box.y - padding &&
    py <= box.y + box.h + padding
  );
}

export function slugify(str: string): string {
  const clean = String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return clean || 'comunicado';
}

export function generateHistoryCsv(
  records: Array<{
    id: string;
    timestamp: string;
    templateName: string;
    category: string;
    format: string;
    values: Record<string, string>;
  }>
): string {
  const escapeCsv = (val: unknown): string => {
    const s = String(val ?? '').replace(/\r?\n/g, ' ');
    return s.includes(';') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rows = [
    ['ID Registro', 'Data e Hora', 'Modelo Utilizado', 'Categoria', 'Formato', 'Dados Preenchidos']
  ];

  records.forEach((r) => {
    rows.push([
      r.id,
      r.timestamp,
      r.templateName,
      r.category,
      r.format,
      JSON.stringify(r.values)
    ]);
  });

  return rows.map((row) => row.map(escapeCsv).join(';')).join('\r\n');
}

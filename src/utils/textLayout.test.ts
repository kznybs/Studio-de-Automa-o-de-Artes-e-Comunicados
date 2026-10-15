import test from 'node:test';
import assert from 'node:assert/strict';
import {
  wrapParagraphLines,
  calculateTextBoxHeight,
  isPointInBox,
  slugify,
  generateHistoryCsv
} from './textLayout.ts';

test('slugify sanitizes Portuguese accents and spaces', () => {
  assert.equal(slugify('Fique por Dentro — Segurança da Informação'), 'fique-por-dentro-seguranca-da-informacao');
  assert.equal(slugify('Manutenção Programada 2026!'), 'manutencao-programada-2026');
  assert.equal(slugify(''), 'comunicado');
});

test('calculateTextBoxHeight computes expected bounding heights', () => {
  assert.equal(calculateTextBoxHeight(1, 20, 1.25), 25);
  assert.equal(calculateTextBoxHeight(4, 16, 1.5), 96);
  assert.equal(calculateTextBoxHeight(0, 18, 1.25), 23); // at least 1 line
});

test('isPointInBox handles hit-testing with padding', () => {
  const box = { x: 100, y: 100, w: 200, h: 50 };
  assert.equal(isPointInBox(150, 120, box, 6), true);
  assert.equal(isPointInBox(95, 100, box, 6), true); // within 6px left padding
  assert.equal(isPointInBox(80, 100, box, 6), false); // outside left
  assert.equal(isPointInBox(310, 120, box, 6), false); // outside right
  assert.equal(isPointInBox(150, 160, box, 6), false); // outside bottom
});

test('wrapParagraphLines wraps words when exceeding maxWidth', () => {
  // Mock measure function: 1 char = 10px
  const mockMeasure = (str: string) => str.length * 10;
  const text = 'Esta é uma frase de teste longa para o comunicado';
  const lines = wrapParagraphLines(text, 150, mockMeasure);

  assert.ok(lines.length > 1);
  lines.forEach((line) => {
    const lineText = line.words.join(' ');
    assert.ok(mockMeasure(lineText) <= 150 || line.words.length === 1);
  });
});

test('wrapParagraphLines preserves explicit newlines in paragraphs', () => {
  const mockMeasure = (str: string) => str.length * 10;
  const text = 'Linha 1\nLinha 2\nLinha 3';
  const lines = wrapParagraphLines(text, 500, mockMeasure);

  assert.equal(lines.length, 3);
  assert.deepEqual(lines[0].words, ['Linha', '1']);
  assert.deepEqual(lines[1].words, ['Linha', '2']);
  assert.deepEqual(lines[2].words, ['Linha', '3']);
});

test('generateHistoryCsv creates valid CSV format with semicolon delimiter', () => {
  const sampleRecords = [
    {
      id: 'h1',
      timestamp: '14/10/2026 10:00:00',
      templateName: 'Fique por Dentro',
      category: 'Informativos diversos',
      format: 'PNG',
      values: { 'Total': '19.310.850' }
    }
  ];

  const csv = generateHistoryCsv(sampleRecords);
  assert.ok(csv.includes('ID Registro;Data e Hora;Modelo Utilizado'));
  assert.ok(csv.includes('h1;14/10/2026 10:00:00;Fique por Dentro;Informativos diversos;PNG'));
});

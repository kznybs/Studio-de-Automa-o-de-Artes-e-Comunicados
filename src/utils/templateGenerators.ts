import { ArtTemplate } from '../types';

export function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | { tl: number; tr: number; br: number; bl: number }
) {
  const r =
    typeof radii === 'number'
      ? { tl: radii, tr: radii, br: radii, bl: radii }
      : {
          tl: radii.tl || 0,
          tr: radii.tr || 0,
          br: radii.br || 0,
          bl: radii.bl || 0
        };
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}

export function createBarralcoolBackgroundDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = 680;
  c.height = 982;
  const ctx = c.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 680, 982);

  // Top green framing
  ctx.fillStyle = '#338a4b';
  ctx.fillRect(0, 0, 680, 25);
  ctx.fillRect(0, 0, 27, 238);
  ctx.fillRect(653, 0, 27, 238);

  // Traces in top right
  ctx.save();
  ctx.strokeStyle = '#e7ece9';
  ctx.lineWidth = 1.6;
  const traces = [
    [[422, 30], [422, 85], [447, 110], [447, 164]],
    [[440, 30], [440, 68], [470, 98], [470, 144]],
    [[464, 30], [464, 54], [507, 97], [547, 97]],
    [[492, 30], [492, 70], [537, 115], [537, 184]],
    [[520, 30], [520, 60], [567, 107], [567, 204]],
    [[544, 30], [544, 50], [597, 103], [597, 218]],
    [[570, 30], [570, 65], [617, 112], [617, 194]]
  ];
  traces.forEach((pts) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(last[0], last[1], 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();

  // Top right badge
  ctx.save();
  roundedRectPath(ctx, 589, 16, 74, 74, { tl: 22, tr: 3, br: 18, bl: 3 });
  ctx.fillStyle = '#235937';
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = '#338a4b';
  ctx.lineWidth = 2.8;
  for (let offset = 2; offset <= 72; offset += 9) {
    ctx.beginPath();
    ctx.moveTo(589 + offset, 92);
    ctx.lineTo(665, 16 + offset);
    ctx.stroke();
  }
  ctx.restore();

  // Yellow bar + Title "Fique por Dentro"
  ctx.fillStyle = '#f3be26';
  ctx.fillRect(58, 39, 17, 49);
  ctx.fillStyle = '#235937';
  ctx.font = '700 45px "Ubuntu", "Montserrat", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Fique por Dentro', 86, 63.5);

  // Security Shield
  ctx.save();
  ctx.translate(53, 107);
  ctx.beginPath();
  ctx.arc(49, 53, 41, 0, Math.PI * 2);
  ctx.strokeStyle = '#1e5936';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(49, 53, 35, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 5.5;
  ctx.strokeStyle = '#189444';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(49, 25);
  ctx.bezierCurveTo(39, 25, 27, 29.5, 27, 29.5);
  ctx.lineTo(27, 51.5);
  ctx.bezierCurveTo(27, 67, 49, 77.5, 49, 77.5);
  ctx.bezierCurveTo(49, 77.5, 71, 67, 71, 51.5);
  ctx.lineTo(71, 29.5);
  ctx.bezierCurveTo(71, 29.5, 59, 25, 49, 25);
  ctx.closePath();
  ctx.fillStyle = '#109643';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(42.5, 47);
  ctx.lineTo(42.5, 40.5);
  ctx.arc(49, 40.5, 6.5, Math.PI, 0, false);
  ctx.lineTo(55.5, 47);
  ctx.strokeStyle = '#53491a';
  ctx.lineWidth = 3.2;
  ctx.stroke();

  roundedRectPath(ctx, 38.5, 46, 21, 17.5, 2.5);
  ctx.fillStyle = '#f3be26';
  ctx.fill();
  ctx.restore();

  // Period label container
  roundedRectPath(ctx, 171, 189, 311, 33, { tl: 0, tr: 0, br: 21, bl: 11 });
  ctx.fillStyle = '#2b663e';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 14.5px "Carlito", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Período:', 186, 209.5);

  roundedRectPath(ctx, 171, 107, 338, 90, { tl: 20, tr: 20, br: 20, bl: 14 });
  ctx.fillStyle = '#f3be26';
  ctx.fill();
  ctx.fillStyle = '#235937';
  ctx.font = '700 23.5px "Ubuntu", sans-serif';
  ctx.fillText('FORAM BLOQUEADAS', 191, 157);
  ctx.font = '400 20px "Carlito", sans-serif';
  ctx.fillText('em nossa rede.', 191, 181);

  // Main rounded card
  const cardX = 28, cardY = 342, cardW = 622, cardH = 540;
  const cardRadii = { tl: 18, tr: 66, br: 26, bl: 16 };
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, cardRadii);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.fillStyle = '#275f3b';
  ctx.font = '700 23.5px "Ubuntu", sans-serif';
  ctx.fillText('Saiba mais detalhes sobre os bloqueios:', 42, 373);

  // 5 Category rows
  const fixedTabs = [
    'Filtro de URL:',
    'Phishing:',
    'Sites Maliciosos:',
    'URLs Spam:',
    'Proxy Avoidance:'
  ];
  const startRowY = 404;
  const rowGap = 67;

  fixedTabs.forEach((titleText, idx) => {
    const ry = startRowY + idx * rowGap;
    roundedRectPath(ctx, 43, ry, 113, 50, { tl: 6, tr: 0, br: 3, bl: 6 });
    ctx.fillStyle = '#378f4e';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px "Carlito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bloqueios', 43 + 56.5, ry + 38.5);

    ctx.textAlign = 'left';
    ctx.font = '700 16px "Carlito", sans-serif';
    const tabW = ctx.measureText(titleText).width + 26;
    roundedRectPath(ctx, 156, ry, tabW, 26, { tl: 0, tr: 13, br: 0, bl: 0 });
    ctx.fillStyle = '#29623d';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleText, 170, ry + 13.5);
  });

  // Risk bar
  ctx.save();
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, cardRadii);
  ctx.clip();
  ctx.fillStyle = '#178241';
  ctx.fillRect(cardX, 786, cardW, 98);
  ctx.restore();

  roundedRectPath(ctx, cardX, cardY, cardW, cardH, cardRadii);
  ctx.strokeStyle = '#178241';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  roundedRectPath(ctx, cardX - 1.25, 755, 272, 31, { tl: 6, tr: 10, br: 0, bl: 0 });
  ctx.fillStyle = '#f3be26';
  ctx.fill();
  ctx.fillStyle = '#235937';
  ctx.font = '700 18px "Ubuntu", sans-serif';
  ctx.fillText('CLASSIFICAÇÃO DE RISCO:', 38, 770.5);

  // Barralcool Footer
  ctx.save();
  ctx.translate(36, 902);
  ctx.fillStyle = '#3a6b48';
  ctx.fillRect(6, 3, 3.8, 42);
  ctx.fillRect(12.2, 3, 3.8, 42);
  ctx.fillStyle = '#2c5939';
  ctx.fillRect(18.4, 3, 4.2, 42);
  ctx.beginPath();
  ctx.moveTo(22.5, 23.5);
  ctx.lineTo(27.5, 23.5);
  ctx.bezierCurveTo(34.5, 23.5, 39, 27.2, 39, 34.2);
  ctx.bezierCurveTo(39, 41.2, 34.5, 45, 27.5, 45);
  ctx.lineTo(6, 45);
  ctx.lineTo(6, 42.2);
  ctx.lineTo(22.5, 42.2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a6144';
  ctx.font = 'italic 11.5px Georgia, serif';
  ctx.fillText('Grupo', 45, 16);
  ctx.fillStyle = '#2c5939';
  ctx.font = 'bold 25.5px Georgia, serif';
  ctx.fillText('arralcool', 41, 38);
  ctx.fillStyle = '#438d57';
  ctx.fillRect(2, 48.5, 171, 2.8);
  ctx.fillStyle = '#667069';
  ctx.font = 'italic 11.4px "Carlito", sans-serif';
  ctx.fillText('Qualidade, esta é a nossa marca', 2, 60);
  ctx.restore();

  ctx.fillStyle = '#2c5e3d';
  ctx.fillRect(258, 909, 65, 6.5);
  ctx.fillStyle = '#378f4e';
  ctx.fillRect(323, 909, 65, 6.5);
  ctx.fillStyle = '#f3be26';
  ctx.fillRect(388, 909, 64, 6.5);

  ctx.fillStyle = '#2c5e3d';
  ctx.font = '600 14px "Carlito", sans-serif';
  ctx.fillText('@grupobarralcool', 325, 946);
  ctx.fillText('www.grupobarralcool.com.br', 471, 946);

  return c.toDataURL('image/png');
}

export function createMaintenanceBackgroundDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 1000;
  const ctx = c.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 800, 1000);

  // Dark header
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 800, 210);

  // Amber warning stripe
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 210, 800, 14);

  // Top badge
  roundedRectPath(ctx, 50, 38, 220, 34, 8);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 14px "Montserrat", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('COMUNICADO INTERNO', 68, 55);

  // Central Card
  roundedRectPath(ctx, 50, 265, 700, 620, 20);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // 3 Boxes: Data, Horário, Setor
  const boxesY = 295;
  const labels = ['DATA PROGRAMADA', 'HORÁRIO PREVISTO', 'SETOR / ÁREA AFETADA'];
  labels.forEach((lb, i) => {
    const bx = 80 + i * 218;
    roundedRectPath(ctx, bx, boxesY, 204, 92, 12);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = '700 11px "Inter", sans-serif';
    ctx.fillText(lb, bx + 16, boxesY + 24);
  });

  // Details label
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 16px "Montserrat", sans-serif';
  ctx.fillText('DETALHES E ORIENTAÇÕES IMPORTANTES:', 80, 435);

  roundedRectPath(ctx, 80, 458, 640, 290, 14);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Footer inside card
  roundedRectPath(ctx, 80, 775, 640, 78, 12);
  ctx.fillStyle = '#ecfdf5';
  ctx.fill();
  ctx.fillStyle = '#065f46';
  ctx.font = '700 12px "Inter", sans-serif';
  ctx.fillText('RESPONSÁVEL / CONTATO PARA DÚVIDAS:', 100, 800);

  // Bottom footer
  ctx.fillStyle = '#64748b';
  ctx.font = '600 13px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Comunicação Interna Corporativa • Documento Gerado Automaticamente', 400, 945);

  return c.toDataURL('image/png');
}

export function createEventBackgroundDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 1000;
  const ctx = c.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 800, 1000);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 1000);

  // Border frame
  roundedRectPath(ctx, 48, 48, 704, 904, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.stroke();

  roundedRectPath(ctx, 90, 95, 210, 36, 999);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.fillStyle = '#022c22';
  ctx.font = '800 13px "Montserrat", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('CONVITE & TREINAMENTO', 110, 113);

  // White Card
  roundedRectPath(ctx, 90, 330, 620, 520, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.fillStyle = '#047857';
  ctx.font = '800 13px "Montserrat", sans-serif';
  ctx.fillText('SOBRE O EVENTO:', 125, 375);

  // Date/Time & Location boxes
  roundedRectPath(ctx, 125, 555, 265, 110, 14);
  ctx.fillStyle = '#f0fdf4';
  ctx.fill();
  ctx.fillStyle = '#15803d';
  ctx.font = '800 12px "Montserrat", sans-serif';
  ctx.fillText('DATA E HORÁRIO', 145, 582);

  roundedRectPath(ctx, 415, 555, 260, 110, 14);
  ctx.fillStyle = '#f0fdf4';
  ctx.fill();
  ctx.fillStyle = '#15803d';
  ctx.fillText('LOCAL / SALA', 435, 582);

  roundedRectPath(ctx, 125, 690, 550, 115, 14);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.fillStyle = '#334155';
  ctx.fillText('PALESTRANTE / INSTRUTOR E PÚBLICO-ALVO', 145, 718);

  return c.toDataURL('image/png');
}

export function createInitialTemplates(): ArtTemplate[] {
  return [
    {
      id: 'tpl-barralcool-fique-por-dentro',
      name: 'Fique por Dentro — Segurança da Informação',
      category: 'Informativos diversos',
      width: 680,
      height: 982,
      backgroundDataUrl: createBarralcoolBackgroundDataUrl(),
      fields: [
        {
          id: 'f-total',
          label: 'Total de Ameaças (Destaque Amarelo)',
          type: 'text',
          value: '19. 310.850 AMEAÇAS',
          x: 191,
          y: 118,
          width: 305,
          fontFamily: 'Ubuntu',
          fontSize: 24,
          fontWeight: '700',
          color: '#235937',
          align: 'left',
          lineHeight: 1.15,
          uppercase: true,
          bgEnabled: false,
          bgColor: '#f3be26',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'f-periodo',
          label: 'Período do Relatório',
          type: 'text',
          value: '01 a 30 de setembro de 2026',
          x: 268,
          y: 201,
          width: 205,
          fontFamily: 'Carlito',
          fontSize: 15,
          fontWeight: '700',
          color: '#ffffff',
          align: 'left',
          lineHeight: 1.1,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#2b663e',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'f-intro',
          label: 'Parágrafo Introdutório',
          type: 'textarea',
          value:
            'À medida que garantimos maior proteção contra ameaças cibernéticas, reforçamos a importância de mantermos atenção redobrada ao navegar na internet. Evitem clicar em links ou anexos suspeitos.',
          x: 40,
          y: 248,
          width: 600,
          fontFamily: 'Carlito',
          fontSize: 18,
          fontWeight: '400',
          color: '#232b25',
          align: 'justify',
          lineHeight: 1.35,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#ffffff',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'f-cat1-count',
          label: '1. Filtro de URL (Quantidade)',
          type: 'text',
          value: '18.864.720',
          x: 46,
          y: 410,
          width: 106,
          fontFamily: 'Carlito',
          fontSize: 20,
          fontWeight: '700',
          color: '#ffffff',
          align: 'center',
          lineHeight: 1.1,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#378f4e',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat1-desc',
          label: '1. Filtro de URL (Descrição)',
          type: 'text',
          value: 'Impedindo acessos a sites não autorizados conforme regras definidas;',
          x: 282,
          y: 408,
          width: 350,
          fontFamily: 'Carlito',
          fontSize: 16,
          fontWeight: '400',
          color: '#1b221d',
          align: 'left',
          lineHeight: 1.35,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#ffffff',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat2-count',
          label: '2. Phishing (Quantidade)',
          type: 'text',
          value: '1.740',
          x: 46,
          y: 477,
          width: 106,
          fontFamily: 'Carlito',
          fontSize: 20,
          fontWeight: '700',
          color: '#ffffff',
          align: 'center',
          lineHeight: 1.1,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#378f4e',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat2-desc',
          label: '2. Phishing (Descrição)',
          type: 'text',
          value: 'Evitando o acesso a sites fraudulentos que tentam roubar informações pessoais;',
          x: 256,
          y: 475,
          width: 375,
          fontFamily: 'Carlito',
          fontSize: 16,
          fontWeight: '400',
          color: '#1b221d',
          align: 'left',
          lineHeight: 1.35,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#ffffff',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat3-count',
          label: '3. Sites Maliciosos (Quantidade)',
          type: 'text',
          value: '444.330',
          x: 46,
          y: 544,
          width: 106,
          fontFamily: 'Carlito',
          fontSize: 20,
          fontWeight: '700',
          color: '#ffffff',
          align: 'center',
          lineHeight: 1.1,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#378f4e',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat3-desc',
          label: '3. Sites Maliciosos (Descrição)',
          type: 'text',
          value: 'Protegendo contra páginas que distribuem malware, vírus e outros conteúdos perigosos;',
          x: 304,
          y: 542,
          width: 328,
          fontFamily: 'Carlito',
          fontSize: 16,
          fontWeight: '400',
          color: '#1b221d',
          align: 'left',
          lineHeight: 1.35,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#ffffff',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat4-count',
          label: '4. URLs Spam (Quantidade)',
          type: 'text',
          value: '60',
          x: 46,
          y: 611,
          width: 106,
          fontFamily: 'Carlito',
          fontSize: 20,
          fontWeight: '700',
          color: '#ffffff',
          align: 'center',
          lineHeight: 1.1,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#378f4e',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat4-desc',
          label: '4. URLs Spam (Descrição)',
          type: 'text',
          value: 'Bloqueia links usados em mensagens de spam que direcionam para conteúdo indesejado ou fraudulento.',
          x: 274,
          y: 609,
          width: 358,
          fontFamily: 'Carlito',
          fontSize: 16,
          fontWeight: '400',
          color: '#1b221d',
          align: 'left',
          lineHeight: 1.35,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#ffffff',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat5-count',
          label: '5. Proxy Avoidance (Quantidade)',
          type: 'text',
          value: '-',
          x: 46,
          y: 678,
          width: 106,
          fontFamily: 'Carlito',
          fontSize: 20,
          fontWeight: '700',
          color: '#ffffff',
          align: 'center',
          lineHeight: 1.1,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#378f4e',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-cat5-desc',
          label: '5. Proxy Avoidance (Descrição)',
          type: 'text',
          value: 'Impede o acesso a sites que distribuem malware, vírus, spyware ou outros conteúdos perigosos.',
          x: 306,
          y: 676,
          width: 326,
          fontFamily: 'Carlito',
          fontSize: 16,
          fontWeight: '400',
          color: '#1b221d',
          align: 'left',
          lineHeight: 1.35,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#ffffff',
          bgPadding: 2,
          bgRadius: 2
        },
        {
          id: 'f-risk',
          label: 'Classificação de Risco (Rodapé Verde)',
          type: 'text',
          value: 'Severidade Alta: 100,00% dos bloqueios.',
          x: 55,
          y: 803,
          width: 540,
          fontFamily: 'Carlito',
          fontSize: 19,
          fontWeight: '700',
          color: '#ffffff',
          align: 'left',
          lineHeight: 1.2,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#178241',
          bgPadding: 4,
          bgRadius: 4
        }
      ]
    },
    {
      id: 'tpl-manutencao-programada',
      name: 'Comunicado de Manutenção Programada',
      category: 'Avisos operacionais',
      width: 800,
      height: 1000,
      backgroundDataUrl: createMaintenanceBackgroundDataUrl(),
      fields: [
        {
          id: 'm-titulo',
          label: 'Título do Comunicado',
          type: 'text',
          value: 'MANUTENÇÃO PREVENTIVA NA REDE ELÉTRICA E SERVIDORES',
          x: 50,
          y: 92,
          width: 700,
          fontFamily: 'Montserrat',
          fontSize: 28,
          fontWeight: '800',
          color: '#ffffff',
          align: 'left',
          lineHeight: 1.25,
          uppercase: true,
          bgEnabled: false,
          bgColor: '#0f172a',
          bgPadding: 6,
          bgRadius: 6
        },
        {
          id: 'm-data',
          label: 'Data da Manutenção',
          type: 'text',
          value: '18/10/2026 (Domingo)',
          x: 96,
          y: 338,
          width: 175,
          fontFamily: 'Montserrat',
          fontSize: 17,
          fontWeight: '700',
          color: '#0f172a',
          align: 'left',
          lineHeight: 1.2,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#f1f5f9',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'm-horario',
          label: 'Horário Previsto',
          type: 'text',
          value: '08h00 às 12h30',
          x: 314,
          y: 338,
          width: 175,
          fontFamily: 'Montserrat',
          fontSize: 17,
          fontWeight: '700',
          color: '#0f172a',
          align: 'left',
          lineHeight: 1.2,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#f1f5f9',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'm-setor',
          label: 'Setor ou Sistema Afetado',
          type: 'text',
          value: 'ERP, E-mail e Wi-Fi Corporativo',
          x: 532,
          y: 338,
          width: 175,
          fontFamily: 'Montserrat',
          fontSize: 15,
          fontWeight: '700',
          color: '#b45309',
          align: 'left',
          lineHeight: 1.2,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#f1f5f9',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'm-detalhes',
          label: 'Texto de Orientações do Comunicado',
          type: 'textarea',
          value:
            'Informamos a todos os colaboradores que realizaremos uma parada programada para atualização de segurança dos servidores principais.\n\nDurante este período, os sistemas internos e pastas de rede ficarão temporariamente indisponíveis. Recomendamos salvar todos os documentos antes do início da janela de manutenção.',
          x: 102,
          y: 482,
          width: 595,
          fontFamily: 'Open Sans',
          fontSize: 18,
          fontWeight: '400',
          color: '#1e293b',
          align: 'justify',
          lineHeight: 1.45,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#f8fafc',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'm-responsavel',
          label: 'Responsável / Ramal de Contato',
          type: 'text',
          value: 'Equipe de Infraestrutura de TI • Ramal 2045 / suporte@empresa.com.br',
          x: 100,
          y: 815,
          width: 600,
          fontFamily: 'Montserrat',
          fontSize: 15,
          fontWeight: '700',
          color: '#064e3b',
          align: 'left',
          lineHeight: 1.2,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#ecfdf5',
          bgPadding: 4,
          bgRadius: 4
        }
      ]
    },
    {
      id: 'tpl-convite-evento',
      name: 'Convite de Evento e Treinamento Interno',
      category: 'Eventos',
      width: 800,
      height: 1000,
      backgroundDataUrl: createEventBackgroundDataUrl(),
      fields: [
        {
          id: 'e-nome',
          label: 'Nome do Evento / Treinamento',
          type: 'textarea',
          value: 'WORKSHOP DE BOAS PRÁTICAS EM SEGURANÇA OPERACIONAL E INOVAÇÃO',
          x: 90,
          y: 160,
          width: 620,
          fontFamily: 'Montserrat',
          fontSize: 32,
          fontWeight: '800',
          color: '#ffffff',
          align: 'left',
          lineHeight: 1.25,
          uppercase: true,
          bgEnabled: false,
          bgColor: '#064e3b',
          bgPadding: 6,
          bgRadius: 6
        },
        {
          id: 'e-descricao',
          label: 'Resumo do Evento',
          type: 'textarea',
          value:
            'Convidamos todos os líderes e equipes operacionais para o encontro mensal de alinhamento estratégico, prevenção de incidentes e apresentação dos resultados do trimestre.',
          x: 125,
          y: 400,
          width: 550,
          fontFamily: 'Open Sans',
          fontSize: 18,
          fontWeight: '400',
          color: '#334155',
          align: 'left',
          lineHeight: 1.45,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#ffffff',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'e-data-hora',
          label: 'Data e Horário',
          type: 'text',
          value: '25 de Outubro • 14h00',
          x: 145,
          y: 608,
          width: 225,
          fontFamily: 'Montserrat',
          fontSize: 18,
          fontWeight: '700',
          color: '#064e3b',
          align: 'left',
          lineHeight: 1.2,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#f0fdf4',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'e-local',
          label: 'Local / Sala / Link',
          type: 'text',
          value: 'Auditório Principal - Bloco A',
          x: 435,
          y: 608,
          width: 225,
          fontFamily: 'Montserrat',
          fontSize: 17,
          fontWeight: '700',
          color: '#064e3b',
          align: 'left',
          lineHeight: 1.2,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#f0fdf4',
          bgPadding: 4,
          bgRadius: 4
        },
        {
          id: 'e-instrutor',
          label: 'Instrutor e Público-Alvo',
          type: 'text',
          value: 'Condução: Eng. Marcos Rocha (SSMA) • Público: Coordenadores e Supervisores',
          x: 145,
          y: 745,
          width: 510,
          fontFamily: 'Open Sans',
          fontSize: 15,
          fontWeight: '700',
          color: '#0f172a',
          align: 'left',
          lineHeight: 1.3,
          uppercase: false,
          bgEnabled: false,
          bgColor: '#f8fafc',
          bgPadding: 4,
          bgRadius: 4
        }
      ]
    }
  ];
}

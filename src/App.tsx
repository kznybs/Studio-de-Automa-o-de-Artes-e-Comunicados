import React, { useState } from 'react';
import { ArtTemplate, HistoryRecord, SectorRequest, StageKey } from './types';
import { createInitialTemplates } from './utils/templateGenerators';
import { slugify, generateHistoryCsv } from './utils/textLayout';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { StudioView } from './components/stage1/StudioView';
import { LibraryView } from './components/stage2/LibraryView';
import { HistoryView } from './components/stage3/HistoryView';
import { RequestsView } from './components/stage4/RequestsView';
import { AutomationsView } from './components/stage5/AutomationsView';

export default function App() {
  const [templates, setTemplates] = useState<ArtTemplate[]>(() => createInitialTemplates());
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    'tpl-barralcool-fique-por-dentro'
  );
  const [activeStage, setActiveStage] = useState<StageKey>('stage-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [webhookEnabled, setWebhookEnabled] = useState<boolean>(false);

  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([
    {
      id: 'hist-demo-1',
      timestamp: '14/10/2026 09:15:00',
      templateId: 'tpl-barralcool-fique-por-dentro',
      templateName: 'Fique por Dentro — Segurança da Informação',
      category: 'Informativos diversos',
      format: 'PNG',
      values: {
        'Total de Ameaças (Destaque Amarelo)': '19. 310.850 AMEAÇAS',
        'Período do Relatório': '01 a 30 de setembro de 2026',
        '1. Filtro de URL (Quantidade)': '18.864.720',
        '2. Phishing (Quantidade)': '1.740',
        '3. Sites Maliciosos (Quantidade)': '444.330'
      }
    }
  ]);

  const [sectorRequests, setSectorRequests] = useState<SectorRequest[]>([
    {
      id: 'req-101',
      createdAt: '14/10/2026 08:40',
      department: 'Segurança da Informação (TI)',
      requester: 'Rodrigo Almeida',
      templateId: 'tpl-barralcool-fique-por-dentro',
      templateName: 'Fique por Dentro — Segurança da Informação',
      status: 'Pendente',
      fieldValues: {
        'f-total': '21. 450.900 AMEAÇAS',
        'f-periodo': '01 a 31 de outubro de 2026',
        'f-cat1-count': '20.910.000',
        'f-cat2-count': '2.150',
        'f-cat3-count': '538.630',
        'f-cat4-count': '120',
        'f-cat5-count': '-',
        'f-risk': 'Severidade Alta: 100,00% dos bloqueios.'
      }
    },
    {
      id: 'req-102',
      createdAt: '14/10/2026 10:05',
      department: 'Manutenção Industrial',
      requester: 'Eng. Fernanda Costa',
      templateId: 'tpl-manutencao-programada',
      templateName: 'Comunicado de Manutenção Programada',
      status: 'Pendente',
      fieldValues: {
        'm-titulo': 'MANUTENÇÃO PROGRAMADA NO SISTEMA DE PESAGEM BALANÇA 02',
        'm-data': '22/10/2026 (Quinta)',
        'm-horario': '13h00 às 16h00',
        'm-setor': 'Pátio e Recebimento Agrícola',
        'm-detalhes':
          'Informamos que a Balança Rodoviária 02 passará por aferição e calibração preventiva. Todo o fluxo de veículos será direcionado para as Balanças 01 e 03.',
        'm-responsavel': 'Coordenação de Manutenção • Ramal 3110'
      }
    },
    {
      id: 'req-103',
      createdAt: '14/10/2026 11:20',
      department: 'Recursos Humanos (DHO)',
      requester: 'Juliana Mendes',
      templateId: 'tpl-convite-evento',
      templateName: 'Convite de Evento e Treinamento Interno',
      status: 'Pendente',
      fieldValues: {
        'e-nome': 'INTEGRAÇÃO E TREINAMENTO DE LIDERANÇA POSITIVA 2026',
        'e-descricao':
          'Participe do nosso encontro especial voltado ao desenvolvimento de líderes, comunicação assertiva e gestão de equipes de alta performance.',
        'e-data-hora': '30 de Outubro • 08h30',
        'e-local': 'Sala de Treinamento RH - Sala 02',
        'e-instrutor': 'Condução: Psicóloga Camila Vieira (DHO) • Público: Gestores e Líderes'
      }
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0];

  const handleUpdateTemplate = (updated: ArtTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleSelectTemplate = (templateId: string, _subTab?: 'fill' | 'configure') => {
    setActiveTemplateId(templateId);
    setActiveStage('stage-1');
  };

  const handleCreateNewWithImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const baseName = (file.name || 'Novo Modelo').replace(/\.[^/.]+$/, '');
        const newTpl: ArtTemplate = {
          id: 'tpl-' + Date.now(),
          name: baseName,
          category: 'Comunicados internos',
          width: w,
          height: h,
          backgroundDataUrl: dataUrl,
          fields: [
            {
              id: 'f-' + Date.now(),
              label: 'Título / Destaque Principal',
              type: 'text',
              value: 'DIGITE O TEXTO AQUI',
              x: Math.round(w * 0.12),
              y: Math.round(h * 0.18),
              width: Math.round(w * 0.76),
              fontFamily: 'Montserrat',
              fontSize: Math.max(20, Math.round(w * 0.035)),
              fontWeight: '800',
              color: '#0f172a',
              align: 'center',
              lineHeight: 1.25,
              uppercase: false,
              bgEnabled: true,
              bgColor: '#facc15',
              bgPadding: 10,
              bgRadius: 10
            }
          ]
        };
        setTemplates((prev) => [...prev, newTpl]);
        setActiveTemplateId(newTpl.id);
        setActiveStage('stage-1');
        showToast(`Novo modelo "${baseName}" criado com sua imagem (${w} × ${h} px)!`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleExportArt = (format: 'png' | 'jpg', canvas: HTMLCanvasElement) => {
    if (!activeTemplate) return;

    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpg' ? 'jpg' : 'png';
    const dataUrl = canvas.toDataURL(mime, 0.95);

    // Download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${slugify(activeTemplate.name)}-${Date.now().toString().slice(-5)}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Create history record
    const valuesMap: Record<string, string> = {};
    activeTemplate.fields.forEach((f) => {
      valuesMap[f.label] = f.value;
    });

    const newRecord: HistoryRecord = {
      id: 'hist-' + Date.now(),
      timestamp: new Date().toLocaleString('pt-BR'),
      templateId: activeTemplate.id,
      templateName: activeTemplate.name,
      category: activeTemplate.category,
      format: ext.toUpperCase() as 'PNG' | 'JPG',
      values: valuesMap
    };

    setHistoryRecords((prev) => [newRecord, ...prev]);

    // Dispatch webhook if enabled
    if (webhookEnabled && webhookUrl.trim()) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
        mode: 'no-cors'
      }).catch(() => {});
    }

    showToast(`Arte exportada em ${ext.toUpperCase()} e salva no Histórico (Etapa 3)!`);
  };

  const handleDuplicateTemplate = (tpl: ArtTemplate) => {
    const copy: ArtTemplate = {
      ...JSON.parse(JSON.stringify(tpl)),
      id: 'tpl-' + Date.now(),
      name: tpl.name + ' (Cópia)'
    };
    setTemplates((prev) => [...prev, copy]);
    showToast(`Cópia criada: "${copy.name}".`);
  };

  const handleDeleteTemplate = (id: string) => {
    if (templates.length <= 1) {
      showToast('Mantenha pelo menos um modelo cadastrado na biblioteca.');
      return;
    }
    const remaining = templates.filter((t) => t.id !== id);
    setTemplates(remaining);
    if (activeTemplateId === id) {
      setActiveTemplateId(remaining[0].id);
    }
    showToast('Modelo removido da biblioteca.');
  };

  const handleDownloadTemplateJson = (tpl: ArtTemplate) => {
    const jsonStr = JSON.stringify(tpl, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo-${slugify(tpl.name)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Configuração do modelo "${tpl.name}" salva em .JSON!`);
  };

  const handleImportTemplateJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result));
        if (!parsed.name || !Array.isArray(parsed.fields)) {
          showToast('Arquivo JSON inválido: modelo sem estrutura de campos.');
          return;
        }
        parsed.id = 'tpl-' + Date.now();
        setTemplates((prev) => [...prev, parsed]);
        setActiveTemplateId(parsed.id);
        setActiveStage('stage-1');
        showToast(`Modelo "${parsed.name}" importado com sucesso!`);
      } catch (err) {
        showToast('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleReopenRecord = (record: HistoryRecord) => {
    const tpl = templates.find((t) => t.id === record.templateId);
    if (!tpl) {
      showToast('O modelo original deste registro não está mais na biblioteca.');
      return;
    }
    const updatedFields = tpl.fields.map((f) => {
      if (record.values[f.label] !== undefined) {
        return { ...f, value: record.values[f.label] };
      }
      return f;
    });
    handleUpdateTemplate({ ...tpl, fields: updatedFields });
    setActiveTemplateId(tpl.id);
    setActiveStage('stage-1');
    showToast('Dados do histórico recarregados no Estúdio!');
  };

  const handleLoadRequestIntoStudio = (req: SectorRequest) => {
    const tpl = templates.find((t) => t.id === req.templateId);
    if (!tpl) {
      showToast('Modelo solicitado não encontrado.');
      return;
    }
    const updatedFields = tpl.fields.map((f) => {
      if (req.fieldValues[f.id] !== undefined) {
        return { ...f, value: req.fieldValues[f.id] };
      }
      return f;
    });
    handleUpdateTemplate({ ...tpl, fields: updatedFields });

    // Mark as concluded
    setSectorRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'Concluído' } : r))
    );

    setActiveTemplateId(tpl.id);
    setActiveStage('stage-1');
    showToast(`Solicitação de "${req.department}" carregada! Revise a arte e exporte.`);
  };

  const handleSubmitNewRequest = (
    reqData: Omit<SectorRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const newReq: SectorRequest = {
      ...reqData,
      id: 'req-' + Date.now(),
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pendente'
    };
    setSectorRequests((prev) => [newReq, ...prev]);
    showToast(`Nova solicitação de "${newReq.department}" adicionada à fila!`);
  };

  const handleExportCsv = () => {
    if (historyRecords.length === 0) return;
    const csvContent = generateHistoryCsv(historyRecords);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historico-comunicados-gerados.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Planilha CSV do Histórico exportada com sucesso!');
  };

  const handleClearHistory = () => {
    setHistoryRecords([]);
    showToast('Histórico da sessão limpo.');
  };

  const pendingRequestsCount = sectorRequests.filter((r) => r.status === 'Pendente').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header
        activeStage={activeStage}
        onSelectStage={(st) => setActiveStage(st)}
        templatesCount={templates.length}
        historyCount={historyRecords.length}
        pendingRequestsCount={pendingRequestsCount}
      />

      <main className="flex-1 flex flex-col">
        {activeStage === 'stage-1' && (
          <StudioView
            template={activeTemplate}
            templates={templates}
            onSelectTemplate={(id) => setActiveTemplateId(id)}
            onUpdateTemplate={handleUpdateTemplate}
            onCreateNewWithImage={handleCreateNewWithImage}
            onExportArt={handleExportArt}
            onDownloadTemplateJson={handleDownloadTemplateJson}
            onImportTemplateJson={handleImportTemplateJson}
            showToast={showToast}
          />
        )}

        {activeStage === 'stage-2' && (
          <LibraryView
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onDownloadTemplateJson={handleDownloadTemplateJson}
            onImportTemplateJson={handleImportTemplateJson}
            onCreateNewWithImage={handleCreateNewWithImage}
          />
        )}

        {activeStage === 'stage-3' && (
          <HistoryView
            records={historyRecords}
            onReopenRecord={handleReopenRecord}
            onExportCsv={handleExportCsv}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeStage === 'stage-4' && (
          <RequestsView
            requests={sectorRequests}
            templates={templates}
            onLoadRequestIntoStudio={handleLoadRequestIntoStudio}
            onSubmitNewRequest={handleSubmitNewRequest}
          />
        )}

        {activeStage === 'stage-5' && (
          <AutomationsView
            activeTemplate={activeTemplate}
            webhookUrl={webhookUrl}
            webhookEnabled={webhookEnabled}
            onUpdateWebhookSettings={(url, enabled) => {
              setWebhookUrl(url);
              setWebhookEnabled(enabled);
            }}
            showToast={showToast}
          />
        )}
      </main>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

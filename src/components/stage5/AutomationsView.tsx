import React, { useState } from 'react';
import { ArtTemplate } from '../../types';
import { Copy, Check, Send, ExternalLink, Zap } from 'lucide-react';

interface AutomationsViewProps {
  activeTemplate: ArtTemplate;
  webhookUrl: string;
  webhookEnabled: boolean;
  onUpdateWebhookSettings: (url: string, enabled: boolean) => void;
  showToast: (msg: string) => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  activeTemplate,
  webhookUrl,
  webhookEnabled,
  onUpdateWebhookSettings,
  showToast
}) => {
  const [localUrl, setLocalUrl] = useState<string>(webhookUrl);
  const [localEnabled, setLocalEnabled] = useState<boolean>(webhookEnabled);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate real sample payload based on the active template
  const samplePayload = {
    evento: 'COMUNICADO_EXPORTADO',
    timestamp: new Date().toISOString(),
    modeloId: activeTemplate.id,
    modeloNome: activeTemplate.name,
    categoria: activeTemplate.category,
    dimensoes: {
      largura: activeTemplate.width,
      altura: activeTemplate.height
    },
    camposPreenchidos: activeTemplate.fields.reduce<Record<string, string>>((acc, f) => {
      acc[f.label] = f.value;
      return acc;
    }, {})
  };

  const jsonString = JSON.stringify(samplePayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    showToast('Payload JSON copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWebhook = async () => {
    if (!localUrl.trim()) {
      setTestStatus('Informe uma URL de Webhook HTTP acima para testar.');
      showToast('Por favor, informe uma URL de Webhook HTTP.');
      return;
    }
    setTestStatus('Enviando requisição de teste para o endpoint...');
    try {
      await fetch(localUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString,
        mode: 'no-cors'
      });
      setTestStatus('Disparo efetuado com sucesso (verifique o histórico no Power Automate)!');
      showToast('Payload de teste enviado com sucesso!');
    } catch (err) {
      setTestStatus('Erro na conexão com o endpoint (verifique permissões de CORS).');
    }
  };

  const handleSaveSettings = (url: string, enabled: boolean) => {
    setLocalUrl(url);
    setLocalEnabled(enabled);
    onUpdateWebhookSettings(url, enabled);
  };

  return (
    <section className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna Esquerda: Conector */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            Upgrades • Etapa 5
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Conector Microsoft Lists, SharePoint & Power Automate
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure um Webhook HTTP do Power Automate para sincronizar automaticamente os dados e
            o status de cada comunicado gerado.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={localEnabled}
              onChange={(e) => handleSaveSettings(localUrl, e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500"
            />
            <span>Disparar Webhook automaticamente ao exportar qualquer arte</span>
          </label>

          <div>
            <label htmlFor="webhook-url-input" className="block text-xs font-semibold text-slate-300 mb-1">
              URL do Gatilho HTTP (Power Automate / Logic Apps / REST API)
            </label>
            <input
              id="webhook-url-input"
              type="url"
              value={localUrl}
              onChange={(e) => handleSaveSettings(e.target.value, localEnabled)}
              placeholder="https://prod-xx.brazilsouth.logic.azure.com:443/workflows/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestWebhook}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Testar Disparo de Payload Agora</span>
            </button>
            {testStatus && (
              <span className="text-xs font-semibold text-emerald-400">{testStatus}</span>
            )}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs text-slate-300">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Como conectar ao Microsoft Lists em 3 minutos:</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
            <li>
              No <strong>Power Automate</strong>, crie um fluxo da nuvem automatizado com o gatilho{' '}
              <em>"Quando uma solicitação HTTP é recebida"</em>.
            </li>
            <li>
              Clique em <em>"Usar o conteúdo de amostra para gerar o esquema"</em>, cole o{' '}
              <strong>Payload JSON</strong> gerado ao lado e confirme.
            </li>
            <li>
              Adicione a ação <strong>"Criar item (SharePoint / Microsoft Lists)"</strong> mapeando as
              colunas correspondentes da sua lista corporativa.
            </li>
          </ol>
        </div>
      </div>

      {/* Coluna Direita: Preview do JSON Payload */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Payload & Schema JSON do Modelo Ativo</h3>
            <p className="text-xs text-slate-400">
              Pronto para colar no Power Automate ou integrar via REST API.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
          </button>
        </div>

        <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[480px]">
          {jsonString}
        </pre>
      </div>
    </section>
  );
};

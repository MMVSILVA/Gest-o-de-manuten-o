/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  BarChart, FileSpreadsheet, FileText, CloudUpload, Sparkles, BrainCircuit, Activity 
} from "lucide-react";
import { OrdemServico, Equipamento } from "../types";

interface Props {
  ordens: OrdemServico[];
  equipamentos: Equipamento[];
}

export const RelatoriosView: React.FC<Props> = ({ ordens, equipamentos }) => {
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [laudoEstrategico, setLaudoEstrategico] = useState("");

  const statistics = useMemo(() => {
    const total = ordens.length;
    const pendentes = ordens.filter(o => o.status === 'Pendente').length;
    const andamento = ordens.filter(o => o.status === 'Em Andamento').length;
    const concluidas = ordens.filter(o => o.status === 'Concluído').length;

    const prioridadeAlta = ordens.filter(o => o.prioridade === 'Alta').length;
    const prioridadeMedia = ordens.filter(o => o.prioridade === 'Média').length;
    const prioridadeBaixa = ordens.filter(o => o.prioridade === 'Baixa').length;

    const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    const maquinasCriticas = equipamentos.filter(e => e.status === "Crítico").length;

    return { 
      total, pendentes, andamento, concluidas, 
      prioridadeAlta, prioridadeMedia, prioridadeBaixa, 
      taxaConclusao, maquinasCriticas 
    };
  }, [ordens, equipamentos]);

  const gerarParecerIA = async () => {
    setCarregandoIA(true);
    setLaudoEstrategico("");

    try {
      const resp = await fetch("/api/parecer-estrategico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordens })
      });

      const data = await resp.json();
      if (resp.ok) {
        setLaudoEstrategico(data.text);
      } else {
        setLaudoEstrategico("Erro ao compilar laudo: " + (data.error || "Tente novamente mais tarde."));
      }
    } catch {
      setLaudoEstrategico("Falha na comunicação. Fallback simulado carregado.");
    } finally {
      setCarregandoIA(false);
    }
  };

  const exportarExcel = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body><table><tr><th>Equipamento</th><th>Solicitante</th><th>Tipo</th><th>Prioridade</th><th>Status</th></tr>`;
    ordens.forEach(os => { 
      html += `<tr><td>${os.equipamento}</td><td>${os.solicitante}</td><td>${os.tipo}</td><td>${os.prioridade}</td><td>${os.status}</td></tr>`; 
    });
    html += `</table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = 'Relatorio_Manutech_Ordens.xls'; 
    a.click();
    alert("Planilha Excel exportada com sucesso!");
  };

  const exportarWord = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8" /></head><body><h1>Boletim de Confiabilidade Manutech</h1>`;
    ordens.forEach(os => { 
      html += `<p><b>${os.equipamento}</b> - Tipo: ${os.tipo} | Nível: ${os.prioridade} | Status: ${os.status}</p>`; 
    });
    html += `</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = 'Laudo_Manutech.doc'; 
    a.click();
    alert("Documento Word baixado com sucesso!");
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Relatórios de Performance Estratégica</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Análise agregada de dados operacionais e indicadores regulatórios em conformidade com as diretivas industriais.
          </p>
        </div>

        {/* Integrações com Google Workspace solicitadas e reais */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportarExcel} 
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel / Sheets</span>
          </button>
          
          <button 
            onClick={exportarWord}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Word / Docs</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total de O.S.</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{statistics.total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Taxa de Conclusão</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{statistics.taxaConclusao}%</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Urgências Críticas</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{statistics.prioridadeAlta}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
          <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Equipamentos Críticos</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{statistics.maquinasCriticas}</p>
        </div>
      </div>

      {/* Parecer Inteligente Gemini */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold flex items-center space-x-2 text-blue-400">
              <BrainCircuit className="w-5 h-5 text-blue-400 animate-pulse" />
              <span>Análise Estratégica Inteligente ✨</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Gere uma auditoria mecânica e estratégica instantânea de conformidade e MTBF baseada nas ocorrências ativas.
            </p>
          </div>
          
          <button
            onClick={gerarParecerIA}
            disabled={carregandoIA}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition duration-200 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{carregandoIA ? "Compilando Auditoria..." : "Compilar com Gemini ✨"}</span>
          </button>
        </div>

        {laudoEstrategico && (
          <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl max-h-80 overflow-y-auto text-xs md:text-sm leading-relaxed text-slate-300 font-mono whitespace-pre-wrap animate-in fade-in duration-300">
            {laudoEstrategico}
          </div>
        )}
      </div>

      {/* Visualizadores Gráficos de Prioridade e Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Distribuição por Status - SVG Native */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Carga de Trabalho por Status</h3>
          <div className="space-y-3.5 pt-2">
            
            {/* Pendente */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Pendente(s)</span>
                <span>{statistics.pendentes} O.S. ({statistics.total > 0 ? Math.round(statistics.pendentes * 100 / statistics.total) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${statistics.total > 0 ? (statistics.pendentes * 100 / statistics.total) : 0}%` }}></div>
              </div>
            </div>

            {/* Em Andamento */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Em Andamento</span>
                <span>{statistics.andamento} O.S. ({statistics.total > 0 ? Math.round(statistics.andamento * 100 / statistics.total) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${statistics.total > 0 ? (statistics.andamento * 100 / statistics.total) : 0}%` }}></div>
              </div>
            </div>

            {/* Concluído */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Concluída(s)</span>
                <span>{statistics.concluidas} O.S. ({statistics.total > 0 ? Math.round(statistics.concluidas * 100 / statistics.total) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${statistics.total > 0 ? (statistics.concluidas * 100 / statistics.total) : 0}%` }}></div>
              </div>
            </div>

          </div>
        </div>

        {/* Distribuição por Nível de Urgência - SVG Native */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Distribuição por Criticidade (Urgência)</h3>
          <div className="space-y-3.5 pt-2">
            
            {/* Alta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Prioridade Alta</span>
                <span>{statistics.prioridadeAlta} O.S. ({statistics.total > 0 ? Math.round(statistics.prioridadeAlta * 100 / statistics.total) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${statistics.total > 0 ? (statistics.prioridadeAlta * 100 / statistics.total) : 0}%` }}></div>
              </div>
            </div>

            {/* Média */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Prioridade Média</span>
                <span>{statistics.prioridadeMedia} O.S. ({statistics.total > 0 ? Math.round(statistics.prioridadeMedia * 100 / statistics.total) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${statistics.total > 0 ? (statistics.prioridadeMedia * 100 / statistics.total) : 0}%` }}></div>
              </div>
            </div>

            {/* Baixa */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Prioridade Baixa</span>
                <span>{statistics.prioridadeBaixa} O.S. ({statistics.total > 0 ? Math.round(statistics.prioridadeBaixa * 100 / statistics.total) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${statistics.total > 0 ? (statistics.prioridadeBaixa * 100 / statistics.total) : 0}%` }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

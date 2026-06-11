/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { Activity, Hourglass, Wrench, Gauge, ShieldAlert, ArrowRight, Play, Check } from "lucide-react";
import * as d3 from "d3";
import { OrdemServico, Equipamento, Colaborador } from "../types";

interface Props {
  ordens: OrdemServico[];
  equipamentos: Equipamento[];
  colaboradorLogado: Colaborador | null;
  onNavigate: (view: any) => void;
  onAlterarStatus: (id: string, novo: 'Em Andamento' | 'Concluído') => void;
  onSimularFalha: () => void;
  simulacaoAtiva: boolean;
  simulacaoPressao: number;
  simulacaoTempe: number;
  simulacaoStatus: 'Aviso' | 'Resolvido' | 'Urgente';
  onAcoesSimulacao: (acao: 'aprovar_gerar' | 'cancelar_aliviar') => void;
}

export const DashboardView: React.FC<Props> = ({
  ordens,
  equipamentos,
  colaboradorLogado,
  onNavigate,
  onAlterarStatus,
  onSimularFalha,
  simulacaoAtiva,
  simulacaoPressao,
  simulacaoTempe,
  simulacaoStatus,
  onAcoesSimulacao
}) => {
  const [hoveredBar, setHoveredBar] = useState<{
    month: string;
    category: 'Preventiva' | 'Corretiva';
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const [tipoGrafico, setTipoGrafico] = useState<'misto' | 'barras' | 'linhas'>('misto');

  const chartData = useMemo(() => {
    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const list = [];
    const hoje = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const dt = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mIdx = dt.getMonth();
      const mName = nomesMeses[mIdx];
      
      let baselinePreventiva = 0;
      let baselineCorretiva = 0;
      
      // Baselines estáticas elegantes para manter visual rico
      if (i === 4) { baselinePreventiva = 8; baselineCorretiva = 3; }
      else if (i === 3) { baselinePreventiva = 13; baselineCorretiva = 5; }
      else if (i === 2) { baselinePreventiva = 11; baselineCorretiva = 4; }
      else if (i === 1) { baselinePreventiva = 15; baselineCorretiva = 7; }
      else if (i === 0) {
        baselinePreventiva = 10;
        baselineCorretiva = 6;
      }
      
      // Contagem reativa do estado de "ordens"
      const realPreventivas = ordens.filter(o => {
        if (o.tipo !== 'Preventiva') return false;
        const parts = o.data.split('/');
        if (parts.length >= 2) {
          return (parseInt(parts[1], 10) - 1) === mIdx;
        }
        return false;
      }).length;

      const realCorretivas = ordens.filter(o => {
        if (o.tipo !== 'Corretiva') return false;
        const parts = o.data.split('/');
        if (parts.length >= 2) {
          return (parseInt(parts[1], 10) - 1) === mIdx;
        }
        return false;
      }).length;
      
      list.push({
        monthName: mName,
        monthIndex: mIdx,
        Preventiva: baselinePreventiva + realPreventivas,
        Corretiva: baselineCorretiva + realCorretivas,
      });
    }
    
    return list;
  }, [ordens]);

  // Configurações do Gráfico D3
  const width = 500;
  const height = 176;
  const margin = { top: 15, right: 15, bottom: 25, left: 30 };

  const x0 = d3.scaleBand()
    .domain(chartData.map(d => d.monthName))
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.25);

  const keys = ['Preventiva', 'Corretiva'] as const;

  const x1 = d3.scaleBand()
    .domain(keys)
    .rangeRound([0, x0.bandwidth()])
    .padding(0.12);

  const maxVal = d3.max(chartData, (d) => Math.max((d as any).Preventiva, (d as any).Corretiva)) || 20;
  const yDomainMax = Math.ceil((maxVal + 4) / 5) * 5;

  const y = d3.scaleLinear()
    .domain([0, yDomainMax])
    .nice()
    .rangeRound([height - margin.bottom, margin.top]);

  // Coordenadas para o gráfico de linha quando selecionado
  const pontosPreventiva = useMemo(() => {
    return chartData.map(d => {
      const xVal = (x0(d.monthName) || 0) + x0.bandwidth() / 2;
      const yVal = y(d.Preventiva);
      return { x: xVal, y: yVal, val: d.Preventiva, month: d.monthName };
    });
  }, [chartData, x0, y]);

  const pontosCorretiva = useMemo(() => {
    return chartData.map(d => {
      const xVal = (x0(d.monthName) || 0) + x0.bandwidth() / 2;
      const yVal = y(d.Corretiva);
      return { x: xVal, y: yVal, val: d.Corretiva, month: d.monthName };
    });
  }, [chartData, x0, y]);

  const pathPreventiva = useMemo(() => {
    return pontosPreventiva.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
  }, [pontosPreventiva]);

  const pathCorretiva = useMemo(() => {
    return pontosCorretiva.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
  }, [pontosCorretiva]);

  // KPIs
  const kpis = useMemo(() => {
    const pendentes = ordens.filter(o => o.status === "Pendente").length;
    const andamento = ordens.filter(o => o.status === "Em Andamento").length;
    const concluidas = ordens.filter(o => o.status === "Concluído").length;
    const ativas = pendentes + andamento;

    // Cálculo simplificado de MTBF e MTTR mockados para fins de painel regulamentar
    const mtbf = 142; // Horas
    const mttr = 1.8; // Horas
    const disponibilidade = 98.4; // %

    return { pendentes, andamento, concluidas, ativas, mtbf, mttr, disponibilidade };
  }, [ordens]);

  const ativasList = useMemo(() => {
    return ordens.filter(o => o.status !== "Concluído").slice(0, 5);
  }, [ordens]);

  const ordensAtrasadas = useMemo(() => {
    return ordens.filter(o => o.status !== "Concluído" && Date.now() > o.timestamp);
  }, [ordens]);

  const pecasCriticas = useMemo(() => {
    const list: Array<{
      equipamentoNome: string;
      grupoNome: string;
      pecaNome: string;
      quantidade: number;
      nivelMinimo: number;
    }> = [];

    equipamentos.forEach(eq => {
      if (eq.gruposPecas) {
        eq.gruposPecas.forEach(gp => {
          // Normalize and fallback if pecasDetalhes is missing but pecas is defined
          const pecas = gp.pecasDetalhes || (gp.pecas || []).map((pStr, idx) => ({
            id: String(idx),
            nome: pStr,
            quantidade: 0,
            nivelMinimo: 1
          }));

          pecas.forEach(p => {
            const qtd = p.quantidade ?? 0;
            const min = p.nivelMinimo ?? 0;
            if (qtd < min) {
              list.push({
                equipamentoNome: eq.nome,
                grupoNome: gp.nome,
                pecaNome: p.nome,
                quantidade: qtd,
                nivelMinimo: min
              });
            }
          });
        });
      }
    });

    return list;
  }, [equipamentos]);

  return (
    <div className="space-y-8 text-slate-800">
      
      {/* Top Banner de Mensagem Inicial */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 animate-in fade-in duration-300">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Painel Operacional Manutech</h2>
          <p className="text-slate-300 text-xs md:text-sm mt-1">Status global de ativos, indicadores regulamentares de confiabilidade e ordens em tempo real.</p>
        </div>
        
        {/* Simular Falha (Habilitado apenas para Gestor ou Instrutor) */}
        {(colaboradorLogado?.cargo === 'Gestor' || colaboradorLogado?.cargo === 'Instrutor') && (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={onSimularFalha} 
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition text-xs shadow cursor-pointer"
            >
              <Activity className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>Simular Falha de Urgência</span>
            </button>
          </div>
        )}
      </div>

      {/* Console de Simulação Preditiva IoT (Apenas quando a simulação de falha de urgência está ativa) */}
      {simulacaoAtiva && (
        <div className={`p-6 rounded-2xl border transition-all duration-350 animate-in slide-in-from-top-4 ${
          simulacaoStatus === 'Urgente' 
            ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-md shadow-rose-100/50' 
            : 'bg-emerald-50 border-emerald-350 text-emerald-950 shadow-md shadow-emerald-50'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-4 border-slate-200/50">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl ${simulacaoStatus === 'Urgente' ? 'bg-rose-600 text-white animate-bounce' : 'bg-emerald-600 text-white'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] bg-slate-950 text-slate-100 font-extrabold px-2 py-0.5 rounded tracking-wider uppercase font-mono">
                    PROTÓTIPO TELEMETRIA IoT 4.0
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    simulacaoStatus === 'Urgente' ? 'bg-rose-200 text-rose-900 border border-rose-300/40' : 'bg-emerald-250 text-emerald-900 border border-emerald-300/40'
                  }`}>
                    {simulacaoStatus === 'Urgente' ? '🚨 Risco Crítico Ativado' : '✅ Pressão Aliviada'}
                  </span>
                </div>
                <h3 className="font-extrabold text-base mt-1 text-slate-950">
                  {simulacaoStatus === 'Urgente' ? 'Anomalia Detectada no Compressor Radial 03 (Setor Pneumática)' : 'Compressor Radial 03 Normalizado com Sucesso'}
                </h3>
              </div>
            </div>
            
            <button 
              onClick={() => onAcoesSimulacao('cancelar_aliviar')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
            >
              Resetar Simulação
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Leituras Virtuais de Telemetria */}
            <div className="lg:col-span-4 bg-white/50 backdrop-blur-xs p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Telemetria de Sensores Físicos</h4>
              
              {/* Pressão Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1 text-slate-600">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Pressão no Pulmão:</span>
                  </span>
                  <span className={`font-mono font-bold ${simulacaoStatus === 'Urgente' ? 'text-rose-600 text-sm' : 'text-emerald-700'}`}>
                    {simulacaoPressao.toFixed(1)} bar
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${simulacaoStatus === 'Urgente' ? 'bg-rose-600' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min((simulacaoPressao / 16) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Trabalho Normal: 6.0 bar</span>
                  <span className={simulacaoStatus === 'Urgente' ? 'text-rose-500 font-bold' : 'text-slate-400'}>Perigo: &gt; 10.0 bar</span>
                </div>
              </div>

              {/* Temperatura */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1 text-slate-600">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Temperatura de Mancal:</span>
                  </span>
                  <span className={`font-mono font-bold ${simulacaoStatus === 'Urgente' ? 'text-rose-600 text-sm' : 'text-emerald-700'}`}>
                    {simulacaoTempe}°C
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${simulacaoStatus === 'Urgente' ? 'bg-rose-600' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min((simulacaoTempe / 130) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Trabalho Normal: 35.0°C</span>
                  <span className={simulacaoStatus === 'Urgente' ? 'text-rose-500 font-bold' : 'text-slate-400'}>Perigo: &gt; 90.0°C</span>
                </div>
              </div>
            </div>

            {/* Diagnóstico Manutech AI */}
            <div className="lg:col-span-5 bg-white/50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[9px] bg-slate-900 text-slate-100 font-bold px-2 py-0.5 rounded uppercase font-mono">
                  SÍNTESE AUXILIADA POR MANUTECH GRAPH AI
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold mt-2">
                  {simulacaoStatus === 'Urgente' 
                    ? "Alerta Crítico: Bloqueio pneumático nos dutos de compressão resultou em pico de contra-vazão na tubulação de triagem de ar comprimido do galpão de Pneumática do SENAI. Há risco iminente de explosão mecânica se houver insistência de ciclo elétrico."
                    : "Instalação Normalizada com segurança! A válvula bypass de alívio emergencial foi acionada com êxito pelo sistema central de triagem. A pressão interna foi drenada de forma controlada e o equipamento de ar comprimido está em repouso."}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 font-medium italic border-t border-slate-200/40 pt-1">
                {simulacaoStatus === 'Urgente' 
                  ? "Atribuição Recomendada: Despachar Ordem Corretiva com altíssima prioridade para troca do pressostato."
                  : "Status Operacional: Técnico de plantão notificado e instruído para reinspecionar o cabeçote mecânico."}
              </div>
            </div>

            {/* Ações de Gestão de Confiabilidade */}
            <div className="lg:col-span-3 bg-white/50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-center items-center text-center">
              {simulacaoStatus === 'Urgente' ? (
                <div className="space-y-3 w-full">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Fluxo de Triagem do Gestor</p>
                  
                  {/* Se gestor pode aprovar e gerar OS */}
                  {colaboradorLogado?.cargo === 'Gestor' ? (
                    <button
                      onClick={() => onAcoesSimulacao('aprovar_gerar')}
                      className="w-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow cursor-pointer hover:shadow-rose-500/20 flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4 text-white animate-pulse" />
                      <span>Gerar O.S. Emergencial</span>
                    </button>
                  ) : (
                    <div className="bg-slate-100 p-2.5 rounded-lg text-[10px] text-slate-500 font-semibold leading-relaxed border border-slate-200">
                      🔒 Logado como {colaboradorLogado?.nome} ({colaboradorLogado?.cargo}). Apenas Gestor regulamentar pode aprovar o chamado de urgência em Triagem.
                    </div>
                  )}

                  <p className="text-[9px] text-slate-400 leading-normal">
                    Selecione para liberar a Ordem de Serviço regulamentar na fila de campo instantaneamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  <div className="bg-emerald-500/10 text-emerald-800 p-2.5 rounded-xl border border-emerald-500/20 flex flex-col items-center">
                    <Check className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-xs font-extrabold uppercase font-mono">Instalação Segura</span>
                    <span className="text-[10px] text-emerald-700 font-medium mt-0.5">Pressão restabelecida</span>
                  </div>
                  <button
                    onClick={() => onAcoesSimulacao('cancelar_aliviar')}
                    className="w-full bg-slate-900 hover:bg-slate-950 active:scale-95 text-white py-2 rounded-xl text-xs font-bold shadow transition cursor-pointer"
                  >
                    Encerrar Simulador
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerta de Estoque Crítico de Peças */}
      {pecasCriticas.length > 0 && (
        <div id="alerta-estoque-critico" className="bg-amber-50 border border-amber-350 p-5 rounded-2xl shadow-xs text-slate-950 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center space-x-3 text-amber-900">
              <div className="bg-amber-500 text-slate-950 p-2 rounded-xl flex items-center justify-center font-bold shadow-xs">
                <Wrench className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-amber-950 uppercase tracking-tight flex items-center gap-1.5">
                  ⚠️ ALERTA: ESTOQUE DE PEÇAS CRÍTICAS BAIXO!
                </h3>
                <p className="text-amber-850 text-xs mt-0.5 font-semibold leading-relaxed">
                  Os itens listados abaixo estão com níveis de estoque abaixo do nível mínimo tolerável. Reposição exigida.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-3 py-1.5 rounded-full tracking-wider shadow-xs select-none">
              Reposição Recomentada
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pecasCriticas.map((item, idx) => (
              <div key={idx} id={`peca-critica-card-${idx}`} className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs hover:border-amber-400 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white font-mono truncate max-w-[150px]" title={item.equipamentoNome}>
                      {item.equipamentoNome}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100/50 px-2.5 py-0.5 rounded-full font-mono">
                      Qtd: {item.quantidade} / Mín: {item.nivelMinimo}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-900 mt-2">
                    {item.pecaNome}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
                    Grupo: {item.grupoNome}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span className="text-amber-600">Abaixo do nível mínimo</span>
                  <button
                    onClick={() => onNavigate('equipamentos')}
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-0.5 cursor-pointer font-extrabold"
                  >
                    <span>Ver Ativo</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Componente Destaque: O.S. Atrasadas (Somente Gestor) */}
      {colaboradorLogado?.cargo === 'Gestor' && ordensAtrasadas.length > 0 && (
        <div className="bg-rose-50 border border-rose-200/80 p-5 rounded-2xl shadow-sm text-slate-900 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
            <div className="flex items-center space-x-3 text-rose-900">
              <div className="bg-rose-600 text-white p-2 text-rose-100 rounded-xl animate-pulse flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-rose-950 uppercase tracking-tight flex items-center gap-1.5">
                  ⚠️ ALERTA: {ordensAtrasadas.length} O.S. ATRASADA{ordensAtrasadas.length > 1 ? 'S' : ''} DETECTADA{ordensAtrasadas.length > 1 ? 'S' : ''}!
                </h3>
                <p className="text-rose-700 text-xs mt-0.5 font-semibold leading-relaxed">
                  As seguintes pendências ultrapassaram o cronograma técnico estipulado e demandam auditoria regulamentar do Supervisor.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase bg-rose-600 text-white px-3 py-1.5 rounded-full tracking-wider shadow-sm select-none">
              Ação Supervisora Exigida
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordensAtrasadas.map(os => {
              const tempoAtrasoMs = Date.now() - os.timestamp;
              const atrasoDias = Math.floor(tempoAtrasoMs / (1000 * 60 * 60 * 24));
              const atrasoHoras = Math.max(Math.floor(tempoAtrasoMs / (1000 * 60 * 60)), 1);

              return (
                <div key={os.id} className="bg-white p-4 rounded-xl border border-rose-100 shadow-xs hover:border-rose-300 transition flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        os.prioridade === 'Alta' ? 'bg-rose-100 text-rose-850' : 'bg-slate-100 text-slate-650'
                      }`}>
                        {os.tipo}
                      </span>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-100/50 px-2.5 py-0.5 rounded-full font-mono">
                        {atrasoDias > 0 ? `Atrasada: ${atrasoDias} dia(s)` : `Atrasada: ${atrasoHoras} h`}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-800 mt-2 truncate" title={os.equipamento}>
                      {os.equipamento}
                    </h4>

                    <p className="text-[11px] text-slate-600 mt-1 font-semibold leading-relaxed line-clamp-2 shadow-none" title={os.descricao}>
                      {os.descricao}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>Prazo Limite: {os.data}</span>
                    <button
                      onClick={() => onNavigate('ordens')}
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-0.5 cursor-pointer font-bold"
                    >
                      <span>Auditar</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid de KPIs Quantitativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">O.S. Ativas</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.ativas}</p>
            <span className="text-[10px] text-amber-600 font-medium">
              {kpis.pendentes} Pendente(s) • {kpis.andamento} Em Curso
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">MTBF (Média Falhas)</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.mtbf}h</p>
            <span className="text-[10px] text-green-600 font-medium">+12% vs. Ciclo Anterior</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Hourglass className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">MTTR (Tempo de Reparo)</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.mttr}h</p>
            <span className="text-[10px] text-red-600 font-medium">-4.2% (Otimizado)</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Disponibilidade</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{kpis.disponibilidade}%</p>
            <span className="text-[10px] text-emerald-600 font-medium">Meta SENAI 98% superada</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Gauge className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Saúde dos Equipamentos & Gráficos Inline Recorrentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lista de saúde crítica */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>Saúde de Equipamentos Críticos</span>
          </h3>

          <div className="space-y-4">
            {equipamentos.slice(0, 4).map((eq) => {
              const health = eq.status === "Operacional" ? 100 : eq.status === "Em Manutenção" ? 65 : 30;
              const col = health > 80 ? 'text-emerald-600 bg-emerald-50' : health > 50 ? 'text-amber-500 bg-amber-50' : 'text-red-600 bg-red-50';
              const colBar = health > 80 ? 'bg-emerald-500' : health > 50 ? 'bg-amber-400' : 'bg-red-500';

              return (
                <div key={eq.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="truncate max-w-[200px] text-slate-700">{eq.nome}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${col}`}>{health}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${colBar} h-full rounded-full transition-all duration-500`} style={{ width: `${health}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => onNavigate('equipamentos')}
            className="w-full py-2 border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs font-semibold text-slate-500 transition flex items-center justify-center space-x-1"
          >
            <span>Ver Inventário de Máquinas Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gráfico de Tendências e Volume de Manutenção - Interativo D3 */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-visible">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 select-none">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Distribuição Sistemática de O.S. (Últimos Meses)</h3>
              <p className="text-[10px] text-slate-400 font-medium">Volumes comparativos entre categorias de intervenção</p>
            </div>
            
            <div className="flex items-center space-x-1.5 border border-slate-200 bg-slate-50 p-1 rounded-xl self-start sm:self-auto shadow-xs">
              <button
                type="button"
                onClick={() => setTipoGrafico('misto')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  tipoGrafico === 'misto' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Misto (Barras + Linhas)
              </button>
              <button
                type="button"
                onClick={() => setTipoGrafico('barras')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  tipoGrafico === 'barras' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Barras
              </button>
              <button
                type="button"
                onClick={() => setTipoGrafico('linhas')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  tipoGrafico === 'linhas' 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Linhas
              </button>
            </div>
          </div>

          {/* Área do Gráfico SVG com Tooltip Dinâmica */}
          <div className="relative h-44 w-full flex items-center justify-center overflow-visible">
            
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none overflow-visible">
              {/* Linhas de Grade Horizontais */}
              {y.ticks(4).map((t, idx) => (
                <g key={idx}>
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={y(t)}
                    y2={y(t)}
                    stroke="#f1f5f9"
                    strokeWidth={1}
                  />
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={y(t)}
                    y2={y(t)}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={margin.left - 8}
                    y={y(t) + 3}
                    textAnchor="end"
                    className="text-[9px] font-bold font-mono fill-slate-400"
                  >
                    {t}
                  </text>
                </g>
              ))}

              {/* Desenho das Barras Clustered D3 */}
              {(tipoGrafico === 'barras' || tipoGrafico === 'misto') && chartData.map((d) => (
                <g key={d.monthName} transform={`translate(${x0(d.monthName)}, 0)`}>
                  {keys.map((key) => {
                    const val = d[key];
                    const barWidth = x1.bandwidth();
                    const barHeight = height - margin.bottom - y(val);
                    const barX = x1(key) || 0;
                    const barY = y(val);
                    
                    const isHovered = hoveredBar && hoveredBar.month === d.monthName && hoveredBar.category === key;
                    const fillColor = key === 'Preventiva' ? '#2563eb' : '#ef4444'; // Azul vs Vermelho
                    
                    return (
                      <rect
                        key={key}
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={Math.max(barHeight, 2)}
                        fill={fillColor}
                        opacity={hoveredBar ? (isHovered ? 1.0 : 0.3) : (tipoGrafico === 'misto' ? 0.45 : 0.9)}
                        rx={2.5}
                        className="transition-all duration-200 cursor-pointer hover:scale-y-[1.02] origin-bottom hover:brightness-110"
                        onMouseEnter={(e) => {
                          setHoveredBar({
                            month: d.monthName,
                            category: key,
                            value: val,
                            x: (x0(d.monthName) || 0) + barX + barWidth / 2,
                            y: barY
                          });
                        }}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    );
                  })}
                </g>
              ))}

              {/* Desenho do Gráfico de Linha D3 */}
              {(tipoGrafico === 'linhas' || tipoGrafico === 'misto') && (
                <g>
                  {/* Linha Preventiva */}
                  <path
                    d={pathPreventiva}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-xs transition-all duration-300"
                  />

                  {/* Círculos da Preventiva */}
                  {pontosPreventiva.map(p => {
                    const isHovered = hoveredBar && hoveredBar.month === p.month && hoveredBar.category === 'Preventiva';
                    return (
                      <circle
                        key={p.month}
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 4.5}
                        fill="#2563eb"
                        stroke="#fff"
                        strokeWidth={2}
                        className="cursor-pointer transition-all duration-150 hover:scale-125"
                        onMouseEnter={() => {
                          setHoveredBar({
                            month: p.month,
                            category: 'Preventiva',
                            value: p.val,
                            x: p.x,
                            y: p.y
                          });
                        }}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    );
                  })}

                  {/* Linha Corretiva */}
                  <path
                    d={pathCorretiva}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-xs transition-all duration-300"
                  />

                  {/* Círculos da Corretiva */}
                  {pontosCorretiva.map(p => {
                    const isHovered = hoveredBar && hoveredBar.month === p.month && hoveredBar.category === 'Corretiva';
                    return (
                      <circle
                        key={p.month}
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 4.5}
                        fill="#ef4444"
                        stroke="#fff"
                        strokeWidth={2}
                        className="cursor-pointer transition-all duration-150 hover:scale-125"
                        onMouseEnter={() => {
                          setHoveredBar({
                            month: p.month,
                            category: 'Corretiva',
                            value: p.val,
                            x: p.x,
                            y: p.y
                          });
                        }}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    );
                  })}
                </g>
              )}

              {/* Rótulo de Eixo X */}
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={height - margin.bottom}
                y2={height - margin.bottom}
                stroke="#cbd5e1"
                strokeWidth={1.5}
              />
              {chartData.map((d) => (
                <g key={d.monthName}>
                  <text
                    x={(x0(d.monthName) || 0) + x0.bandwidth() / 2}
                    y={height - margin.bottom + 16}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold fill-slate-500 uppercase tracking-wider"
                  >
                    {d.monthName}
                  </text>
                </g>
              ))}
            </svg>

            {/* Tooltip Absoluto em HTML sobreposto ao SVG */}
            {hoveredBar && (
              <div 
                className="absolute pointer-events-none bg-slate-900/95 backdrop-blur-xs border border-slate-700 text-white shadow-xl px-3 py-2 rounded-xl text-[10px] font-medium space-y-0.5 animate-in fade-in zoom-in-95 duration-100 z-50 transition-all"
                style={{
                  left: `${(hoveredBar.x / width) * 100}%`,
                  top: `${(hoveredBar.y / height) * 100 - 10}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">{hoveredBar.month}</p>
                <div className="flex items-center space-x-1.5 pt-0.5 whitespace-nowrap">
                  <span className={`w-2 h-2 rounded-full ${hoveredBar.category === 'Preventiva' ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                  <span className="text-slate-200">
                    {hoveredBar.category}: <b className="text-white text-xs font-mono font-bold">{hoveredBar.value}</b> chamados
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-500 select-none">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">Aproxime o cursor das colunas para auditar volumes expressos</span>
            <div className="flex items-center space-x-3 text-[9px] uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs"></span>
                <span className="text-slate-600">Preventiva</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-xs"></span>
                <span className="text-slate-600">Corretiva</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabela de Próximas Atividades / Intervenções */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Intervenções Técnicas Ativas</h3>
          <button 
            onClick={() => onNavigate('ordens')} 
            className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>Ver Todas as O.S.</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold text-[10px]">Data Planeada</th>
                <th className="px-6 py-3 font-semibold text-[10px]">Equipamento</th>
                <th className="px-6 py-3 font-semibold text-[10px]">Prioridade</th>
                <th className="px-6 py-3 font-semibold text-[10px]">Status</th>
                <th className="px-6 py-3 font-semibold text-center text-[10px]">Ações Operacionais de Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-sm text-slate-700">
              {ativasList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                    Nenhuma manutenção ativa cadastrada no momento! 🎉
                  </td>
                </tr>
              ) : (
                ativasList.map(os => {
                  const corPrioridade = os.prioridade === 'Alta' 
                    ? 'bg-red-50 text-red-700 border border-red-100' 
                    : os.prioridade === 'Média' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                      : 'bg-blue-50 text-blue-700 border border-blue-100';

                  const badgeStatus = os.status === 'Pendente' 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200';

                  // Desativa ações se usuário for 'Instrutor'
                  const isInstrutor = colaboradorLogado?.cargo === "Instrutor";

                  return (
                    <tr key={os.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-3.5 text-xs font-mono text-slate-500 whitespace-nowrap">{os.data}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">{os.equipamento}</td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${corPrioridade}`}>
                          {os.prioridade}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStatus}`}>
                          {os.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex space-x-2 items-center justify-center">
                          {os.status === 'Pendente' ? (
                            <button
                              disabled={isInstrutor}
                              onClick={() => onAlterarStatus(os.id, 'Em Andamento')}
                              className={`text-[10px] bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 cursor-pointer`}
                              title={isInstrutor ? "Instrutores não podem alterar ordens" : "Modificar status para Em Andamento"}
                            >
                              <Play className="w-3 h-3 text-slate-900" />
                              <span>Iniciar</span>
                            </button>
                          ) : (
                            <button
                              disabled={isInstrutor}
                              onClick={() => onAlterarStatus(os.id, 'Concluído')}
                              className={`text-[10px] bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 cursor-pointer`}
                              title={isInstrutor ? "Instrutores não podem alterar ordens" : "Modificar status para Concluído"}
                            >
                              <Check className="w-3 h-3 text-white" />
                              <span>Concluir</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
